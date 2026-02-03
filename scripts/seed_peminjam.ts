import { prisma } from "@lib/prisma";

async function main() {
    const peminjam = await prisma.peminjam.create({
        data: {
            nama: 'Abed Greatvo Suseno',
            nomor_induk: '24613/1835.063',
            kategori: 'SISWA',
            kelas: 'XII RPL B',
        },
    });
    console.log('Created Peminjam:', peminjam);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
