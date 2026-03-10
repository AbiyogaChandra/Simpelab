# Simpelab

## Setup

1. Clone repository ini.

```bash
git clone https://github.com/Abiyoga Chandra/projek-ukk.git
```

2. Masuk ke dalam folder projek ini.

```bash
cd projek-ukk
```

3. Download dependencies.

```bash
npm ci
```

4. Generate Prisma Client.

```bash
npx run db:generate
```

5. Buat file database.

```bash
npx run db:push
```

6. Seeding database.

```bash
npm run db:seed
```

7. Start server.

```bash
npm run dev
# atau
yarn dev
# atau
pnpm dev
# atau
bun dev
```

8. Kunjungi [http://localhost:3000](http://localhost:3000) untuk melihat websitenya.
