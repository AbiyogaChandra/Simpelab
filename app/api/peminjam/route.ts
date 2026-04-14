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

export async function POST(request: Request) {
    try {
        const data = await request.json();

        const peminjam = await prisma.peminjam.create({
            data: {
                kategori: data.kategori,
                nama: data.nama,
                nomor_induk: data.nomor_induk,
                kelas: data.kelas || null
            }
        });

        return NextResponse.json(peminjam);
    } catch (error) {
        console.error("Error creating peminjam:", error);
        return NextResponse.json(
            { error: "Failed to create peminjam" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "No ID provided" }, { status: 400 });

        const data = await request.json();

        const peminjam = await prisma.peminjam.update({
            where: { id },
            data: {
                kategori: data.kategori,
                nama: data.nama,
                nomor_induk: data.nomor_induk,
                kelas: data.kelas || null
            }
        });

        return NextResponse.json(peminjam);
    } catch (error) {
        console.error("Error updating peminjam:", error);
        return NextResponse.json(
            { error: "Failed to update peminjam" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get("action");
        const id = searchParams.get("id");

        if (action === "clear") {
            // Find active pengajuans
            const activePengajuan = await prisma.pengajuan.findMany({
                where: { status: { in: ['DIAJUKAN', 'DIPINJAM', 'TERLAMBAT'] } },
                select: { id_peminjam: true },
                distinct: ['id_peminjam']
            });
            const activePeminjamIds = activePengajuan.map((p: any) => p.id_peminjam);

            // 1. Unlink aktivitas for purely historical wipe
            if (activePeminjamIds.length > 0) {
                await prisma.aktivitas.updateMany({
                    where: {
                        id_peminjam: { notIn: activePeminjamIds, not: null }
                    },
                    data: { id_peminjam: null }
                });
            } else {
                await prisma.aktivitas.updateMany({
                    where: {
                        id_peminjam: { not: null }
                    },
                    data: { id_peminjam: null }
                });
            }

            // 2. Get inactive Pengajuan IDs
            const inactivePengajuan = await prisma.pengajuan.findMany({
                where: { status: 'KEMBALI' },
                select: { id: true }
            });
            const inactivePengajuanIds = inactivePengajuan.map((p: any) => p.id);

            // 3. Wipe DetailProdukPengajuan (Lowest relation)
            if (inactivePengajuanIds.length > 0) {
                await prisma.detailProdukPengajuan.deleteMany({
                    where: {
                        detail_pengajuan: {
                            id_pengajuan: { in: inactivePengajuanIds }
                        }
                    }
                });

                // 4. Wipe DetailPengajuan
                await prisma.detailPengajuan.deleteMany({
                    where: { id_pengajuan: { in: inactivePengajuanIds } }
                });

                // 5. Wipe Pengajuan history
                await prisma.pengajuan.deleteMany({
                    where: { id: { in: inactivePengajuanIds } }
                });
            }

            // 6. Delete Peminjams without active pengajuan
            let deleted;
            if (activePeminjamIds.length > 0) {
                deleted = await prisma.peminjam.deleteMany({
                    where: { id: { notIn: activePeminjamIds } }
                });
            } else {
                deleted = await prisma.peminjam.deleteMany({});
            }

            return NextResponse.json({ message: "Cleared", count: deleted.count });
        }

        if (id) {
            // Check for history
            const pengajuanHistory = await prisma.pengajuan.count({ where: { id_peminjam: id } });
            if (pengajuanHistory > 0) {
                return NextResponse.json({ error: "Gagal menghapus! Peminjam ini memiliki riwayat transaksi/peminjaman." }, { status: 400 });
            }

            // Unlink explicitly if deleting manually
            await prisma.aktivitas.updateMany({
                where: { id_peminjam: id },
                data: { id_peminjam: null }
            });

            const deleted = await prisma.peminjam.delete({ where: { id } });
            return NextResponse.json(deleted);
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error: any) {
        console.error("Error deleting peminjam:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to delete peminjam" },
            { status: 500 }
        );
    }
}
