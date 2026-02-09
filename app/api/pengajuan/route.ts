import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { z } from "zod";
import { logActivity } from "@/lib/activity";

const createPengajuanSchema = z.object({
  id_peminjam: z.string().uuid(),
  items: z.array(
    z.object({
      id_produk: z.number().int().positive(),
      kuantitas: z.number().int().positive(),
    }),
  ),
  catatan: z.string().min(1),
  tanggal_pinjam: z.string().datetime().or(z.string()), // Accept ISO string
  tanggal_kembali: z
    .string()
    .datetime()
    .or(z.string())
    .optional()
    .or(z.literal("")),
});

import { getCurrentSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const take = limitParam ? Math.min(parseInt(limitParam, 10) || 10, 500) : 10;

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
      take,
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

    const { id_peminjam, items, catatan, tanggal_pinjam, tanggal_kembali } =
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

    // Fetch Peminjam details for logging
    const peminjamData = await prisma.peminjam.findUnique({
        where: { id: id_peminjam }
    });

    if (!peminjamData) {
        return NextResponse.json({ error: "Peminjam not found" }, { status: 404 });
    }

    // Transaction to ensure data consistency
    const pengajuan = await prisma.$transaction(async (tx) => {
      // 1. Create Pengajuan
      const newPengajuan = await tx.pengajuan.create({
        data: {
          status: "DIAJUKAN",
          id_peminjam,
          catatan,
          tanggal_pinjam: new Date(tanggal_pinjam),
          tanggal_kembali: parseDate(tanggal_kembali),
          kode_resi,
        },
      });

      const productDescriptions: string[] = [];

      // 2. Process Items
      for (const item of items) {
        // Check Product Category
        const produk = await tx.produk.findUnique({
          where: { id: item.id_produk },
        });

        if (!produk) throw new Error(`Product ID ${item.id_produk} not found`);

        productDescriptions.push(`${item.kuantitas} ${produk.nama}`);

        // Create DetailPengajuan
        await tx.detailPengajuan.create({
          data: {
            id_pengajuan: newPengajuan.id,
            id_produk: item.id_produk,
            kuantitas: item.kuantitas,
          },
        });
        
        // Note: We do NOT assign specific DetailProduk (ASET) or decrement stock (HP) yet.
        // This is strictly a request ("Pengajuan") to be processed by an Admin later.
      }

      // Log Activity
      // Format: "Peminjaman baru : {nama peminjam} - {kelas peminjam} - {nomor induk peminjam} / {requested produks}"
      // Handle empty kelas
      const kelasPart = peminjamData.kelas ? ` - ${peminjamData.kelas}` : "";
      const keterangan = `Peminjaman baru : ${peminjamData.nama}${kelasPart} - ${peminjamData.nomor_induk} / ${productDescriptions.join(", ")}`;

      await logActivity(
        tx, // Pass transaction client
        "Tambah,Peminjaman",
        keterangan,
        null, // id_admin (not applicable for user action)
        id_peminjam // id_peminjam
      );

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
