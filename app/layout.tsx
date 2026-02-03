import IconifyRegistry from "@/components/IconifyRegistry";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-outfit",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Simpelab",
  description: "Sistem Peminjaman Laboratorium",
  icons: {
    icon: '/logo.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={outfit.className}>
        <IconifyRegistry />
        {children}
      </body>
    </html>
  );
}
