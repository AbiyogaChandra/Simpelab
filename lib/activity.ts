import { PrismaClient } from "@prisma/client/extension";

// Re-use existing prisma client instance if possible, or pass it in.
// Since we are in `lib`, we might not want to import the global prisma instance if it causes circular deps, 
// but usually it's fine. For now, I'll accept prisma as an argument to be safe and transaction-friendly.

export async function logActivity(
    prisma: any,
    kategori: string,
    keterangan: string,
    id_admin: string | null = null,
    id_peminjam: string | null = null
) {
    try {
        let adminId = id_admin;
        
        // Only try to find a default admin if neither admin nor peminjam is provided, 
        // OR if only admin was expected but not provided (legacy behavior, though id_peminjam makes this tricky).
        // Let's stick to: if id_admin is explicitly null, we might mean "no admin". 
        // But the previous default was "ADMIN_ID".
        // If we want to support user activities without admin, we should allow adminId to be null.
        
        // Use provided adminId if valid (not placeholder if we kept that, but I'll remove the default "ADMIN_ID" to be cleaner)

        await prisma.aktivitas.create({
            data: {
                kategori,
                keterangan,
                id_admin: adminId,
                id_peminjam: id_peminjam,
                waktu: new Date()
            }
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
        // Don't throw, logging failure shouldn't block main action
    }
}
