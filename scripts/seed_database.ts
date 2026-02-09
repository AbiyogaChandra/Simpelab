import { prisma } from "@lib/prisma";
import * as bcrypt from "bcrypt";

async function main() {
    const peminjamSiswa = await prisma.peminjam.createMany({
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
        }, {
            nama: 'Aida Lutfiah Zahra',
            nomor_induk: '24616/1838.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Aisha Safa Alzena',
            nomor_induk: '24617/1839.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Akhmal Hosamido',
            nomor_induk: '24618/1840.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Akmal Eka Firlana',
            nomor_induk: '24619/1841.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Anggun Zahrani Mutiara',
            nomor_induk: '24620/1842.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Aqilah Anindya Musyahayu',
            nomor_induk: '24621/1843.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Arvand Cahil',
            nomor_induk: '24622/1844.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Ayu Nilam Sari',
            nomor_induk: '24623/1845.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Christian Emmanuel Mercy Danian',
            nomor_induk: '24624/1846.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Defan Zain Pratama',
            nomor_induk: '24625/1847.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Dikan Valentino Putra Pratama',
            nomor_induk: '24626/1848.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Dinda Zasqia Meyla Arini',
            nomor_induk: '24627/1849.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Drajad Kusuma Adi',
            nomor_induk: '24628/1850.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Emmanuel Jason',
            nomor_induk: '24629/1851.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Evan Galen Prissyandi',
            nomor_induk: '24630/1852.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Fabio Manaahil Gani Akbar',
            nomor_induk: '24631/1853.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Ilyasa Daffa Saskara',
            nomor_induk: '24632/1854.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Kayana Abdiellah Ar Rasy',
            nomor_induk: '24633/1855.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'M. Edu Firman Rizqi Ramadhan',
            nomor_induk: '24634/1856.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Merry Christie Magdalena',
            nomor_induk: '24635/1857.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Muhammad Athaillah Deva Ramadhan',
            nomor_induk: '24636/1858.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Muhammad Zafran Al Majid',
            nomor_induk: '24637/1859.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Nadin Arifa Salsabila',
            nomor_induk: '24638/1860.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Neila Adenin Syafitri',
            nomor_induk: '24639/1861.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Quilla Valent Zahwa Pramudya',
            nomor_induk: '24640/1862.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Rahma Tania Putri Lukita',
            nomor_induk: '24641/1863.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Rakha Naufal Azzam',
            nomor_induk: '24642/1864.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Rama Raditya Subakti',
            nomor_induk: '24643/1865.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Rani Oktavia Rizky Pratiwi',
            nomor_induk: '24644/1866.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Salsabila Az Zahra',
            nomor_induk: '24645/1867.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Satriya Bima Mahasura',
            nomor_induk: '24646/1868.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Zahir Raihan Hakim',
            nomor_induk: '24647/1869.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }, {
            nama: 'Zemadyan Angelita',
            nomor_induk: '24648/1870.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        }],
    });
    console.log('Created Peminjam Siswa:', peminjamSiswa);
    const peminjamGuru = await prisma.peminjam.createMany({
        data: [{
            nama: 'Budi Utomo, S.T',
            nomor_induk: '19890401 202221 1 015',
            kategori: 'GURU',
            kelas: null,
        }, {
            nama: 'Dhanang Fitra Riaji, S.Si., M.T.',
            nomor_induk: '19810805 201407 1 003',
            kategori: 'GURU',
            kelas: null,
        }, {
            nama: 'Septi Retno Desi Purnoningtyas, S.Pd.',
            nomor_induk: '19910901 201903 2 024',
            kategori: 'GURU',
            kelas: null,
        }, {
            nama: 'Mohammad Mahmudi, S.Kom., M.Pd.',
            nomor_induk: '19830514 201001 1 018',
            kategori: 'GURU',
            kelas: null,
        }, {
            nama: 'Wuryandaru, S. Pd.',
            nomor_induk: '19790818 200903 1 003',
            kategori: 'GURU',
            kelas: null,
        }],
    });
    console.log('Created Peminjam Guru:', peminjamGuru);
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
