'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const [toast, setToast] = useState<{ title: string, message: string } | null>(null);

    useEffect(() => {
        const eventSource = new EventSource('/api/events');
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'NEW_PENGAJUAN') {
                    setToast({ title: data.title, message: data.message });
                    setTimeout(() => setToast(null), 5000);
                }
            } catch (err) {
                console.error("Error parsing SSE:", err);
            }
        };
        return () => eventSource.close();
    }, []);

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
            extraPaths: ['/create-produk', '/create-detail-produk'],
            icon: (active: boolean) => (
                <iconify-icon
                    icon="bxs:data"
                    height="24"
                />
            )
        },
        {
            name: 'Data Peminjam',
            path: '/data-peminjam',
            icon: (active: boolean) => (
                <iconify-icon
                    icon="fluent:people-community-24-filled"
                    height="24"
                />
            )
        },
        {
            name: 'Peminjaman',
            path: '/peminjaman',
            icon: (active: boolean) => (
                <iconify-icon
                    icon="icon-park-solid:transaction"
                    height="24"
                />
            )
        },
        {
            name: 'Aktivitas',
            path: '/aktivitas',
            icon: (active: boolean) => (
                <iconify-icon
                    icon="nrk:live-activity"
                    height="24"
                />
            )
        }
    ];

    return (
        <div className="fixed left-0 top-0 w-[280px] bg-white flex flex-col h-screen shadow-[2px_0_4px_rgba(0,0,0,0.05)] z-[10] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-2">
                    <Image src="/logo.webp" alt="Simpelab Logo" loading='eager' width={56} height={56} />
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
                <div
                    onClick={async () => {
                        try {
                            await fetch('/api/auth/logout', { method: 'POST' });
                            window.location.href = '/login';
                        } catch (error) {
                            console.error('Logout failed', error);
                        }
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-red-50"
                >
                    <iconify-icon
                        icon="humbleicons:logout"
                        height="24"
                        className='text-[#2F516A]'
                    />
                    <span className="text-[#616161] text-base font-normal">
                        Keluar
                    </span>
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div style={{ position: 'fixed', top: '24px', right: '24px', backgroundColor: '#FFFFFF', borderLeft: '4px solid #2F516A', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '8px', padding: '16px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '4px', width: '320px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#333333', fontSize: '14px' }}>{toast.title}</span>
                        <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999999' }}>
                            <iconify-icon icon="mdi:close" height="16" />
                        </button>
                    </div>
                    <span style={{ color: '#666666', fontSize: '14px' }}>{toast.message}</span>
                </div>
            )}
        </div>
    );
}