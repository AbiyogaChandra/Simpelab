'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname.startsWith(path)) return true;
        return false;
    };

    const menuItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: (active: boolean) => (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 10L10 2.5L17.5 10M10 17.5V2.5" stroke={active ? "#333333" : "#666666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )
        },
        {
            name: 'Create Produk',
            path: '/create-produk',
            icon: (active: boolean) => (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="12" height="12" rx="2" stroke={active ? "#333333" : "#666666"} strokeWidth="1.5" />
                    <path d="M8 8H12M8 12H12" stroke={active ? "#333333" : "#666666"} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            )
        },
        {
            name: 'Create Barang',
            path: '/create-barang',
            icon: (active: boolean) => (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L10 2L16 6M4 6V16C4 16.5523 4.44772 17 5 17H15C15.5523 17 16 16.5523 16 16V6M4 6L10 10L16 6" stroke={active ? "#333333" : "#666666"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 10V18" stroke={active ? "#333333" : "#666666"} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            )
        },
        {
            name: 'Data Inventaris',
            path: '/data-inventaris',
            icon: (active: boolean) => (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="5" r="3" stroke={active ? "#333333" : "#666666"} strokeWidth="1.5" />
                    <circle cx="5" cy="12" r="2" stroke={active ? "#333333" : "#666666"} strokeWidth="1.5" />
                    <circle cx="15" cy="12" r="2" stroke={active ? "#333333" : "#666666"} strokeWidth="1.5" />
                    <path d="M10 8V15M5 14L10 15L15 14" stroke={active ? "#333333" : "#666666"} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            )
        },
        {
            name: 'Peminjaman',
            path: '/',
            icon: (active: boolean) => (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V4C16 2.89543 15.1046 2 14 2Z" stroke={active ? "#333333" : "#666666"} strokeWidth="1.5" />
                    <path d="M6 6H14M6 10H14M6 14H10" stroke={active ? "#333333" : "#666666"} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            )
        },
        {
            name: 'Aktifitas',
            path: '/log-perubahan',
            icon: (active: boolean) => (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="8" stroke={active ? "#333333" : "#666666"} strokeWidth="1.5" />
                    <path d="M10 6V10L13 13" stroke={active ? "#333333" : "#666666"} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            )
        }
    ];

    return (
        <div className="fixed left-0 top-0 w-[280px] bg-white flex flex-col h-screen shadow-[2px_0_4px_rgba(0,0,0,0.05)] z-[1000] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-3">
                    <Image src="/logo.webp" alt="Simpelab Logo" width={32} height={32} />
                    <span className="text-[#333333] text-xl font-bold">
                        Simpelab
                    </span>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 p-4 flex flex-col gap-1">
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link key={item.path} href={item.path} className="no-underline">
                            <div
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer ${active ? 'bg-[#F5F5F5]' : ''
                                    }`}
                            >
                                {item.icon(active)}
                                <span
                                    className={`text-base ${active ? 'text-[#333333] font-medium' : 'text-[#666666] font-normal'
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
                {/* Pengaturan */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 12C11.1046 12 12 11.1046 12 10C12 8.89543 11.1046 8 10 8C8.89543 8 8 8.89543 8 10C8 11.1046 8.89543 12 10 12Z" stroke="#666666" strokeWidth="1.5" />
                        <path d="M15.6569 8.34315L14.2426 6.92893C14.0479 6.73418 13.7315 6.73418 13.5368 6.92893L12.8284 7.63736C12.4379 8.02788 11.8047 8.02788 11.4142 7.63736L10.7071 6.9303C10.5123 6.73554 10.1959 6.73554 10.0012 6.9303L8.58697 8.34451C8.39221 8.53927 8.39221 8.85565 8.58697 9.05041L9.2954 9.75884C9.68592 10.1494 9.68592 10.7825 9.2954 11.173L8.58834 11.8801C8.39358 12.0749 8.39358 12.3913 8.58834 12.586L10.0026 14.0003C10.1973 14.195 10.5137 14.195 10.7085 14.0003L11.4155 13.2932C11.8061 12.9027 12.4392 12.9027 12.8297 13.2932L13.5382 14.0017C13.7329 14.1964 14.0493 14.1964 14.2441 14.0017L15.6583 12.5875C15.853 12.3927 15.853 12.0763 15.6583 11.8816L14.9508 11.1741C14.5603 10.7836 14.5603 10.1504 14.9508 9.75992L15.6579 9.05286C15.8526 8.8581 15.8526 8.54172 15.6579 8.34696L15.6569 8.34315Z" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="text-[#666666] text-base font-normal">
                        Pengaturan
                    </span>
                </div>

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