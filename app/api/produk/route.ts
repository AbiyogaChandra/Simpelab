import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { z } from "zod";
import { logActivity } from "@/lib/activity";

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
        const produk = await prisma.produk.findMany();
        return NextResponse.json(produk);
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

        // Log Activity
        await logActivity(
            prisma,
            "Tambah, Barang",
            `Unit baru: ${nama} - ${kode}`
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
