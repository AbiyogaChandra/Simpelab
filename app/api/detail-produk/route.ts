import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const detailProdukSchema = z.object({
    id_produk: z.coerce.number().int().positive(),
    id_lokasi: z.coerce.number().int().positive(),
    status: z.enum(["TERSEDIA", "DIPINJAM"]),
    kondisi: z.enum(["BAIK", "RUSAK"]),
    kode_seri: z.string().optional().or(z.literal("")),
    kode_scan: z.string().optional().or(z.literal("")),
});

export async function GET() {
    try {
        const detailProduk = await prisma.detailProduk.findMany({
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
        const body = await request.json();

        const validation = detailProdukSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.format() },
                { status: 400 }
            );
        }

        const { id_produk, id_lokasi, status, kondisi, kode_seri, kode_scan } = validation.data;

        const detailProduk = await prisma.detailProduk.create({
            data: {
                id_produk,
                id_lokasi,
                status,
                kondisi,
                // Convert empty strings to null for optional fields if preferred, 
                // or keep as string if database allows. Prisma schema says String? 
                // passing undefined/null is best for optional.
                kode_seri: kode_seri || null,
                kode_scan: kode_scan || null,
            },
        });

        // Update quantity in Produk table
        await prisma.produk.update({
            where: { id: id_produk },
            data: {
                kuantitas: {
                    increment: 1,
                },
            },
        });

        return NextResponse.json(detailProduk, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to create detail product" },
            { status: 500 }
        );
    }
}
