'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (path: string, extraPaths?: string[]) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname.startsWith(path)) return true;
        if (extraPaths && extraPaths.some(p => pathname.startsWith(p))) return true;
        return false;
    };

    const menuItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: (active: boolean) => (
                <iconify-icon
                    icon="typcn:home"
                    height="24"
                />
            )
        },
        {
            name: 'Data Inventaris',
            path: '/data-inventaris',
            extraPaths: ['/create-produk', '/create-barang'],
            icon: (active: boolean) => (
                <iconify-icon
                    icon="bxs:data"
                    height="24"
                />
            )
        },
        {
            name: 'Peminjaman',
            path: '/data-peminjaman',
            icon: (active: boolean) => (
                <iconify-icon
                    icon="icon-park-solid:transaction"
                    height="24"
                />
            )
        },
        {
            name: 'Aktivitas',
            path: '/log-perubahan',
            icon: (active: boolean) => (
                <iconify-icon
                    icon="nrk:live-activity"
                    height="24"
                />
            )
        }
    ];

    return (
        <div className="fixed left-0 top-0 w-[280px] bg-white flex flex-col h-screen shadow-[2px_0_4px_rgba(0,0,0,0.05)] z-[1000] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-2">
                    <Image src="/logo.webp" alt="Simpelab Logo" width={56} height={56} />
                    <span className="text-[#2F516A] text-2xl font-bold">
                        Simpelab
                    </span>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 p-4 flex flex-col gap-1">
                {menuItems.map((item) => {
                    const active = isActive(item.path, (item as any).extraPaths);
                    return (
                        <Link key={item.path} href={item.path} className="no-underline">
                            <div
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer ${active ? 'text-[#2F516A] bg-[#E5F1F1]' : 'text-[#B5B4C9]'
                                    }`}
                            >
                                {item.icon(active)}
                                <span
                                    className={`text-base
                                        }`}
                                >
                                    {item.name}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Footer Menu */}
            <div className="p-4 border-t border-[#E5E5E5] flex flex-col gap-1">
                {/* Keluar */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 17H4C3.44772 17 3 16.5523 3 16V4C3 3.44772 3.44772 3 4 3H7M14 14L17 10M17 10L14 6M17 10H7" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[#666666] text-base font-normal">
                        Keluar
                    </span>
                </div>
            </div>
        </div>
    );
}