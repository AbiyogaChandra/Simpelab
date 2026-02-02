import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const lokasiSchema = z.object({
    // Enforce limits: VARCHAR 30, 50
    nama_ruang: z.string().min(1).max(30),
    keterangan: z.string().min(1).max(50),
});

export async function GET() {
    try {
        const lokasi = await prisma.lokasi.findMany();
        return NextResponse.json(lokasi);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch locations" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const validation = lokasiSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.format() },
                { status: 400 }
            );
        }

        const { nama_ruang, keterangan } = validation.data;

        const lokasi = await prisma.lokasi.create({
            data: {
                nama_ruang,
                keterangan,
            },
        });

        return NextResponse.json(lokasi, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create location" },
            { status: 500 }
        );
    }
}
