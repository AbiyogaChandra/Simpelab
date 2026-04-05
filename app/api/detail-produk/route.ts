import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { z } from "zod";
import { logActivity } from "@/lib/activity";
import { getCurrentSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const detailProdukSchema = z.object({
    id_produk: z.coerce.number().int().positive(),
    id_lokasi: z.coerce.number().int().positive(),
    status: z.enum(["TERSEDIA", "DIPINJAM"]),
    kondisi: z.enum(["BAIK", "RUSAK"]),
    kode_seri: z.string().nullable().optional().or(z.literal("")),
    kode_scan: z.string().nullable().optional().or(z.literal("")),
});

/** Parse a request that may be either JSON or multipart/form-data.
 *  Returns the validated schema data plus an optional File object. */
async function parseRequest(request: Request) {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();

        const rawData = {
            id_produk: formData.get("id_produk"),
            id_lokasi: formData.get("id_lokasi"),
            status: formData.get("status"),
            kondisi: formData.get("kondisi"),
            kode_seri: formData.get("kode_seri") ?? undefined,
            kode_scan: formData.get("kode_scan") ?? undefined,
        };

        const fotoEntry = formData.get("foto");
        const fotoFile = fotoEntry instanceof File && fotoEntry.size > 0 ? fotoEntry : null;

        return { rawData, fotoFile };
    } else {
        // Fallback: plain JSON (no photo)
        const body = await request.json();
        return { rawData: body, fotoFile: null };
    }
}

/** Save an uploaded file to public/uploads/detail-produk/ and return the public URL path. */
async function saveFoto(file: File): Promise<string> {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "detail-produk");
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop() ?? "jpg";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return `/uploads/detail-produk/${uniqueName}`;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id_produkParam = searchParams.get('id_produk');
        const idParam = searchParams.get('id');
        const statusParam = searchParams.get('status');
        const namaProdukParam = searchParams.get('nama_produk');

        const whereClause: any = {};
        if (id_produkParam) {
            whereClause.id_produk = parseInt(id_produkParam);
        }
        if (idParam) {
            whereClause.id = parseInt(idParam);
        }
        if (statusParam) {
            whereClause.status = statusParam;
        }
        if (namaProdukParam) {
            whereClause.produk = {
                nama: { contains: namaProdukParam }
            };
        }

        const detailProduk = await prisma.detailProduk.findMany({
            where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
            include: {
                produk: true,
                lokasi: true,
            },
        });
        return NextResponse.json(detailProduk);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch detail products" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { rawData, fotoFile } = await parseRequest(request);

        const validation = detailProdukSchema.safeParse(rawData);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.format() },
                { status: 400 }
            );
        }

        const { id_produk, id_lokasi, status, kondisi, kode_seri, kode_scan } = validation.data;

        // Save photo if provided
        let fotoUrl: string | null = null;
        if (fotoFile) {
            fotoUrl = await saveFoto(fotoFile);
        }

        const detailProduk = await prisma.detailProduk.create({
            data: {
                id_produk,
                id_lokasi,
                status,
                kondisi,
                kode_seri: kode_seri || null,
                kode_scan: kode_scan || null,
                foto: fotoUrl,
            },
        });

        // Update quantity in Produk table
        const produk = await prisma.produk.update({
            where: { id: id_produk },
            data: {
                kuantitas: {
                    increment: 1,
                },
            },
        });

        const session = await getCurrentSession();

        // Log Activity
        await logActivity(
            prisma,
            "Tambah, Detail Produk",
            `Detail Produk Baru: ${produk.kode} - ${kode_seri || 'N/A'}`,
            session?.id_admin
        );

        return NextResponse.json(detailProduk, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to create detail product" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Detail Product ID required" }, { status: 400 });
        }

        const { rawData, fotoFile } = await parseRequest(request);
        const validation = detailProdukSchema.safeParse(rawData);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.format() },
                { status: 400 }
            );
        }

        const { id_produk, id_lokasi, status, kondisi, kode_seri, kode_scan } = validation.data;

        // Save new photo if provided; otherwise keep existing
        let fotoUrl: string | undefined = undefined;
        if (fotoFile) {
            fotoUrl = await saveFoto(fotoFile);
        }

        const detailProduk = await prisma.detailProduk.update({
            where: { id: parseInt(id) },
            data: {
                id_produk,
                id_lokasi,
                status,
                kondisi,
                kode_seri: kode_seri || null,
                kode_scan: kode_scan || null,
                // Only update foto if a new file was uploaded
                ...(fotoUrl !== undefined ? { foto: fotoUrl } : {}),
            },
            include: {
                produk: true
            }
        });

        const session = await getCurrentSession();

        await logActivity(
            prisma,
            "Ubah, Detail Produk",
            `Ubah Detail Produk: ${detailProduk.produk.kode} - ${kode_seri || 'N/A'}`,
            session?.id_admin
        );

        return NextResponse.json(detailProduk);
    } catch (error) {
        console.error("PUT Error:", error);
        return NextResponse.json(
            { error: "Failed to update detail product" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Detail Product ID required" }, { status: 400 });
        }

        // Get the item to find parent produk id
        // Include produk to get the name for logging
        const item = await prisma.detailProduk.findUnique({
            where: { id: parseInt(id) },
            include: { produk: true }
        });

        if (!item) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        // Delete the item
        await prisma.detailProduk.delete({
            where: { id: parseInt(id) },
        });

        // Decrement quantity in parent Produk
        await prisma.produk.update({
            where: { id: item.id_produk },
            data: {
                kuantitas: {
                    decrement: 1,
                },
            },
        });

        const session = await getCurrentSession();

        await logActivity(
            prisma,
            "Hapus, Detail Produk",
            `Hapus Detail Produk: ${item.produk.kode} - ${item.kode_seri || 'N/A'}`,
            session?.id_admin
        );

        return NextResponse.json({ message: "Detail product deleted successfully" });
    } catch (error) {
        console.error("DELETE Error:", error);
        return NextResponse.json(
            { error: "Failed to delete detail product" },
            { status: 500 }
        );
    }
}
