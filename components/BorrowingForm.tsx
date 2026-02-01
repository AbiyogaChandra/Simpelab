'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface BorrowItem {
    id: number; // local temp id
    produkName: string;
    idProduk: number | null;
    kuantitas: number;
    produkData: any | null;
}

export default function BorrowingForm() {
    const [formData, setFormData] = useState({
        kategori: '',
        identitas: '',
        catatanBarang: '',
        tanggalPinjam: '',
        tanggalKembali: '',
    });

    const [selectedPeminjam, setSelectedPeminjam] = useState<any>(null);

    // Items State
    const [items, setItems] = useState<BorrowItem[]>([
        { id: Date.now(), produkName: '', idProduk: null, kuantitas: 1, produkData: null }
    ]);

    const [peminjamList, setPeminjamList] = useState<any[]>([]);
    const [produkList, setProdukList] = useState<any[]>([]);
    const [filteredProdukList, setFilteredProdukList] = useState<any[]>([]);

    // Track which item is currently searching
    const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

    const [showIdentitasDropdown, setShowIdentitasDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Initial Date and Product Data
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, tanggalPinjam: today }));

        const fetchProduk = async () => {
            try {
                const res = await fetch('/api/produk');
                if (res.ok) {
                    const data = await res.json();
                    setProdukList(data);
                }
            } catch (error) {
                console.error('Error fetching produk:', error);
            }
        };
        fetchProduk();
    }, []);

    // Search Peminjam
    const handleIdentitasSearch = async (query: string) => {
        setFormData(prev => ({ ...prev, identitas: query }));
        setSelectedPeminjam(null);
        if (query.length > 1) {
            try {
                const res = await fetch(`/api/peminjam?query=${query}`);
                if (res.ok) {
                    const data = await res.json();
                    setPeminjamList(data);
                    setShowIdentitasDropdown(true);
                }
            } catch (error) {
                console.error("Error searching peminjam:", error);
            }
        } else {
            setShowIdentitasDropdown(false);
        }
    };

    const handleSelectPeminjam = (peminjam: any) => {
        setFormData(prev => ({ ...prev, identitas: `${peminjam.nama} - ${peminjam.nomor_induk}`, kategori: peminjam.kategori === 'GURU' ? 'guru' : 'murid' }));
        setSelectedPeminjam(peminjam);
        setShowIdentitasDropdown(false);
    };

    // Item Management
    const handleAddItem = () => {
        setItems(prev => [
            ...prev,
            { id: Date.now(), produkName: '', idProduk: null, kuantitas: 1, produkData: null }
        ]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleItemSearch = (index: number, query: string) => {
        const newItems = [...items];
        newItems[index].produkName = query;
        newItems[index].idProduk = null; // Reset selection on typing
        newItems[index].produkData = null;
        setItems(newItems);

        if (query.length > 0) {
            const filtered = produkList.filter(p =>
                p.nama.toLowerCase().includes(query.toLowerCase()) ||
                p.kode.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredProdukList(filtered);
            setActiveItemIndex(index);
        } else {
            setActiveItemIndex(null);
        }
    };

    const handleSelectProduk = (index: number, produk: any) => {
        const newItems = [...items];
        newItems[index].produkName = produk.nama;
        newItems[index].idProduk = produk.id;
        newItems[index].produkData = produk;
        setItems(newItems);
        setActiveItemIndex(null);
    };

    const handleQuantityChange = (index: number, val: string) => {
        const newItems = [...items];
        newItems[index].kuantitas = parseInt(val) || 0;
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPeminjam) {
            alert('Mohon pilih Identitas peminjam.');
            return;
        }

        if (items.length === 0 || items.some(i => !i.idProduk || i.kuantitas <= 0)) {
            alert('Mohon lengkapi data barang (Produk dan Kuantitas valid).');
            return;
        }

        setIsLoading(true);

        const apiData = {
            id_peminjam: selectedPeminjam.id,
            items: items.map(i => ({
                id_produk: i.idProduk,
                kuantitas: i.kuantitas
            })),
            alasan: formData.catatanBarang || '-',
            tanggal_pinjam: formData.tanggalPinjam,
            tanggal_kembali: formData.tanggalKembali || null
        };

        try {
            const response = await fetch('/api/pengajuan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiData)
            });

            if (!response.ok) {
                throw new Error('Failed to submit pengajuan');
            }

            alert('Pengajuan berhasil dikirim!');
            // Reset form
            setFormData({
                kategori: '',
                identitas: '',
                catatanBarang: '',
                tanggalPinjam: new Date().toISOString().split('T')[0],
                tanggalKembali: '',
            });
            setSelectedPeminjam(null);
            setItems([{ id: Date.now(), produkName: '', idProduk: null, kuantitas: 1, produkData: null }]);

        } catch (error) {
            console.error(error);
            alert('Gagal mengirim pengajuan.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
            {/* Left Panel */}
            <div style={{
                width: '50%',
                height: '100vh',
                background: '#415A66',
                position: 'sticky',
                overflow: 'hidden',
                top: 0
            }}>
                <Image
                    src="/illustration.webp"
                    alt="Lab Illustration"
                    fill
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        objectFit: 'cover',
                        objectPosition: 'bottom',
                        display: 'block'
                    }}
                />
                <div style={{
                    position: 'relative',
                    zIndex: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '40px'
                }}>
                    <div style={{ marginBottom: '40px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#FFFFFF',
                            borderRadius: '24px',
                            padding: '4px 8px'
                        }}>
                            <Image src="/logo.webp" alt="Simpelab Logo" width={48} height={48} />
                            <span style={{
                                color: '#2F516A',
                                fontSize: '20px',
                                fontWeight: 700,
                                fontFamily: 'Outfit, sans-serif'
                            }}>
                                Simpelab
                            </span>
                        </div>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{
                            color: '#FEFEFE',
                            fontSize: '24px',
                            fontWeight: 400,
                            lineHeight: '100%',
                            letterSpacing: '0%',
                            marginBottom: '8px',
                            fontFamily: 'Outfit, sans-serif'
                        }}>
                            Welcome To
                        </div>
                        <h1 style={{
                            color: '#FEFEFE',
                            fontSize: '64px',
                            fontWeight: 600,
                            lineHeight: '100%',
                            letterSpacing: '0%',
                            margin: 0,
                            textTransform: 'capitalize',
                            fontFamily: 'Outfit, sans-serif'
                        }}>
                            Simpelab
                        </h1>
                    </div>
                </div>
            </div>

            {/* Right Panel - White Form */}
            <div style={{
                width: '50%',
                background: '#F5F5F5',
                display: 'flex',
                flexDirection: 'column',
                padding: '60px 80px',
                justifyContent: 'center'
            }}>
                <form
                    onSubmit={handleSubmit}
                    style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}
                >
                    {/* Row 1: Kategori and Identitas */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label className="block mb-2.5" style={{ color: '#333333', fontSize: '14px', fontWeight: 600 }}>
                                Kategori
                            </label>
                            <div className="relative">
                                <select
                                    name="kategori"
                                    value={formData.kategori}
                                    onChange={handleChange}
                                    disabled={!!selectedPeminjam}
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                                    style={{
                                        appearance: 'none',
                                        background: selectedPeminjam ? '#F3F4F6' : '#FFFFFF',
                                        fontSize: '14px',
                                        color: formData.kategori ? '#000000' : '#AAAAAA',
                                        height: '48px',
                                        paddingLeft: '40px',
                                        borderColor: '#E0E0E0',
                                        borderRadius: '8px',
                                        cursor: selectedPeminjam ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <option value="">Opsi</option>
                                    <option value="guru">Guru</option>
                                    <option value="murid">Murid</option>
                                </select>
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="4" cy="4" r="1.5" fill="#666666" />
                                        <rect x="6.5" y="2.5" width="3" height="3" rx="0.5" fill="#666666" />
                                        <path d="M11.5 2L13.5 4L11.5 6L9.5 4L11.5 2Z" fill="#666666" />
                                    </svg>
                                </div>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1L6 6L11 1" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: 1, position: 'relative' }}>
                            <label className="block mb-2.5" style={{ color: '#333333', fontSize: '14px', fontWeight: 600 }}>
                                Identitas
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="identitas"
                                    value={formData.identitas}
                                    onChange={(e) => handleIdentitasSearch(e.target.value)}
                                    placeholder="Cari nama atau nomor induk..."
                                    autoComplete="off"
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                                    style={{
                                        fontSize: '14px',
                                        color: selectedPeminjam ? '#333333' : (formData.identitas ? '#000000' : '#AAAAAA'),
                                        height: '48px',
                                        paddingLeft: '40px',
                                        borderColor: '#E0E0E0',
                                        borderRadius: '8px',
                                        background: '#FFFFFF'
                                    }}
                                />
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" stroke="#666666" strokeWidth="1.5" />
                                        <path d="M2 14C2 11.7909 4.68629 10 8 10C11.3137 10 14 11.7909 14 14" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                                {showIdentitasDropdown && peminjamList.length > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        width: '100%',
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        background: '#FFF',
                                        border: '1px solid #E0E0E0',
                                        borderRadius: '8px',
                                        zIndex: 10,
                                        marginTop: '4px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {peminjamList.map((p: any) => (
                                            <div
                                                key={p.id}
                                                onClick={() => handleSelectPeminjam(p)}
                                                style={{
                                                    padding: '12px 16px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    color: '#333'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#FFF'}
                                            >
                                                <div style={{ fontWeight: 600 }}>{p.nama}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>{p.nomor_induk} - {p.kelas}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Barang Section (Multi-Item) */}
                    <div>
                        <label className="block mb-2.5" style={{ color: '#333333', fontSize: '14px', fontWeight: 600 }}>
                            Barang
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {items.map((item, index) => (
                                <div key={item.id} style={{
                                    border: '1px solid #E0E0E0',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    background: '#FFFFFF'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>#{String(index + 1).padStart(2, '0')}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    </div>

                                    <div style={{ marginBottom: '12px', position: 'relative' }}>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Nama Produk</label>
                                        <input
                                            type="text"
                                            value={item.produkName}
                                            onChange={(e) => handleItemSearch(index, e.target.value)}
                                            placeholder="Cari barang..."
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                                            style={{ fontSize: '14px', background: '#F9FAFB', color: '#333' }}
                                        />
                                        {activeItemIndex === index && filteredProdukList.length > 0 && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                width: '100%',
                                                maxHeight: '200px',
                                                overflowY: 'auto',
                                                background: '#FFF',
                                                border: '1px solid #E0E0E0',
                                                borderRadius: '8px',
                                                zIndex: 10,
                                                marginTop: '4px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}>
                                                {filteredProdukList.map((p: any) => (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => handleSelectProduk(index, p)}
                                                        style={{
                                                            padding: '12px 16px',
                                                            cursor: 'pointer',
                                                            fontSize: '14px',
                                                            color: '#333'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = '#FFF'}
                                                    >
                                                        <div style={{ fontWeight: 600 }}>{p.nama}</div>
                                                        <div style={{ fontSize: '12px', color: '#666' }}>{p.kode} - {p.merk}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Kuantitas</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.kuantitas}
                                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                                            style={{ fontSize: '14px', background: '#F9FAFB', color: '#333' }}
                                        />
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={handleAddItem}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '12px',
                                    background: '#F9FAFB',
                                    border: '1px solid #E0E0E0',
                                    borderRadius: '8px',
                                    color: '#2F516A',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Tambahkan Barang
                            </button>
                        </div>
                    </div>

                    {/* Row 3: Catatan Barang */}
                    <div>
                        <label className="block mb-2.5" style={{ color: '#333333', fontSize: '14px', fontWeight: 600 }}>
                            Catatan Barang / Alasan
                        </label>
                        <textarea
                            name="catatanBarang"
                            value={formData.catatanBarang}
                            onChange={handleChange}
                            placeholder="Ketik catatan barang atau alasan peminjaman..."
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none resize-none"
                            style={{
                                fontSize: '14px',
                                color: formData.catatanBarang ? '#000000' : '#AAAAAA',
                                minHeight: '100px',
                                fontFamily: 'inherit',
                                borderColor: '#E0E0E0',
                                borderRadius: '8px',
                                background: '#FFFFFF'
                            }}
                        />
                    </div>

                    {/* Row 4: Tanggal Pinjam and Tanggal Kembali */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label className="block mb-2.5" style={{ color: '#333333', fontSize: '14px', fontWeight: 600 }}>
                                Tanggal Pinjam
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="tanggalPinjam"
                                    value={formData.tanggalPinjam}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                                    style={{
                                        fontSize: '14px',
                                        color: formData.tanggalPinjam ? '#000000' : '#AAAAAA',
                                        height: '48px',
                                        borderColor: '#E0E0E0',
                                        borderRadius: '8px',
                                        background: '#FFFFFF'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <label className="block mb-2.5" style={{ color: '#333333', fontSize: '14px', fontWeight: 600 }}>
                                Tanggal Kembali
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="tanggalKembali"
                                    value={formData.tanggalKembali}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                                    style={{
                                        fontSize: '14px',
                                        color: formData.tanggalKembali ? '#000000' : '#AAAAAA',
                                        height: '48px',
                                        borderColor: '#E0E0E0',
                                        borderRadius: '8px',
                                        background: '#FFFFFF'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-lg font-semibold text-white transition-colors"
                        style={{
                            background: '#2F5F7C',
                            fontSize: '15px',
                            fontWeight: 600,
                            height: '48px',
                            marginTop: '8px',
                            borderRadius: '8px',
                            opacity: isLoading ? 0.7 : 1,
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                        onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = '#254A63'; }}
                        onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = '#2F5F7C'; }}
                    >
                        {isLoading ? 'Mengirim...' : 'Ajukan peminjaman'}
                    </button>
                </form>
            </div>
        </div>
    );
}