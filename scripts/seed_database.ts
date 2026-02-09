import { prisma } from "@lib/prisma";
import * as bcrypt from 'bcrypt';

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

async function main() {
    console.log('Start seeding...');

    // 1. Clean existing data
    console.log('Cleaning database...');
    await prisma.aktivitas.deleteMany();
    await prisma.detailProdukPengajuan.deleteMany();
    await prisma.detailPengajuan.deleteMany();
    await prisma.pengajuan.deleteMany();
    await prisma.detailProduk.deleteMany();
    await prisma.produk.deleteMany();
    await prisma.lokasi.deleteMany();
    await prisma.peminjam.deleteMany();
    await prisma.session.deleteMany();
    await prisma.admin.deleteMany();

    // 2. Create Admin
    console.log('Creating Admin...');
    const password = await bcrypt.hash("admin", 12);
    const admin = await prisma.admin.create({
        data: {
            username: "admin",
            password: password,
        },
    });

    // 3. Create Locations
    console.log('Creating Locations...');
    const locationsData = [
        { nama_ruang: 'Ruang TKJ 1', keterangan: 'Lemari A Baris 1' },
        { nama_ruang: 'Ruang TKJ 1', keterangan: 'Lemari A Baris 2' },
        { nama_ruang: 'Ruang TKJ 2', keterangan: 'Lemari Besi' },
        { nama_ruang: 'Lab Komputer', keterangan: 'Rak Server' },
        { nama_ruang: 'Gudang TKJ', keterangan: 'Rak Kabel' },
        { nama_ruang: 'Gudang TKJ', keterangan: 'Box Penyimpanan A' },
        { nama_ruang: 'Kantor Guru', keterangan: 'Lemari Kaca' },
    ];

    // Use upsert or createMany? createMany is simpler since we wiped data
    // But createMany doesn't return created records in all databases easily.
    // We'll map create individually to get IDs.
    const locations = [];
    for (const loc of locationsData) {
        const l = await prisma.lokasi.create({ data: { ...loc, id_diubah_oleh: admin.id } });
        locations.push(l);
    }

    // 4. Create Products
    console.log('Creating Products...');
    const productsData = [
        { nama: 'Laptop', kode: 'LTP0001', merk: 'Lenovo', model: 'T480', spesifikasi: 'i5, 8GB RAM, 256GB SSD', kategori: 'ASET' },
        { nama: 'Laptop', kode: 'LTP0002', merk: 'ASUS', model: 'G531', spesifikasi: 'i7, 16GB RAM, GTX 1650', kategori: 'ASET' },
        { nama: 'Proyektor', kode: 'PRJ0001', merk: 'Epson', model: 'EB-X700', spesifikasi: 'HDMI, VGA', kategori: 'ASET' },
        { nama: 'Routerboard', kode: 'RB0001', merk: 'Mikrotik', model: 'RB951Ui', spesifikasi: '5 Port, Wireless', kategori: 'ASET' },
        { nama: 'Kabel', kode: 'KBL0001', merk: 'Belden', model: 'Cat6', spesifikasi: 'Per Meter', kategori: 'HP' },
        { nama: 'Pasta Prosesor', kode: 'TP0001', merk: 'DeepCool', model: 'Z5', spesifikasi: 'Tube', kategori: 'HP' },
        { nama: 'Tang Crimping', kode: 'TC0001', merk: 'Tekiro', model: 'RJ45/RJ11', spesifikasi: 'Hijau', kategori: 'ASET' },
    ];

    const products = [];
    for (const p of productsData) {
        const prod = await prisma.produk.create({
            data: {
                ...p,
                kategori: p.kategori as any,
                kuantitas: 0, // Will update later
                id_diubah_oleh: admin.id
            }
        });
        products.push(prod);
    }

    // 5. Create Detail Produk (Inventory)
    console.log('Creating Inventory...');
    const detailProduks = [];

    for (const prod of products) {
        const isAset = prod.kategori === 'ASET';
        const count = isAset ? getRandomInt(3, 8) : getRandomInt(20, 50); // Assets fewer than HP

        let createdCount = 0;

        for (let i = 0; i < count; i++) {
            const serial = isAset ? `${prod.kode}-SN-${1000 + i}` : null;
            const location = getRandomElement(locations);

            const dp = await prisma.detailProduk.create({
                data: {
                    id_produk: prod.id,
                    id_lokasi: location.id,
                    status: 'TERSEDIA',
                    kondisi: 'BAIK',
                    kode_seri: serial,
                    kode_scan: serial ? `${prod.kode}-${serial}` : null,
                    id_diubah_oleh: admin.id
                }
            });
            detailProduks.push(dp);
            createdCount++;
        }

        // Update Product Quantity
        await prisma.produk.update({
            where: { id: prod.id },
            data: { kuantitas: createdCount }
        });

        // Log creation
        await prisma.aktivitas.create({
            data: {
                waktu: new Date(),
                kategori: 'Buat',
                keterangan: `Menambahkan ${createdCount} unit ${prod.nama}`,
                id_admin: admin.id
            }
        });
    }

    // 6. Create Peminjam (Students/Teachers)
    console.log('Creating Peminjam...');

    // Original list of students
    const peminjamSiswaData = [
        { nama: 'Abed Greatvo Suseno', nomor_induk: '24613/1835.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Abiyoga Permana Chandra', nomor_induk: '24614/1836.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Adinda Fathimatuzzahro', nomor_induk: '24615/1837.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Aida Lutfiah Zahra', nomor_induk: '24616/1838.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Aisha Safa Alzena', nomor_induk: '24617/1839.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Akhmal Hosamido', nomor_induk: '24618/1840.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Akmal Eka Firlana', nomor_induk: '24619/1841.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Anggun Zahrani Mutiara', nomor_induk: '24620/1842.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Aqilah Anindya Musyahayu', nomor_induk: '24621/1843.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Arvand Cahil', nomor_induk: '24622/1844.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Ayu Nilam Sari', nomor_induk: '24623/1845.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Christian Emmanuel Mercy Danian', nomor_induk: '24624/1846.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Defan Zain Pratama', nomor_induk: '24625/1847.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Dikan Valentino Putra Pratama', nomor_induk: '24626/1848.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Dinda Zasqia Meyla Arini', nomor_induk: '24627/1849.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Drajad Kusuma Adi', nomor_induk: '24628/1850.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Emmanuel Jason', nomor_induk: '24629/1851.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Evan Galen Prissyandi', nomor_induk: '24630/1852.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Fabio Manaahil Gani Akbar', nomor_induk: '24631/1853.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Ilyasa Daffa Saskara', nomor_induk: '24632/1854.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Kayana Abdiellah Ar Rasy', nomor_induk: '24633/1855.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'M. Edu Firman Rizqi Ramadhan', nomor_induk: '24634/1856.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Merry Christie Magdalena', nomor_induk: '24635/1857.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Muhammad Athaillah Deva Ramadhan', nomor_induk: '24636/1858.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Muhammad Zafran Al Majid', nomor_induk: '24637/1859.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Nadin Arifa Salsabila', nomor_induk: '24638/1860.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Neila Adenin Syafitri', nomor_induk: '24639/1861.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Quilla Valent Zahwa Pramudya', nomor_induk: '24640/1862.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Rahma Tania Putri Lukita', nomor_induk: '24641/1863.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Rakha Naufal Azzam', nomor_induk: '24642/1864.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Rama Raditya Subakti', nomor_induk: '24643/1865.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Rani Oktavia Rizky Pratiwi', nomor_induk: '24644/1866.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Salsabila Az Zahra', nomor_induk: '24645/1867.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Satriya Bima Mahasura', nomor_induk: '24646/1868.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Zahir Raihan Hakim', nomor_induk: '24647/1869.063', kategori: 'SISWA', kelas: 'XII RPL B' },
        { nama: 'Zemadyan Angelita', nomor_induk: '24648/1870.063', kategori: 'SISWA', kelas: 'XII RPL B' }
    ];

    const peminjams = [];
    for (const s of peminjamSiswaData) {
        const p = await prisma.peminjam.create({
            data: {
                nama: s.nama,
                nomor_induk: s.nomor_induk,
                kelas: s.kelas,
                kategori: 'SISWA'
            }
        });
        peminjams.push(p);
    }

    // Original list of teachers
    const peminjamGuruData = [
        { nama: 'Budi Utomo, S.T', nomor_induk: '19890401 202221 1 015', kategori: 'GURU' },
        { nama: 'Dhanang Fitra Riaji, S.Si., M.T.', nomor_induk: '19810805 201407 1 003', kategori: 'GURU' },
        { nama: 'Septi Retno Desi Purnoningtyas, S.Pd.', nomor_induk: '19910901 201903 2 024', kategori: 'GURU' },
        { nama: 'Mohammad Mahmudi, S.Kom., M.Pd.', nomor_induk: '19830514 201001 1 018', kategori: 'GURU' },
        { nama: 'Wuryandaru, S. Pd.', nomor_induk: '19790818 200903 1 003', kategori: 'GURU' }
    ];

    for (const g of peminjamGuruData) {
        const p = await prisma.peminjam.create({
            data: {
                nama: g.nama,
                nomor_induk: g.nomor_induk,
                kelas: null,
                kategori: 'GURU'
            }
        });
        peminjams.push(p);
    }

    // 7. Create Pengajuan (Loan Requests)
    console.log('Creating Pengajuan...');
    const loanStatuses = ['DIAJUKAN', 'DIPINJAM', 'KEMBALI', 'TERLAMBAT'];

    // Create 15 random loans
    for (let i = 0; i < 15; i++) {
        const peminjam = getRandomElement(peminjams);
        const status = getRandomElement(loanStatuses);

        const tanggalPinjam = new Date();
        tanggalPinjam.setDate(tanggalPinjam.getDate() - getRandomInt(0, 7)); // Within last week

        let tanggalKembali = null;
        if (status === 'KEMBALI' || status === 'TERLAMBAT') {
            const returnDate = new Date(tanggalPinjam);
            returnDate.setDate(returnDate.getDate() + getRandomInt(1, 3));
            if (status === 'TERLAMBAT') {
                // If terlambat, current date > due date? 
                // Schema: tanggal_kembali implies actual return date or expected return date?
                // Usually expected. If actual return happens, status -> KEMBALI.
                // Let's assume tanggal_kembali is EXPECTED return date.
                // If status is KEMBALI, maybe we need another field for actual return?
                // Or simply: KEMBALI means it was returned.
            }
            // For now specific logic:
            // If KEMBALI, set tanggal_kembali to when it WAS returned (past).
            tanggalKembali = new Date(tanggalPinjam);
            tanggalKembali.setDate(tanggalKembali.getDate() + 1);
        } else {
            // For active loans, set expected return date
            const expected = new Date(tanggalPinjam);
            expected.setDate(expected.getDate() + 1);
            tanggalKembali = expected;
        }

        const pengajuan = await prisma.pengajuan.create({
            data: {
                status: status as any,
                id_peminjam: peminjam.id,
                catatan: `Keperluan Praktikum ${i + 1}`,
                tanggal_pinjam: tanggalPinjam,
                tanggal_kembali: tanggalKembali,
                kode_resi: `L-${1000 + i}`,
                id_diubah_oleh: admin.id
            }
        });

        // Add Items to Loan
        const numItems = getRandomInt(1, 2);
        for (let j = 0; j < numItems; j++) {
            const product = getRandomElement(products);
            const qty = 1; // Keep simple

            const detailPengajuan = await prisma.detailPengajuan.create({
                data: {
                    id_pengajuan: pengajuan.id,
                    id_produk: product.id,
                    kuantitas: qty
                }
            });

            // If status is NOT DIAJUKAN, we need to assign actual DetailProduk
            if (status !== 'DIAJUKAN') {
                // Find available detail produk for this product
                // Note: In real scenarios, status might be DIPINJAM.
                // The seed script runs sequentially, but we might have assigned allocation in previous iterations.
                // We need to fetch FRESH availables.
                const availableUnits = await prisma.detailProduk.findMany({
                    where: { id_produk: product.id, status: 'TERSEDIA' },
                    take: qty
                });

                for (const unit of availableUnits) {
                    // Update unit status
                    // If KEMBALI, it's currently TERSEDIA (returned), but was historically linked.
                    // If DIPINJAM/TERLAMBAT, it's currently DIPINJAM.

                    if (status === 'DIPINJAM' || status === 'TERLAMBAT') {
                        await prisma.detailProduk.update({
                            where: { id: unit.id },
                            data: { status: 'DIPINJAM' }
                        });
                    }

                    // Link
                    await prisma.detailProdukPengajuan.create({
                        data: {
                            id_detail_pengajuan: detailPengajuan.id,
                            id_detail_produk: unit.id
                        }
                    });
                }
            }
        }

        // Log Activity
        await prisma.aktivitas.create({
            data: {
                waktu: new Date(),
                kategori: status === 'DIAJUKAN' ? 'Buat' : 'Ubah',
                keterangan: `Peminjaman ${status} oleh ${peminjam.nama}`,
                id_admin: admin.id
            }
        });
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
