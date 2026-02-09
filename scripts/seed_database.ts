import { prisma } from "@lib/prisma";
import * as bcrypt from "bcrypt";

async function main() {
    const peminjam = await prisma.peminjam.createMany({
        data: [{
            nama: 'Abed Greatvo Suseno',
            nomor_induk: '24613/1835.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Abiyoga Permana Chandra',
            nomor_induk: '24614/1836.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Adinda Fathimatuzzahro',
            nomor_induk: '24615/1837.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }],
    });
    console.log('Created Peminjam:', peminjam);
    const produk = await prisma.produk.createMany({
        data: [{
            id: 1,
            kategori: 'ASET',
            nama: 'Routerboard',
            kode: 'RB0001',
            merk: 'MIKROTIK',
            model: 'RB951Ui-2nD-HAP',
            spesifikasi: 'Adaptor 24v 800mA; hAP Series'
        }, {
            id: 2,
            kategori: 'ASET',
            nama: 'Kompresor Angin',
            kode: 'KA0001',
            merk: 'MATRIX',
            model: 'OFS750-25',
            spesifikasi: '1.0HP 25LT - OIL LESS'
        }, {
            id: 3,
            kategori: 'HP',
            nama: 'Tissue Coreless',
            kode: 'TC0001',
            merk: 'JOLLY KULINER',
            model: '2 ply',
            spesifikasi: 'Roll'
        }],
    });
    console.log('Created Produk:', produk);
    const lokasi = await prisma.lokasi.createMany({
        data: [{
            id: 1,
            nama_ruang: 'Ruang TKJ 1',
            keterangan: 'Lemari A Baris 1'
        }, {
            id: 2,
            nama_ruang: 'Ruang TKJ 2',
            keterangan: 'Lemari B Baris 3'
        }, {
            id: 3,
            nama_ruang: 'Gudang TKJ',
            keterangan: 'Lemari C Baris 2'
        }],
    });
    console.log('Created Lokasi:', lokasi);

    const password = await bcrypt.hash("admin", 12);
    const admin = await prisma.admin.upsert({
        where: { username: "admin" },
        update: {},
        create: {
            username: "admin",
            password: password,
        },
    });
    console.log("Created/Updated Admin:", admin);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
