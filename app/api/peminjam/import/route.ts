import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        if (!Array.isArray(body)) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        const items = body as any[];
        let imported = 0;
        let duplicates = 0;

        for (const item of items) {
            // Data sanitization
            const nomorInduk = String(item.nomor_induk).trim();
            if (!nomorInduk) continue; // Skip invalid

            const existing = await prisma.peminjam.findUnique({ where: { nomor_induk: nomorInduk }});
            if (existing) {
                duplicates++;
                continue;
            }

            const k = String(item.kategori || '').toUpperCase();
            const kategori = (k === 'GURU' || k === 'SISWA') ? k : 'SISWA';

            await prisma.peminjam.create({
                data: {
                    nama: String(item.nama || 'Tanpa Nama').trim(),
                    nomor_induk: nomorInduk,
                    kategori: kategori as 'GURU' | 'SISWA',
                    kelas: item.kelas ? String(item.kelas).trim() : null
                }
            });
            imported++;
        }

        return NextResponse.json({ message: "Import completed", imported, duplicates }, { status: 200 });

    } catch (e) {
        console.error("Import error:", e);
        return NextResponse.json({ error: "Failed to import peminjam" }, { status: 500 });
    }
}
