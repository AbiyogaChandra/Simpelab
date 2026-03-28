import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { generatePdfStream } from "./pdfRenderer";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const id = params.id;

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

        const peminjam = pengajuan.peminjam;

        const itemsList: any[] = [];
        pengajuan.detail_pengajuan.forEach((dp: any) => {
            if (dp.detail_produk_pengajuan && dp.detail_produk_pengajuan.length > 0) {
                dp.detail_produk_pengajuan.forEach((dpp: any) => {
                    const sn = dpp.detail_produk.kode_seri || `ID:${dpp.detail_produk.id}`;
                    const fullKode = dpp.detail_produk.kode_scan || `${dp.produk.kode} - ${sn}`;
                    itemsList.push({ name: dp.produk.nama, code: fullKode, qty: '1' });
                });
            } else {
                itemsList.push({ name: dp.produk.nama, code: dp.produk.kode, qty: dp.kuantitas.toString() });
            }
        });

        // Generate PDF Stream cleanly through the TSX wrapper
        const pdfStream = await generatePdfStream(pengajuan, peminjam, itemsList);

        // Accumulate chunks into Buffer
        const chunks: any[] = [];
        for await (const chunk of pdfStream as any) {
            chunks.push(chunk);
        }
        const pdfBuffer = Buffer.concat(chunks);

        return new NextResponse(pdfBuffer as unknown as BodyInit, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="Surat_Peminjaman_${pengajuan.kode_resi}.pdf"`,
            },
        });

    } catch (error) {
        console.error("React-PDF Generation Error:", error);
        return NextResponse.json({ error: "Failed to generate PDF document" }, { status: 500 });
    }
}
