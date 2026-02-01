import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const product = await prisma.produk.findUnique({
            where: { id: Number(id) },
            include: {
                detail_produk: {
                    include: {
                        lokasi: true,
                    },
                },
            },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch product details" },
            { status: 500 }
        );
    }
}
