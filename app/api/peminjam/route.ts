import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query");

        if (!query) {
            return NextResponse.json([]);
        }

        const kategori = searchParams.get("kategori"); // 'GURU' or 'SISWA'

        const whereClause: any = {
            OR: [
                { nama: { contains: query || "" } },
                { nomor_induk: { contains: query || "" } },
            ],
        };

        if (kategori) {
            whereClause.kategori = kategori.toUpperCase();
        }

        const peminjam = await prisma.peminjam.findMany({
            where: whereClause,
            take: 10,
        });

        return NextResponse.json(peminjam);
    } catch (error) {
        console.error("Error fetching peminjam:", error);
        return NextResponse.json(
            { error: "Failed to fetch peminjam" },
            { status: 500 }
        );
    }
}
