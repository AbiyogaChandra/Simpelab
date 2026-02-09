import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { z } from "zod";
import { logActivity } from "@/lib/activity";
import { getCurrentSession } from "@/lib/auth";

const produkSchema = z.object({
    kategori: z.enum(["ASET", "HP"]),
    // Enforce limits from schema: VARCHAR 50, 32, 50, 50, 100
    nama: z.string().min(1).max(50),
    kode: z.string().min(1).max(32),
    merk: z.string().min(1).max(50),
    model: z.string().min(1).max(50),
    spesifikasi: z.string().min(1).max(100),
    kuantitas: z.number().int().nonnegative().optional(),
});

export async function GET() {
    try {
        const produk = await prisma.produk.findMany({
            include: {
                _count: {
                    select: {
                        detail_produk: {
                            where: {
                                status: {
                                    not: 'DIPINJAM'
                                }
                            }
                        }
                    }
                }
            }
        });

        const session = await getCurrentSession();

        const formattedProduk = produk.map(p => {
            const stok = p.kategori === 'HP' ? p.kuantitas : p._count.detail_produk;
            
            if (!session) {
                return {
                    id: p.id,
                    nama: p.nama,
                    stok
                };
            }
            
            return {
                ...p,
                stok
            };
        });

        return NextResponse.json(formattedProduk);
    } catch (error) {
        console.error("GET Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate body
        const validation = produkSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.format() },
                { status: 400 }
            );
        }

        const { kategori, nama, kode, merk, model, spesifikasi, kuantitas } = validation.data;

        // Check for unique kode
        const existingProduk = await prisma.produk.findFirst({
            where: { kode }
        });

        if (existingProduk) {
             return NextResponse.json(
                { error: "Kode produk sudah digunakan" },
                { status: 409 }
            );
        }

        const produk = await prisma.produk.create({
            data: {
                kategori,
                nama,
                kode,
                merk,
                model,
                spesifikasi,
                kuantitas: kuantitas || 0,
            },
        });

        const session = await getCurrentSession();

        // Log Activity
        await logActivity(
            prisma,
            "Tambah, Produk",
            `Produk Baru: ${nama} - ${kode}`,
            session?.id_admin
        );

        return NextResponse.json(produk, { status: 201 });
    } catch (error) {
        console.error("POST Error:", error);
        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        const body = await request.json();
        const validation = produkSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.format() },
                { status: 400 }
            );
        }

        const { kategori, nama, kode, merk, model, spesifikasi } = validation.data;

        // Check for unique kode (excluding current product)
        const existingProduk = await prisma.produk.findFirst({
            where: {
                kode,
                NOT: {
                    id: parseInt(id)
                }
            }
        });

        if (existingProduk) {
             return NextResponse.json(
                { error: "Kode produk sudah digunakan" },
                { status: 409 }
            );
        }

        const produk = await prisma.produk.update({
            where: { id: parseInt(id) },
            data: {
                kategori,
                nama,
                kode,
                merk,
                model,
                spesifikasi,
            },
        });


        const session = await getCurrentSession();

        await logActivity(
            prisma,
            "Update, Produk",
            `Ubah Produk: ${nama} - ${kode}`,
            session?.id_admin
        );

        return NextResponse.json(produk);
    } catch (error) {
        console.error("PUT Error:", error);
        return NextResponse.json(
            { error: "Failed to update product" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        // Check for dependencies
        const existingDetails = await prisma.detailProduk.count({
            where: { id_produk: parseInt(id) }
        });

        if (existingDetails > 0) {
            return NextResponse.json(
                { error: "Tidak dapat menghapus produk ini karena masih memiliki detail produk (stok)." },
                { status: 400 }
            );
        }

        const produk = await prisma.produk.delete({
            where: { id: parseInt(id) },
        });

        const session = await getCurrentSession();

        await logActivity(
            prisma,
            "Hapus, Produk",
            `Hapus Produk: ${produk.nama} - ${produk.kode}`,
            session?.id_admin
        );

        return NextResponse.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("DELETE Error:", error);
        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 }
        );
    }
}
