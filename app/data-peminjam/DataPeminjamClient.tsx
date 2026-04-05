'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import * as XLSX from 'xlsx';

export default function DataPeminjamClient() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [toast, setToast] = useState<{ title: string, message: string, type: 'success' | 'warning' | 'error' } | null>(null);
    // Relative Scroll Memory
    const relativeScrollRef = useRef(0);
    const [editingPeminjamId, setEditingPeminjamId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ kategori: '', nama: '', nomor_induk: '', kelas: '' });
    const [showClearModal, setShowClearModal] = useState(false);
    const [clearCountdown, setClearCountdown] = useState(15);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollHeight = document.body.scrollHeight - window.innerHeight;
            if (scrollHeight > 0) {
                relativeScrollRef.current = window.scrollY / scrollHeight;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [kategori, setKategori] = useState('');
    const [kelas, setKelas] = useState('');

    const formatKategori = (cat: string) => {
        if (!cat) return '';
        return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
    };

    const filteredData = data.filter((item) => {
        const searchTerm = search.toLowerCase();
        const itemNama = item.nama?.toLowerCase() || '';
        const itemNip = item.nomor_induk?.toLowerCase() || '';
        const itemKategori = item.kategori ? formatKategori(item.kategori) : '';
        const itemKelas = item.kelas?.toLowerCase() || '';

        const matchesSearch = itemNama.includes(searchTerm) || itemNip.includes(searchTerm);
        const matchesKategori = !kategori || itemKategori === kategori;
        const matchesKelas = !kelas || itemKelas === kelas.toLowerCase();

        return matchesSearch && matchesKategori && matchesKelas;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [search, kategori, kelas]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Apply relative scroll after DOM calculates new heights
    useEffect(() => {
        const scrollHeight = document.body.scrollHeight - window.innerHeight;
        if (scrollHeight > 0) {
            window.scrollTo(0, relativeScrollRef.current * scrollHeight);
        }
    }, [paginatedData]);

    const uniqueKategori = Array.from(new Set(data.map(d => formatKategori(d.kategori)).filter(Boolean))) as string[];
    const uniqueKelas = Array.from(new Set(data.map(d => d.kelas).filter(Boolean))) as string[];

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/peminjam/list');
            if (res.ok) {
                const list = await res.json();
                setData(list);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (showClearModal && clearCountdown > 0) {
            timer = setTimeout(() => setClearCountdown(prev => prev - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [showClearModal, clearCountdown]);

    const handleEditClick = (item: any) => {
        setEditingPeminjamId(item.id);
        setEditForm({ kategori: item.kategori, nama: item.nama, nomor_induk: item.nomor_induk, kelas: item.kelas || '' });
    };

    const handleEditSave = async (id: string) => {
        try {
            const res = await fetch(`/api/peminjam?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                showToast('Sukses', 'Data peminjam berhasil diperbarui.', 'success');
                setEditingPeminjamId(null);
                fetchData();
            } else {
                const err = await res.json();
                showToast('Gagal', err.error || 'Terjadi kesalahan.', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('Gagal', 'Gagal menghubungi server.', 'error');
        }
    };

    const handleDeleteClick = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus data peminjam ini?')) return;
        try {
            const res = await fetch(`/api/peminjam?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('Sukses', 'Peminjam berhasil dihapus.', 'success');
                fetchData();
            } else {
                const err = await res.json();
                showToast('Gagal', err.error || 'Terjadi kesalahan.', 'error');
            }
        } catch (e) {
            showToast('Gagal', 'Gagal menghubungi server.', 'error');
        }
    };

    const handleClearAll = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch('/api/peminjam?action=clear', { method: 'DELETE' });
            if (res.ok) {
                const json = await res.json();
                showToast('Sukses', `Berhasil menghapus ${json.count} data peminjam yang tidak aktif.`, 'success');
                setShowClearModal(false);
                fetchData();
            } else {
                const err = await res.json();
                showToast('Gagal', err.error || 'Terjadi kesalahan.', 'error');
            }
        } catch (e) {
            showToast('Gagal', 'Terjadi kesalahan pada server.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const showToast = (title: string, message: string, type: 'success' | 'warning' | 'error') => {
        setToast({ title, message, type });
        setTimeout(() => setToast(null), 8000);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const rows = XLSX.utils.sheet_to_json(ws) as any[];

                const mappedData = rows.map(row => ({
                    nama: row['Nama'] || row['nama'] || row['NAMA'],
                    nomor_induk: row['Nomor Induk'] || row['NIP/NIS'] || row['nomor_induk'] || row['Nomor_Induk'],
                    kategori: row['Kategori'] || row['kategori'],
                    kelas: row['Kelas'] || row['kelas'] || null
                })).filter(r => r.nama && r.nomor_induk && r.kategori);

                if (mappedData.length === 0) {
                    showToast('Error', 'Format data tidak valid. Pastikan ada kolom Nama, Nomor Induk, dan Kategori.', 'error');
                    setUploading(false);
                    return;
                }

                const res = await fetch('/api/peminjam/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(mappedData)
                });

                if (res.ok) {
                    const result = await res.json();
                    if (result.duplicates > 0) {
                        showToast('Import Selesai dengan Peringatan', `Berhasil import ${result.imported} data. Terdapat ${result.duplicates} duplikat yang diabaikan.`, 'warning');
                    } else {
                        showToast('Import Selesai', `Berhasil import ${result.imported} data.`, 'success');
                    }
                    fetchData();
                } else {
                    showToast('Gagal', 'Terjadi kesalahan saat import data server.', 'error');
                }
            } catch (err: any) {
                console.error(err);
                showToast('Gagal', 'Gagal memproses file xlsx/csv. Pastikan format sesuai.', 'error');
            } finally {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#F5F5F5', fontFamily: 'Outfit, sans-serif' }}>
            <Sidebar />

            <div style={{ marginLeft: '280px', padding: '32px', minHeight: '100vh' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ color: '#333333', fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Data Peminjam</h1>
                    <p style={{ color: '#666666', fontSize: '16px', fontWeight: 400 }}>Kelola data guru dan siswa</p>
                </div>

                {/* Controls Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => {
                                setShowClearModal(true);
                                setClearCountdown(15);
                            }}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                                background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', fontSize: '14px',
                                fontWeight: 600, border: 'none', cursor: 'pointer'
                            }}
                        >
                            <iconify-icon icon="mdi:delete-sweep" width="16" />
                            Kosongkan Data
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <a
                            href="/templates/template-peminjam.csv"
                            download
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                                background: '#FFFFFF', color: '#2F516A', border: '1px solid #2F516A',
                                borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', cursor: 'pointer'
                            }}
                        >
                            <iconify-icon icon="mdi:download" width="16" />
                            Download Template
                        </a>
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                                background: '#2F516A', color: '#FFFFFF', borderRadius: '8px', fontSize: '14px',
                                fontWeight: 600, border: 'none', cursor: uploading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <iconify-icon icon={uploading ? "line-md:loading-twotone-loop" : "mdi:file-excel"} width="16" />
                            {uploading ? 'Memproses...' : 'Import Excel/CSV'}
                        </button>
                        <Link
                            href="/create-peminjam"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                                background: '#FFFFFF', color: '#2F516A', borderRadius: '8px', fontSize: '14px',
                                fontWeight: 600, textDecoration: 'none', border: '1px solid #E0E0E0', transition: 'all 0.2s'
                            }}
                        >
                            <iconify-icon icon="ic:round-plus" width="16" />
                            Buat Peminjam
                        </Link>
                    </div>
                </div>

                <div style={{ background: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <div style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', minWidth: '200px' }}>
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={kategori}
                                    onChange={(e) => setKategori(e.target.value)}
                                    style={{
                                        width: '100%', padding: '10px 16px', paddingLeft: '40px', paddingRight: '40px',
                                        border: '1px solid #E0E0E0', borderRadius: '8px', fontSize: '14px',
                                        color: kategori ? '#000000' : '#666666', background: '#F9FAFB', appearance: 'none', cursor: 'pointer'
                                    }}
                                >
                                    <option value="">Semua Kategori</option>
                                    {uniqueKategori.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                                    <iconify-icon icon="material-symbols:category-rounded" style={{ color: '#666666' }} width="16" />
                                </div>
                                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
                                    <iconify-icon icon="icon-park-outline:down" style={{ color: '#666666' }} width="16" />
                                </div>
                            </div>
                        </div>

                        <div style={{ position: 'relative', minWidth: '200px' }}>
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={kelas}
                                    onChange={(e) => setKelas(e.target.value)}
                                    style={{
                                        width: '100%', padding: '10px 16px', paddingLeft: '40px', paddingRight: '40px',
                                        border: '1px solid #E0E0E0', borderRadius: '8px', fontSize: '14px',
                                        color: kelas ? '#000000' : '#666666', background: '#F9FAFB', appearance: 'none', cursor: 'pointer'
                                    }}
                                >
                                    <option value="">Semua Kelas</option>
                                    {uniqueKelas.map(kls => <option key={kls} value={kls}>{kls}</option>)}
                                </select>
                                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                                    <iconify-icon icon="mdi:google-classroom" style={{ color: '#666666' }} width="16" />
                                </div>
                                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
                                    <iconify-icon icon="icon-park-outline:down" style={{ color: '#666666' }} width="16" />
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: 1, position: 'relative' }}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama atau NIP/NIS..."
                                    style={{
                                        width: '100%', padding: '10px 16px', paddingLeft: '40px', border: '1px solid #E0E0E0',
                                        borderRadius: '8px', fontSize: '14px', color: search ? '#000000' : '#666666',
                                        background: '#FFFFFF', fontFamily: 'inherit'
                                    }}
                                />
                                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                                    <iconify-icon icon="iconamoon:search" style={{ color: '#666666' }} width="16" />
                                </div>
                            </div>
                        </div>
                    </div>
                    {loading ? (
                        <div style={{ padding: '80px 32px', textAlign: 'center', color: '#666666', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            <iconify-icon icon="line-md:loading-twotone-loop" style={{ fontSize: '24px', color: '#2F516A' }}></iconify-icon>
                            <p>Loading...</p>
                        </div>
                    ) : data.length > 0 ? (
                        <>
                            <div style={{ overflow: 'auto', maxHeight: 'calc(100vh - 350px)', minHeight: '400px', borderTop: '1px solid #F0F0F0' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                                    <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                        <tr style={{ background: '#E3F2FD', borderBottom: '1px solid #E0E0E0' }}>
                                            <th style={{ width: '5%', padding: '16px', textAlign: 'center', color: '#333', fontSize: '14px', fontWeight: 600 }}>No</th>
                                            <th style={{ width: '10%', padding: '16px', textAlign: 'center', color: '#333', fontSize: '14px', fontWeight: 600 }}>Kategori</th>
                                            <th style={{ width: '25%', padding: '16px', textAlign: 'center', color: '#333', fontSize: '14px', fontWeight: 600 }}>Nama</th>
                                            <th style={{ width: '35%', padding: '16px', textAlign: 'center', color: '#333', fontSize: '14px', fontWeight: 600 }}>NIP/NIS</th>
                                            <th style={{ width: '10%', padding: '16px', textAlign: 'center', color: '#333', fontSize: '14px', fontWeight: 600 }}>Kelas</th>
                                            <th style={{ width: '15%', padding: '16px', textAlign: 'center', color: '#333', fontSize: '14px', fontWeight: 600 }}>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedData.map((item, index) => {
                                            const isEditing = editingPeminjamId === item.id;
                                            return (
                                            <tr key={item.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                                                <td style={{ padding: '16px', color: '#333', fontSize: '14px', textAlign: 'center' }}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td style={{ padding: '16px', color: '#333', fontSize: '14px', textAlign: 'center' }}>
                                                    {isEditing ? (
                                                        <select value={editForm.kategori} onChange={e => setEditForm({...editForm, kategori: e.target.value})} style={{ width: '100%', padding: '4px', border: '1px solid #CCC', borderRadius: '4px' }}>
                                                            <option value="GURU">Guru</option>
                                                            <option value="SISWA">Siswa</option>
                                                        </select>
                                                    ) : (
                                                        <span style={{
                                                            display: 'inline-block',
                                                            padding: '4px 12px',
                                                            borderRadius: '12px',
                                                            background: '#E3F2FD',
                                                            color: '#333333',
                                                            fontSize: '12px',
                                                            fontWeight: 500
                                                        }}>{formatKategori(item.kategori)}</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '16px', color: '#333', fontSize: '14px' }}>
                                                    {isEditing ? (
                                                        <input type="text" value={editForm.nama} onChange={e => setEditForm({...editForm, nama: e.target.value})} style={{ width: '100%', padding: '4px', border: '1px solid #CCC', borderRadius: '4px' }} />
                                                    ) : (
                                                        item.nama
                                                    )}
                                                </td>
                                                <td style={{ padding: '16px', color: '#333', fontSize: '14px', textAlign: 'center' }}>
                                                    {isEditing ? (
                                                        <input type="text" value={editForm.nomor_induk} onChange={e => setEditForm({...editForm, nomor_induk: e.target.value})} style={{ width: '100%', padding: '4px', border: '1px solid #CCC', borderRadius: '4px', textAlign: 'center' }} />
                                                    ) : (
                                                        item.nomor_induk
                                                    )}
                                                </td>
                                                <td style={{ padding: '16px', color: '#333', fontSize: '14px', textAlign: 'center' }}>
                                                    {isEditing ? (
                                                        <input type="text" value={editForm.kelas} onChange={e => setEditForm({...editForm, kelas: e.target.value})} style={{ width: '100%', padding: '4px', border: '1px solid #CCC', borderRadius: '4px', textAlign: 'center' }} />
                                                    ) : (
                                                        item.kelas || '-'
                                                    )}
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                                    {isEditing ? (
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                                                            <button onClick={() => handleEditSave(item.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#065F46' }} title="Simpan">
                                                                <iconify-icon icon="material-symbols:check-circle-outline-rounded" width="18" height="18"></iconify-icon>
                                                            </button>
                                                            <button onClick={() => setEditingPeminjamId(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#991B1B' }} title="Batal">
                                                                <iconify-icon icon="material-symbols:cancel-outline-rounded" width="18" height="18"></iconify-icon>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                                                            <button onClick={() => handleEditClick(item)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#1E1E1E' }} title="Edit">
                                                                <iconify-icon icon="material-symbols:edit-outline-rounded" width="18" height="18"></iconify-icon>
                                                            </button>
                                                            <button onClick={() => handleDeleteClick(item.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#E37158' }} title="Delete">
                                                                <iconify-icon icon="fluent:delete-12-regular" width="18" height="18"></iconify-icon>
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )})}
                                    </tbody>
                                </table>
                            </div>
                            {/* Footer Pagination */}
                            <div style={{
                                padding: '16px 24px',
                                borderTop: '1px solid #E0E0E0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1); // Reset to page 1 on items change
                                        }}
                                        style={{
                                            padding: '6px 12px',
                                            color: '#333333',
                                            border: '1px solid #E0E0E0',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            fontFamily: 'inherit',
                                            cursor: 'pointer'
                                        }}>
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="30">30</option>
                                        <option value="40">40</option>
                                        <option value="50">50</option>
                                    </select>
                                    <span style={{ color: '#666666', fontSize: '14px' }}>
                                        Results: {filteredData.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        style={{
                                            padding: '8px 16px',
                                            border: '1px solid #E0E0E0',
                                            borderRadius: '6px',
                                            background: currentPage === 1 ? '#F5F5F5' : '#FFFFFF',
                                            color: currentPage === 1 ? '#999999' : '#666666',
                                            fontSize: '14px',
                                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                            fontFamily: 'inherit',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                        Previous
                                    </button>

                                    <div style={{
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        background: '#FFFFFF',
                                        border: '1px solid #E0E0E0',
                                        color: '#333',
                                        fontSize: '14px',
                                        fontWeight: 500
                                    }}>
                                        {currentPage}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        style={{
                                            padding: '8px 16px',
                                            border: '1px solid #E0E0E0',
                                            borderRadius: '6px',
                                            background: (currentPage === totalPages || totalPages === 0) ? '#F5F5F5' : '#FFFFFF',
                                            color: (currentPage === totalPages || totalPages === 0) ? '#999999' : '#666666',
                                            fontSize: '14px',
                                            cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                                            fontFamily: 'inherit',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ padding: '80px 32px', textAlign: 'center', color: '#666666' }}>
                            <p>Data kosong. Silahkan import data peminjam.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Clear Confirmation Modal */}
            {showClearModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#FFFFFF', padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{ width: '64px', height: '64px', background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <iconify-icon icon="mdi:alert" style={{ fontSize: '32px', color: '#DC2626' }}></iconify-icon>
                            </div>
                            <h2 style={{ color: '#111827', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Yakin Kosongkan Data?</h2>
                            <p style={{ color: '#4B5563', fontSize: '14px', lineHeight: '1.5' }}>
                                Aksi ini akan <strong>menghapus seluruh riwayat peminjaman</strong> (kecuali yang sedang berstatus DIPINJAM/TERLAMBAT) beserta data guru/siswa. Aksi ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowClearModal(false)}
                                disabled={isDeleting}
                                style={{ flex: 1, padding: '12px', background: '#F3F4F6', color: '#374151', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: isDeleting ? 'not-allowed' : 'pointer' }}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleClearAll}
                                disabled={clearCountdown > 0 || isDeleting}
                                style={{
                                    flex: 1, padding: '12px', background: clearCountdown > 0 ? '#FCA5A5' : '#DC2626',
                                    color: '#FFFFFF', borderRadius: '8px', border: 'none', fontWeight: 600,
                                    cursor: (clearCountdown > 0 || isDeleting) ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            >
                                {isDeleting ? 'Menghapus...' : clearCountdown > 0 ? `Tunggu (${clearCountdown}s)` : 'Hapus Semua'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div style={{
                    position: 'fixed', top: '24px', right: '24px', backgroundColor: '#FFFFFF',
                    borderLeft: `4px solid ${toast.type === 'success' ? '#065F46' : toast.type === 'warning' ? '#B45309' : '#991B1B'}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '8px', padding: '16px', zIndex: 1000,
                    display: 'flex', flexDirection: 'column', gap: '4px', width: '320px'
                }}>
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
