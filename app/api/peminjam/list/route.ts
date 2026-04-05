import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const data = await prisma.peminjam.findMany({
            orderBy: { nama: 'asc' }
        });
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching list:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
