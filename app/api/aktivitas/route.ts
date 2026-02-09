import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');

    try {
        const whereClause: any = {};
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const [total, aktivitas] = await prisma.$transaction([
            prisma.aktivitas.count({ where: whereClause }),
            prisma.aktivitas.findMany({
                where: whereClause,
                include: {
                    admin: {
                        select: {
                            username: true
                        }
                    },
                    peminjam: {
                        select: {
                            nama: true
                        }
                    }
                },
                orderBy: {
                    waktu: 'desc'
                },
                skip,
                take: limit
            })
        ]);

        const formattedAktivitas = aktivitas.map((item) => ({
            id: item.id,
            tags: item.kategori.split(',').map(tag => tag.trim()), // "Tambah, Barang" -> ["Tambah", "Barang"]
            message: item.keterangan,
            timestamp: new Date(item.waktu).toLocaleString('id-ID', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            }),
            user: item.admin?.username || item.peminjam?.nama || 'Unknown'
        }));

        return NextResponse.json({
            data: formattedAktivitas,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching aktivitas:", error);
        return NextResponse.json(
            { error: "Failed to fetch activities" },
            { status: 500 }
        );
    }
}
