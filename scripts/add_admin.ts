import { prisma } from "@lib/prisma";
import * as bcrypt from 'bcrypt';

async function main() {
    console.log('Adding admin account...');

    const username = "admin";
    const plainPassword = "admin@123";
    const password = await bcrypt.hash(plainPassword, 12);

    const existingAdmin = await prisma.admin.findUnique({
        where: { username },
    });

    if (existingAdmin) {
        console.log(`Admin '${username}' already exists. Updating password...`);
        await prisma.admin.update({
            where: { username },
            data: { password: password },
        });
        console.log("Admin password updated!");
    } else {
        await prisma.admin.create({
            data: {
                username: username,
                password: password,
            },
        });
        console.log(`Admin '${username}' created!`);
    }

    console.log('Done!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
