
import { PrismaClient } from "@prisma/client";

// Mocking fetch since we are running in a script context, not browser
// In a real e2e 'local' test we'd hit localhost:3000, but ensuring the server is running is tricky.
// Alternatively, we can assume the server IS running (user's `bun dev`) and fetch against localhost.
// Let's try to hit the running server as that's the best integration test.

const BASE_URL = "http://localhost:3000/api";

async function main() {
    console.log("Starting validation verification...");

    // 1. Test Produk Validation
    // Invalid Payload: Name too long (>50 chars)
    const invalidProduk = {
        kategori: "ASET",
        nama: "This is a very long product name that should definitely exceed the fifty character limit set by the schema",
        kode: "INV-FAIL",
        merk: "Brand",
        model: "Model",
        spesifikasi: "Spec",
        kuantitas: 0
    };

    console.log("Testing Invalid Product Creation (Should Fail)...");
    try {
        const res = await fetch(`${BASE_URL}/produk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invalidProduk)
        });

        const data = await res.json();
        if (res.status === 400 && data.error === "Validation failed") {
            console.log("✅ Passed: API rejected long name as expected.");
            // console.log("Details:", JSON.stringify(data.details, null, 2));
        } else {
            console.error("❌ Failed: API did not return 400 bad request for invalid data.", res.status, data);
            process.exit(1);
        }
    } catch (e) {
        console.error("❌ Failed: Network error or server not running.", e);
        // Fallback: If server isn't running, we cant easily verify via HTTP. 
        // But we can warn the user.
        console.warn("⚠️ Ensure 'bun dev' is running!");
        process.exit(1);
    }

    // 2. Test Valid Produk
    const validProduk = {
        kategori: "ASET",
        nama: "Valid Product " + Date.now(),
        kode: "VAL-" + Date.now(),
        merk: "Brand",
        model: "Model",
        spesifikasi: "Spec",
        kuantitas: 0
    };

    console.log("Testing Valid Product Creation (Should Succeed)...");
    try {
        const res = await fetch(`${BASE_URL}/produk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validProduk)
        });

        if (res.status === 201) {
            console.log("✅ Passed: API accepted valid data.");
        } else {
            const data = await res.json();
            console.error("❌ Failed: API rejected valid data.", res.status, data);
            process.exit(1);
        }
    } catch (e) {
        console.error(e);
        process.exit(1);
    }

    console.log("Validation verification finished successfully.");
}

main();
