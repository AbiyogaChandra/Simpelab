import { PrismaClient } from "@prisma/client/extension";

// Re-use existing prisma client instance if possible, or pass it in.
// Since we are in `lib`, we might not want to import the global prisma instance if it causes circular deps, 
// but usually it's fine. For now, I'll accept prisma as an argument to be safe and transaction-friendly.

export async function logActivity(
    prisma: any, // Using any for now to support TransactionClient types easily
    kategori: string,
    keterangan: string,
    id_admin: string = "ADMIN_ID" // Placeholder, should be replaced with actual admin ID from session
) {
    try {
        // In a real app, we would get the admin ID from the session/token.
        // For now, if id_admin is not provided or is default, we might need a fallback or find an admin.
        // Let's assume there's at least one admin seeded or we fetch one.
        
        let adminId = id_admin;
        if (adminId === "ADMIN_ID") {
            // Fallback: try to find the first admin
            const firstAdmin = await prisma.admin.findFirst();
            if (firstAdmin) {
                adminId = firstAdmin.id;
            } else {
                console.warn("No admin found to link activity log");
                return; // Cannot log without admin
            }
        }

        await prisma.aktivitas.create({
            data: {
                kategori,
                keterangan,
                id_admin: adminId,
                waktu: new Date()
            }
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
        // Don't throw, logging failure shouldn't block main action
    }
}
