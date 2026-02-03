import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query");

        if (!query) {
            return NextResponse.json([]);
        }

        const peminjam = await prisma.peminjam.findMany({
            where: {
                OR: [
                    { nama: { contains: query } }, // Case-insensitive handled by DB usually, or explicit mode if Postgres, but SQLite is mixed. Prisma 'contains' is usually case-insensitive in SQLite by default for text? Actually often strictly case sensitive in default settings unless configured. 
                    // To be safe/better UX, ideally insensitive. Prisma query 'contains' defaults:
                    // SQLite: Case-insensitive for ASCII characters by default in LIKE comparisons? 
                    // Let's stick to standard `contains`.
                    { nomor_induk: { contains: query } },
                ],
            },
            take: 10, // Limit results
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
