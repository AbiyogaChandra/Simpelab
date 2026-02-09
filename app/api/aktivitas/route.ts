import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');

    try {
        const whereClause = (tag && tag !== 'all')
            ? { kategori: { contains: tag } }
            : {};

        const aktivitas = await prisma.aktivitas.findMany({
            where: whereClause,
            include: {
                admin: {
                    select: {
                        username: true
                    }
                }
            },
            orderBy: {
                waktu: 'desc'
            },
            take: 20 // Fetch recent 20 activities
        });

        const formattedAktivitas = aktivitas.map((item) => ({
            id: item.id,
            tags: item.kategori.split(',').map(tag => tag.trim()), // "Tambah, Barang" -> ["Tambah", "Barang"]
            message: item.keterangan,
            timestamp: new Date(item.waktu).toLocaleString('id-ID', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            }),
            user: item.admin?.username || 'Unknown'
        }));

        return NextResponse.json(formattedAktivitas);
    } catch (error) {
        console.error("Error fetching aktivitas:", error);
        return NextResponse.json(
            { error: "Failed to fetch activities" },
            { status: 500 }
        );
    }
}
