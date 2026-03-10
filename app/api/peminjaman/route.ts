import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (id) {
            // Detailed view for "Proses" page
            const pengajuan = await prisma.pengajuan.findUnique({
                where: { id },
                include: {
                    peminjam: true,
                    detail_pengajuan: {
                        include: {
                            produk: true,
                            detail_produk_pengajuan: {
                                include: {
                                    detail_produk: true
                                }
                            }
                        }
                    }
                }
            });

            if (!pengajuan) {
                return NextResponse.json({ error: "Pengajuan not found" }, { status: 404 });
            }
            return NextResponse.json(pengajuan);
        }

        // List view
        const pengajuanList = await prisma.pengajuan.findMany({
            include: {
                peminjam: true,
                detail_pengajuan: {
                    include: {
                        produk: true
                    }
                }
            },
            orderBy: {
                tanggal_pinjam: 'desc'
            }
        });

        return NextResponse.json(pengajuanList);
    } catch (error) {
        console.error("GET Peminjaman Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch peminjaman data" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        const body = await request.json();
        /* 
           Expected body for Status Update:
           { status: "DIPINJAM" | "KEMBALI" | "TERLAMBAT" | "DIAJUKAN", catatan?: string, tanggal_kembali?: Date }
           
           Expected body for Full Update (Edit):
           { 
             status?, 
             catatan?, 
             tanggal_pinjam?, 
             tanggal_kembali?, 
             items?: { id_produk, kuantitas }[] 
           }
           - For now implementing Status/Catatan update primarily for "Simpan" action in Proses page.
        */

        const { status, catatan, tanggal_pinjam, tanggal_kembali, items, quantities } = body;

        // Transaction handling for updates and item linking
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update Pengajuan details
            const updatedPengajuan = await tx.pengajuan.update({
                where: { id },
                data: {
                    status,
                    catatan,
                    tanggal_pinjam: tanggal_pinjam ? new Date(tanggal_pinjam) : undefined,
                    tanggal_kembali: tanggal_kembali ? new Date(tanggal_kembali) : undefined,
                },
                include: {
                    peminjam: true
                }
            });

            // 2. Handle Item Linking (DetailProduk assignments)
            if (items && Array.isArray(items) && items.length > 0) {
                for (const item of items) {
                    const { id_detail_pengajuan, detail_produk_id } = item;

                    if (id_detail_pengajuan && detail_produk_id) {
                        // Check if link already exists to avoid duplicates
                        const existingLink = await tx.detailProdukPengajuan.findFirst({
                            where: {
                                id_detail_pengajuan,
                                id_detail_produk: detail_produk_id
                            }
                        });

                        if (!existingLink) {
                            await tx.detailProdukPengajuan.create({
                                data: {
                                    id_detail_pengajuan,
                                    id_detail_produk: detail_produk_id
                                }
                            });
                        }

                        // Update Status of DetailProduk if Peminjaman is DIPINJAM
                        if (status === 'DIPINJAM') {
                            const updatedDetailProduk = await tx.detailProduk.update({
                                where: { id: detail_produk_id },
                                data: { status: 'DIPINJAM' },
                                include: { produk: true }
                            });

                            // Log Activity for Detail Produk change
                            const session = await getCurrentSession();
                            if (session) {
                                await logActivity(
                                    tx as any, // Need to cast or pass prisma to logActivity if no tx support, but logActivity uses passed client
                                    "Ubah, Detail Produk, Peminjaman",
                                    `Status Detail Produk ${updatedDetailProduk.produk.nama} (ID: ${updatedDetailProduk.id}) dipinjam oleh ${updatedPengajuan.peminjam.nama}`,
                                    session.id_admin
                                );
                            }
                        }
                    }
                }
            }

            // 3. Update Quantities
            if (quantities && Array.isArray(quantities) && quantities.length > 0) {
                for (const q of quantities) {
                    if (q.id && q.kuantitas > 0) {
                        await tx.detailPengajuan.update({
                            where: { id: q.id },
                            data: { kuantitas: q.kuantitas }
                        });
                    }
                }
            }

            // 4. Handle Return (Pengembalian)
            if (status === 'KEMBALI') {
                const { location_name, condition, id_lokasi } = body;
                if ((id_lokasi || location_name) && condition) {
                    let lokasiId = id_lokasi;

                    // If no ID provided but name is present, try to find or create
                    if (!lokasiId && location_name) {
                        let lokasi = await tx.lokasi.findFirst({
                            where: { nama_ruang: location_name }
                        });

                        if (!lokasi) {
                            lokasi = await tx.lokasi.create({
                                data: {
                                    nama_ruang: location_name,
                                    keterangan: 'Lokasi Pengembalian',
                                }
                            });
                        }
                        lokasiId = lokasi.id;
                    }

                    if (lokasiId) {
                        // Update all related detail products
                        const detailPengajuanIds = await tx.detailPengajuan.findMany({
                            where: { id_pengajuan: id },
                            select: { id: true }
                        }).then(res => res.map(r => r.id));

                        const detailProdukPengajuan = await tx.detailProdukPengajuan.findMany({
                            where: { id_detail_pengajuan: { in: detailPengajuanIds } }
                        });

                        for (const dpp of detailProdukPengajuan) {
                            const updatedDetailProduk = await tx.detailProduk.update({
                                where: { id: dpp.id_detail_produk },
                                data: {
                                    status: 'TERSEDIA',
                                    kondisi: condition,
                                    id_lokasi: lokasiId
                                },
                                include: { produk: true }
                            });

                            // Log Activity for Detail Produk return
                            const session = await getCurrentSession();
                            if (session) {
                                await logActivity(
                                    tx as any,
                                    "Ubah, Detail Produk",
                                    `Detail Produk ${updatedDetailProduk.produk.nama} (ID: ${updatedDetailProduk.id}) dikembalikan oleh ${updatedPengajuan.peminjam.nama} dengan kondisi ${condition}`,
                                    session.id_admin
                                );
                            }
                        }
                    }
                }
            }

            return updatedPengajuan;
        });

        const session = await getCurrentSession();
        await logActivity(
            prisma,
            "Ubah, Peminjaman",
            `Ubah Status Peminjaman: ${result.peminjam.nama} - ${status}`,
            session?.id_admin
        );

        return NextResponse.json(result);

    } catch (error) {
        console.error("PUT Peminjaman Error:", error);
        return NextResponse.json(
            { error: "Failed to update peminjaman" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // Check if status is DIAJUKAN (safe to delete)
            const pengajuan = await tx.pengajuan.findUnique({ where: { id } });
            if (!pengajuan) throw new Error("Pengajuan not found");
            if (pengajuan.status !== 'DIAJUKAN') {
                throw new Error("Only 'DIAJUKAN' requests can be deleted");
            }

            // Delete links
            // Note: Cascading delete usually handles this validation, but we can be explicit
            const detailPengajuanIds = await tx.detailPengajuan.findMany({
                where: { id_pengajuan: id },
                select: { id: true }
            }).then(res => res.map(r => r.id));

            await tx.detailProdukPengajuan.deleteMany({
                where: { id_detail_pengajuan: { in: detailPengajuanIds } }
            });

            await tx.detailPengajuan.deleteMany({
                where: { id_pengajuan: id }
            });

            const deleted = await tx.pengajuan.delete({
                where: { id },
                include: { peminjam: true }
            });

            return deleted;
        });

        const session = await getCurrentSession();
        await logActivity(
            prisma,
            "Hapus, Peminjaman",
            `Tolak Peminjaman: ${result.peminjam.nama}`,
            session?.id_admin
        );

        return NextResponse.json({ message: "Pengajuan deleted successfully" });

    } catch (error: any) {
        console.error("DELETE Peminjaman Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete peminjaman" },
            { status: 500 }
        );
    }
}
