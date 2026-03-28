import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id_detail_pengajuan, detail_produk_id } = body;

        if (!id_detail_pengajuan || !detail_produk_id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate the detail_produk is not already borrowed
        const detailProduk = await prisma.detailProduk.findUnique({
            where: { id: detail_produk_id }
        });

        if (!detailProduk) {
            return NextResponse.json({ error: "Detail Produk not found" }, { status: 404 });
        }

        if (detailProduk.status === 'DIPINJAM') {
            return NextResponse.json({ error: "Barang sudah dipinjam dan tidak dapat didraft" }, { status: 400 });
        }

        // Upsert standard draft relationship
        const existingLink = await prisma.detailProdukPengajuan.findFirst({
            where: {
                id_detail_pengajuan,
                id_detail_produk: detail_produk_id
            }
        });

        if (!existingLink) {
            await prisma.detailProdukPengajuan.create({
                data: {
                    id_detail_pengajuan,
                    id_detail_produk: detail_produk_id
                }
            });
        }

        return NextResponse.json({ message: "Draft tersimpan" });
    } catch (error) {
        console.error("Draft POST Error:", error);
        return NextResponse.json({ error: "Gagal menyimpan draft" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { id_detail_pengajuan, detail_produk_id } = body;

        if (!id_detail_pengajuan || !detail_produk_id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Find the specific link and delete it
        const link = await prisma.detailProdukPengajuan.findFirst({
            where: {
                id_detail_pengajuan,
                id_detail_produk: detail_produk_id
            }
        });

        if (link) {
            await prisma.detailProdukPengajuan.delete({
                where: { id: link.id }
            });
        }

        return NextResponse.json({ message: "Draft terhapus" });
    } catch (error) {
        console.error("Draft DELETE Error:", error);
        return NextResponse.json({ error: "Gagal menghapus draft" }, { status: 500 });
    }
}
