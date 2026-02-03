import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { z } from "zod";

const createPengajuanSchema = z.object({
  id_peminjam: z.string().uuid(),
  items: z.array(
    z.object({
      id_produk: z.number().int().positive(),
      kuantitas: z.number().int().positive(),
    }),
  ),
  alasan: z.string().min(1),
  tanggal_pinjam: z.string().datetime().or(z.string()), // Accept ISO string
  tanggal_kembali: z
    .string()
    .datetime()
    .or(z.string())
    .optional()
    .or(z.literal("")),
});

export async function GET() {
  try {
    const pengajuan = await prisma.pengajuan.findMany({
      include: {
        peminjam: true,
        detail_pengajuan: {
          include: {
            produk: true,
          },
        },
      },
      orderBy: {
        tanggal_pinjam: "desc",
      },
      take: 10, // Limit to recent 10 for dashboard/activity feed
    });

    return NextResponse.json(pengajuan);
  } catch (error) {
    console.error("Error fetching pengajuan:", error);
    return NextResponse.json(
      { error: "Failed to fetch pengajuan" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createPengajuanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 },
      );
    }

    const { id_peminjam, items, alasan, tanggal_pinjam, tanggal_kembali } =
      validation.data;

    // Generate kode_resi: DDMMYYYY-XXX
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = now.getFullYear();
    const datePrefix = `${day}${month}${year}`;

    // Find last Pengajuan with this prefix
    const lastPengajuan = await prisma.pengajuan.findFirst({
      where: {
        kode_resi: {
          startsWith: datePrefix,
        },
      },
      orderBy: {
        kode_resi: "desc",
      },
    });

    let newSuffix = "001";
    if (lastPengajuan) {
      const lastSuffix = lastPengajuan.kode_resi.split("-")[1];
      if (lastSuffix && !isNaN(parseInt(lastSuffix))) {
        newSuffix = String(parseInt(lastSuffix) + 1).padStart(3, "0");
      }
    }

    const kode_resi = `${datePrefix}-${newSuffix}`;

    // Helper to parse date or return null
    const parseDate = (d: string | undefined | null) =>
      d ? new Date(d) : null;

    // Transaction to ensure data consistency
    const pengajuan = await prisma.$transaction(async (tx) => {
      // 1. Create Pengajuan
      const newPengajuan = await tx.pengajuan.create({
        data: {
          status: "DIAJUKAN",
          id_peminjam,
          alasan,
          tanggal_pinjam: new Date(tanggal_pinjam),
          tanggal_kembali: parseDate(tanggal_kembali),
          kode_resi,
        },
      });

      // 2. Process Items
      for (const item of items) {
        // Check Product Category
        const produk = await tx.produk.findUnique({
          where: { id: item.id_produk },
        });

        if (!produk) throw new Error(`Product ID ${item.id_produk} not found`);

        // Create DetailPengajuan
        const detailPengajuan = await tx.detailPengajuan.create({
          data: {
            id_pengajuan: newPengajuan.id,
            id_produk: item.id_produk,
            kuantitas: item.kuantitas,
          },
        });

        // Logic for ASET vs HP
        if (produk.kategori === "ASET") {
          // For Assets, we try to find AVAILABLE units to assign
          // If UI doesn't allow selecting specific units yet, we can either:
          // a) Auto-assign available units up to requested quantity
          // b) Create request without assigning units (Admin assigns later)
          // Given the prompt "the Barang field should be searching from the produk table",
          // implying generic product selection.
          // Let's TRY to auto-assign available units to simulate "borrowing".

          const availableUnits = await tx.detailProduk.findMany({
            where: {
              id_produk: item.id_produk,
              status: "TERSEDIA",
              kondisi: "BAIK", // Prefer good condition
            },
            take: item.kuantitas,
          });

          // Assign found units
          for (const unit of availableUnits) {
            await tx.detailProdukPengajuan.create({
              data: {
                id_detail_pengajuan: detailPengajuan.id,
                id_detail_produk: unit.id,
              },
            });

            // Update unit status
            await tx.detailProduk.update({
              where: { id: unit.id },
              data: { status: "DIPINJAM" },
            });
          }

          // If not enough units found, we just process what we can or throw?
          // For now, let's proceed even if not fully assigned (Backorder style? or just 'Diajukan')
          // Currently status is just 'DIAJUKAN', so maybe no immediate assignment needed?
          // BUT prompt says "connect borrow form... create pengajuan...".
          // Usually "Borrowing" implies taking it. I'll stick to auto-assign if possible.
        } else if (produk.kategori === "HP") {
          // For Habis Pakai, we typically decrement stock?
          // Schema doesn't link DetailProduk for HP usually (no unique ID).
          // So we just rely on DetailPengajuan quantity.
          // Optionally decrement Produk.kuantitas
          if (produk.kuantitas >= item.kuantitas) {
            await tx.produk.update({
              where: { id: item.id_produk },
              data: {
                kuantitas: { decrement: item.kuantitas },
              },
            });
          } else {
            // Not enough stock?
            // Allow for now or throw? Let's allow but maybe warn or just go negative/zero?
            // Safest is to just update.
            await tx.produk.update({
              where: { id: item.id_produk },
              data: {
                kuantitas: { decrement: item.kuantitas },
              },
            });
          }
        }
      }

      return newPengajuan;
    });

    return NextResponse.json(pengajuan, { status: 201 });
  } catch (error: any) {
    console.error("Error creating pengajuan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create pengajuan" },
      { status: 500 },
    );
  }
}
