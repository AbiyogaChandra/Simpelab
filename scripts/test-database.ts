import "dotenv/config";
import { prisma } from "@lib/prisma";
import bcrypt from "bcrypt";

async function main() {
    console.log("🌱 Starting database seed/test...");

    try {
        // 1. Create Admin
        const hashedPassword = await bcrypt.hash("password123", 10);
        const admin = await prisma.admin.create({
            data: {
                username: `admin_test_${Date.now()}`,
                password: hashedPassword,
            },
        });
        console.log("✅ Created Admin:", admin.username);

        // 2. Create Sesi
        const sesi = await prisma.sesi.create({
            data: {
                id_admin: admin.id,
                token: `TOKEN-${Date.now()}`,
                waktu_kadaluarsa: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
            },
        });
        console.log("✅ Created Sesi for Admin");

        // 3. Create Lokasi
        const lokasi = await prisma.lokasi.create({
            data: {
                nama_ruang: "Lab Komputer 1",
                keterangan: "Lemari A",
            },
        });
        console.log("✅ Created Lokasi:", lokasi.nama_ruang);

        // 4. Create Produk
        const produk = await prisma.produk.create({
            data: {
                nama: "Laptop Dell Latitude",
                kode: "LTP01",
                kategori: "ASET",
                merk: "Dell",
                model: "Latitude 7490",
                spesifikasi: "i7, 16GB RAM, 512GB SSD",
                kuantitas: 10,
            },
        });
        console.log("✅ Created Produk:", produk.nama);

        // 5. Create DetailProduk
        const detailProduk = await prisma.detailProduk.create({
            data: {
                id_produk: produk.id,
                id_lokasi: lokasi.id,
                status: "TERSEDIA",
                kondisi: "BAIK",
                kode_seri: "SN-12345678",
                kode_scan: "LTP01SN-12345678",
            },
        });
        console.log("✅ Created DetailProduk ID:", detailProduk.id);

        // 6. Create Peminjam
        const peminjam = await prisma.peminjam.create({
            data: {
                nama: "Abed Greatvo Suseno",
                nomor_induk: `24613/1835.063`,
                kategori: "SISWA",
                kelas: "XII RPL B",
            },
        });
        console.log("✅ Created Peminjam:", peminjam.nama);

        // 7. Create Pengajuan
        const pengajuan = await prisma.pengajuan.create({
            data: {
                id_peminjam: peminjam.id,
                status: "DIAJUKAN",
                alasan: "Praktikum",
                kode_resi: `RES-${Date.now()}`,
            },
        });
        console.log("✅ Created Pengajuan:", pengajuan.kode_resi);

        // 8. Create DetailPengajuan
        const detailPengajuan = await prisma.detailPengajuan.create({
            data: {
                id_pengajuan: pengajuan.id,
                id_produk: produk.id,
                kuantitas: 1,
            },
        });
        console.log("✅ Created DetailPengajuan for Produk:", produk.nama);

        // 9. Create DetailProdukPengajuan (Allocation)
        const allocation = await prisma.detailProdukPengajuan.create({
            data: {
                id_detail_pengajuan: detailPengajuan.id,
                id_detail_produk: detailProduk.id,
            },
        });
        console.log("✅ Created DetailProdukPengajuan (Allocation) ID:", allocation.id);

        // Verification
        const verifyData = await prisma.pengajuan.findUnique({
            where: { id: pengajuan.id },
            include: {
                peminjam: true,
                detail_pengajuan: {
                    include: {
                        produk: true,
                        detail_produk_pengajuan: {
                            include: {
                                detail_produk: {
                                    include: {
                                        lokasi: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        console.log("\n📦 Verification Data Fetch:");
        console.log("   - Peminjam:", verifyData?.peminjam.nama);
        const dp = verifyData?.detail_pengajuan[0];
        console.log("   - Requested Produk:", dp?.produk.nama);
        const allocated = dp?.detail_produk_pengajuan[0]?.detail_produk;
        console.log("   - Allocated Detail Item ID:", allocated?.id);
        console.log("   - Lokasi Item:", allocated?.lokasi.nama_ruang);

    } catch (e) {
        console.error("❌ Error during seeding:", e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
