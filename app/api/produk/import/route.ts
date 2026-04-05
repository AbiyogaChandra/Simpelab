import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        if (!Array.isArray(body) || body.length === 0) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        const session = await getCurrentSession();

        let importedProductsCount = 0;
        let importedDetailsCount = 0;
        
        // Execute imports one by one sequentially since prisma does not allow conditionally
        // creating dependent nested arrays in bulk.
        await prisma.$transaction(async (tx) => {
            for (const row of body) {
                const {
                    kategori,
                    nama,
                    kode,
                    merk,
                    model,
                    spesifikasi,
                    kuantitas,
                    ruang,
                    keterangan
                } = row;

                // 1. Find or create Produk
                let produk = await tx.produk.findFirst({
                    where: { kode }
                });

                if (!produk) {
                    produk = await tx.produk.create({
                        data: {
                            kategori: kategori as "ASET" | "HP",
                            nama,
                            kode,
                            merk,
                            model: model || "",
                            spesifikasi: spesifikasi || "",
                            kuantitas: 0 // Will be incremented below
                        }
                    });
                    importedProductsCount++;
                }

                // 2. Find or create Lokasi
                let lokasi = await tx.lokasi.findFirst({
                    where: {
                        nama_ruang: ruang,
                        keterangan: keterangan
                    }
                });

                if (!lokasi) {
                    lokasi = await tx.lokasi.create({
                        data: {
                            nama_ruang: ruang,
                            keterangan: keterangan
                        }
                    });
                }

                // 3. Create N physical detailproduk 
                const createdDetails = await tx.detailProduk.createMany({
                    data: Array.from({ length: kuantitas }).map(() => ({
                        id_produk: produk.id,
                        id_lokasi: lokasi.id,
                        status: "TERSEDIA",
                        kondisi: "BAIK",
                        kode_seri: null, // left blank for manual edit later
                        kode_scan: null
                    }))
                });

                importedDetailsCount += createdDetails.count;

                // 4. Update parent Produk Kuantitas
                await tx.produk.update({
                    where: { id: produk.id },
                    data: {
                        kuantitas: {
                            increment: createdDetails.count
                        }
                    }
                });
            }
        });

        if (session) {
            await logActivity(
                prisma,
                "Tambah, Produk",
                `Import CSV/Excel Inventaris: ${importedProductsCount} Produk, ${importedDetailsCount} Barang fisik`,
                session.id_admin
            );
        }

        return NextResponse.json({ 
            message: "Import success", 
            imported_products: importedProductsCount,
            imported_details: importedDetailsCount 
        }, { status: 201 });

    } catch (error: any) {
        console.error("POST /api/produk/import Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process import" },
            { status: 500 }
        );
    }
}
