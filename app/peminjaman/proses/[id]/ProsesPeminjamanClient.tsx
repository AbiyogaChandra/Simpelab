'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import PhotoPickerModal from '@/components/PhotoPickerModal';

type StatusPengajuan = 'DIAJUKAN' | 'DIPINJAM' | 'KEMBALI' | 'TERLAMBAT';

interface BarangItem {
    id: string;
    productId?: number;
    namaProduk: string;
    kuantitas: number;
    selectedSerials: { id: number; kode: string }[];
}

const STATUS_LABEL: Record<StatusPengajuan, string> = {
    DIAJUKAN: 'Diajukan',
    DIPINJAM: 'Dipinjam',
    KEMBALI: 'Dikembalikan',
    TERLAMBAT: 'Terlambat',
};



export default function ProsesPeminjamanPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [kodeResi, setKodeResi] = useState('');
    const [status, setStatus] = useState<StatusPengajuan>('DIAJUKAN');
    const [kategori, setKategori] = useState<'guru' | 'siswa'>('guru'); // Display only based on fetched data
    const [identitas, setIdentitas] = useState('');
    const [items, setItems] = useState<BarangItem[]>([]);
    const [catatanBarang, setCatatanBarang] = useState('');
    const [tanggalPinjam, setTanggalPinjam] = useState('');
    const [tanggalKembali, setTanggalKembali] = useState('');

    // Photo state
    const [openPhoto, setOpenPhoto] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
    const [returnConditions, setReturnConditions] = useState<Record<number, string>>({});

    // Available serials cache: productId -> list of DetailProduk
    const [availableSerials, setAvailableSerials] = useState<Record<number, any[]>>({});
    // Input state for serial number per item slot: `${itemId}-${slotIndex}` -> current input value
    const [serialInputs, setSerialInputs] = useState<Record<string, string>>({});
    const [activeSerialInput, setActiveSerialInput] = useState<string | null>(null);
    const [activeItemId, setActiveItemId] = useState<string | null>(null);

    // Initializer
    useEffect(() => {
        if (items.length > 0 && !activeItemId) {
            setActiveItemId(items[0].id);
        }
    }, [items.length]);

    // Barcode Auto-Focus System & Cascade Jumper
    useEffect(() => {
        if (!activeItemId) return;
        const currentItem = items.find(i => i.id === activeItemId);
        if (!currentItem) return;

        const focusTimeout = setTimeout(() => {
            if (currentItem.selectedSerials.length >= currentItem.kuantitas) {
                // Item is physically full, hunt for next incomplete item
                const nextIncomplete = items.find(i => i.selectedSerials.length < i.kuantitas);
                if (nextIncomplete && nextIncomplete.id !== activeItemId) {
                    setActiveItemId(nextIncomplete.id);
                }
            } else {
                // Only steal focus automatically if the user isn't already locally focused
                const currentFocus = document.activeElement;
                const isFocusedOnCurrentItem = currentFocus?.id?.startsWith(`serial-input-${currentItem.id}`);

                if (!isFocusedOnCurrentItem) {
                    const activeEl = document.getElementById(`serial-input-${currentItem.id}-${currentItem.selectedSerials.length}`);
                    if (activeEl) activeEl.focus();
                }
            }
        }, 50);

        return () => clearTimeout(focusTimeout);
    }, [items, activeItemId]);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const res = await fetch(`/api/peminjaman?id=${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setKodeResi(data.kode_resi || '-');
                    setStatus(data.status);

                    if (data.peminjam) {
                        setKategori(data.peminjam.kategori === 'GURU' ? 'guru' : 'siswa');
                        const info = [data.peminjam.nama, data.peminjam.kelas, data.peminjam.nomor_induk].filter(Boolean).join(' - ');
                        setIdentitas(info);
                    }

                    if (data.detail_pengajuan) {
                        const loadedItems = data.detail_pengajuan.map((dp: any) => ({
                            id: dp.id,
                            productId: dp.produk?.id,
                            namaProduk: dp.produk?.nama || '-',
                            kuantitas: dp.kuantitas,
                            // Map existing selected serials
                            selectedSerials: dp.detail_produk_pengajuan?.map((dpp: any) => ({
                                id: dpp.detail_produk.id,
                                kode: dpp.detail_produk.kode_seri || dpp.detail_produk.id.toString()
                            })) || []
                        }));
                        setItems(loadedItems);

                        // Fetch available serials for each product
                        loadedItems.forEach((item: any) => {
                            if (item.productId) {
                                fetchAvailableSerials(item.productId, item.namaProduk);
                            }
                        });
                    }

                    if (data.detail_pengajuan && data.status === 'DIPINJAM') {
                        const initConds: Record<number, string> = {};
                        data.detail_pengajuan.forEach((dp: any) => {
                            dp.detail_produk_pengajuan?.forEach((dpp: any) => {
                                initConds[dpp.detail_produk.id] = 'BAIK';
                            });
                        });
                        setReturnConditions(initConds);
                    }

                    setCatatanBarang(data.catatan || '');
                    setInvoiceUrl(data.foto || null);
                    setTanggalPinjam(data.tanggal_pinjam ? new Date(data.tanggal_pinjam).toISOString().split('T')[0] : '');
                    setTanggalKembali(data.tanggal_kembali ? new Date(data.tanggal_kembali).toISOString().split('T')[0] : '');
                }
            } catch (error) {
                console.error('Failed to fetch pengajuan details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const fetchAvailableSerials = async (productId: number, productName: string) => {
        try {
            // First word of product name to get alternatives (e.g. "Laptop Asus" -> "Laptop")
            const baseType = productName.split(' ')[0];
            const res = await fetch(`/api/detail-produk?nama_produk=${encodeURIComponent(baseType)}&status=TERSEDIA`);
            if (res.ok) {
                const data = await res.json();
                setAvailableSerials(prev => ({
                    ...prev,
                    [productId]: data
                }));
            }
        } catch (e) {
            console.error("Failed to fetch serials for product", productId, e);
        }
    };

    const handleAddSerial = async (itemId: string, productId: number, specificSerialCode?: string) => {
        const inputVal = specificSerialCode || serialInputs[itemId];
        if (!inputVal) return;

        // Find the serial in available list with resilient code combinations
        const available = availableSerials[productId] || [];
        const found = available.find(s => {
            const backupKode = s.produk?.kode ? `${s.produk.kode} - ${s.kode_seri || 'ID:' + s.id}` : null;
            return (s.kode_scan && s.kode_scan === inputVal) ||
                (s.kode_seri && s.kode_seri === inputVal) ||
                (!s.kode_seri && s.id.toString() === inputVal) ||
                (backupKode && backupKode === inputVal);
        });

        if (!found) {
            alert('Serial Number tidak ditemukan atau tidak tersedia.');
            return;
        }

        // Validate limits before updating
        const targetItem = items.find(i => i.id === itemId);
        if (!targetItem) return;

        if (targetItem.selectedSerials.some(s => s.id === found.id)) return;
        if (targetItem.selectedSerials.length >= targetItem.kuantitas) {
            alert(`Maksimal ${targetItem.kuantitas} serial number.`);
            return;
        }

        const displayKode = found.kode_scan || (found.produk?.kode ? `${found.produk.kode} - ${found.kode_seri || 'ID:' + found.id}` : found.kode_seri || found.id.toString());

        // Optimistic UI Update
        setItems(prev => prev.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    selectedSerials: [...item.selectedSerials, { id: found.id, kode: displayKode }]
                };
            }
            return item;
        }));

        // Clear input and close dropdown
        setSerialInputs(prev => ({ ...prev, [itemId]: '' }));
        setActiveSerialInput(null);

        // Async API Draft Synchronization
        try {
            const res = await fetch('/api/peminjaman/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_detail_pengajuan: itemId,
                    detail_produk_id: found.id
                })
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.error || 'Gagal menyimpan draft ke database');
                // Revert UI Update on Backend Error
                setItems(prev => prev.map(item => {
                    if (item.id === itemId) {
                        return { ...item, selectedSerials: item.selectedSerials.filter(s => s.id !== found.id) };
                    }
                    return item;
                }));
            }
        } catch (error) {
            console.error('Draft POST fail:', error);
        }
    };

    const handleRemoveSerial = async (itemId: string, serialId: number) => {
        // Find serial to revert if failure
        const targetItem = items.find(i => i.id === itemId);
        const removedSerial = targetItem?.selectedSerials.find(s => s.id === serialId);

        // Optimistic UI Update
        setItems(prev => prev.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    selectedSerials: item.selectedSerials.filter(s => s.id !== serialId)
                };
            }
            return item;
        }));

        // Async API Draft Deletion
        try {
            const res = await fetch('/api/peminjaman/draft', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_detail_pengajuan: itemId,
                    detail_produk_id: serialId
                })
            });

            if (!res.ok) {
                alert('Gagal menghapus draft serial dari database');
                // Revert UI if needed
                if (removedSerial) {
                    setItems(prev => prev.map(item => {
                        if (item.id === itemId) return { ...item, selectedSerials: [...item.selectedSerials, removedSerial] };
                        return item;
                    }));
                }
            }
        } catch (error) {
            console.error('Draft DELETE fail:', error);
        }
    };

    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        setItems(prev => prev.map(item => {
            if (item.id === itemId) {
                // If reducing quantity, might need to remove excess selected serials
                let updatedSerials = item.selectedSerials;
                if (newQuantity < item.selectedSerials.length) {
                    updatedSerials = item.selectedSerials.slice(0, newQuantity);
                }
                return { ...item, kuantitas: newQuantity, selectedSerials: updatedSerials };
            }
            return item;
        }));
    };

    const handleSimpan = async () => {

        // Validation: Check if all items have required serials (only if status is DIAJUKAN going to DIPINJAM)
        if (status === 'DIAJUKAN') {
            const invalidItem = items.find(i => i.selectedSerials.length !== i.kuantitas);
            if (invalidItem) {
                alert(`Harap lengkapi Serial Number untuk ${invalidItem.namaProduk} (Perlu ${invalidItem.kuantitas}, Terpilih ${invalidItem.selectedSerials.length})`);
                return;
            }
        }

        try {
            // Construct flattened items payload for the backend structure
            const flattenedItems = items.flatMap(item =>
                item.selectedSerials.map(s => ({
                    id_detail_pengajuan: item.id,
                    detail_produk_id: s.id
                }))
            );

            // Construct quantities payload
            const quantitiesPayload = items.map(item => ({
                id: item.id,
                kuantitas: item.kuantitas
            }));

            const payload = new FormData();
            if (status === 'DIPINJAM') {
                payload.append('status', 'KEMBALI');
                payload.append('itemConditions', JSON.stringify(returnConditions));
            } else {
                payload.append('status', 'DIPINJAM');
            }
            payload.append('catatan', catatanBarang);
            payload.append('tanggal_pinjam', tanggalPinjam);
            payload.append('tanggal_kembali', tanggalKembali || '');
            payload.append('items', JSON.stringify(flattenedItems));
            payload.append('quantities', JSON.stringify(quantitiesPayload));
            if (selectedImage) {
                payload.append('foto', selectedImage);
            }

            const res = await fetch(`/api/peminjaman?id=${id}`, {
                method: 'PUT',
                body: payload,
            });

            if (res.ok) {
                router.push('/peminjaman');
            } else {
                alert('Gagal menyimpan data');
            }
        } catch (error) {
            console.error('Error saving:', error);
            alert('Terjadi kesalahan saat menyimpan');
        }
    };

    const handleCetak = () => {
        window.open(`/api/cetak/${id}`, '_blank');
    };

    const isAllFilled = items.length > 0 && items.every(i => i.selectedSerials.length === i.kuantitas);

    const inputStyle = {
        width: '100%' as const,
        padding: '12px 16px',
        border: '1px solid #E0E0E0',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#333333',
        background: '#FFFFFF',
        fontFamily: 'Outfit, sans-serif',
        outline: 'none',
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Memuat data...
            </div>
        );
    }

    return (
        <>
            <div
                style={{
                    minHeight: '100vh',
                    background: '#F5F5F5',
                    fontFamily: 'Outfit, sans-serif',
                }}
            >
                <Sidebar />

                <div
                    style={{
                        marginLeft: '280px',
                        padding: '32px',
                        minHeight: '100vh',
                    }}
                >
                    {/* Back + Title */}
                    <Link
                        href="/peminjaman"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#2F516A',
                            fontSize: '14px',
                            fontWeight: 500,
                            marginBottom: '16px',
                            textDecoration: 'none',
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>&lt;</span>
                        Kembali
                    </Link>
                    <h1
                        style={{
                            color: '#333333',
                            fontSize: '32px',
                            fontWeight: 700,
                            marginBottom: '8px'
                        }}
                    >
                        Proses Peminjaman
                    </h1>
                    <p
                        style={{
                            color: '#666666',
                            fontSize: '16px',
                            fontWeight: 400,
                            marginBottom: '32px'
                        }}
                    >
                        Klik untuk mengedit data peminjaman
                    </p>

                    {/* Card */}
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            padding: '24px 32px',
                            marginBottom: '24px',
                        }}
                    >
                        {/* Header (Resi & Status) */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                            <div>
                                <label style={{ display: 'block', color: '#666666', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                                    Nomor Resi
                                </label>
                                <div style={{ fontSize: '32px', fontWeight: 700, color: '#333333' }}>
                                    {kodeResi}
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#666666', fontSize: '12px', fontWeight: 500, marginBottom: '4px', textAlign: 'right' }}>
                                    Status
                                </label>
                                <div style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    background: '#FFF7ED',
                                    color: '#EA580C',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    border: '1px solid #FED7AA',
                                    textAlign: 'center'
                                }}>
                                    {STATUS_LABEL[status]}
                                </div>
                            </div>
                        </div>

                        {/* Kategori & Identitas */}
                        <div style={{ display: 'flex', gap: '48px', marginBottom: '48px' }}>
                            <div>
                                <label style={{ display: 'block', color: '#666666', fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>
                                    Kategori Peminjam
                                </label>
                                <div style={{ display: 'flex', gap: '20px', pointerEvents: 'none', opacity: 0.8 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #2F516A',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {kategori === 'guru' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2F516A' }} />}
                                        </div>
                                        <span style={{ fontSize: '14px', color: '#333333', fontWeight: 500 }}>Guru</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #2F516A',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {kategori === 'siswa' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2F516A' }} />}
                                        </div>
                                        <span style={{ fontSize: '14px', color: '#333333', fontWeight: 500 }}>Siswa</span>
                                    </label>
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', color: '#666666', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                                    Identitas
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333333', fontWeight: 600, fontSize: '16px' }}>
                                    <iconify-icon
                                        icon="majesticons:user"
                                        height="20"
                                    />
                                    {identitas}
                                </div>
                            </div>
                        </div>

                        <div style={{ height: '1px', background: '#E0E0E0', width: '100%', marginBottom: '32px' }} />

                        {/* Barang List */}
                        <h2
                            style={{
                                color: '#666666',
                                fontSize: '14px',
                                fontWeight: 500,
                                marginBottom: '16px',
                                margin: 0,
                            }}
                        >
                            Barang
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
                            {status === 'DIPINJAM' ? (
                                // RETURN VIEW
                                items.flatMap(item => item.selectedSerials.map(s => (
                                    <div key={s.id} style={{ border: '1px solid #E0E0E0', borderRadius: '12px', padding: '16px 24px', background: '#FFFFFF' }}>
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Barang</label>
                                            <div style={{ padding: '12px 16px', background: '#FAFAFA', border: '1px solid #F3F4F6', borderRadius: '8px', fontSize: '14px', color: '#333333', fontWeight: 500 }}>
                                                {item.namaProduk} - {s.kode}
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Kondisi Pengembalian</label>
                                            <select
                                                value={returnConditions[s.id] || 'BAIK'}
                                                onChange={(e) => setReturnConditions(prev => ({ ...prev, [s.id]: e.target.value }))}
                                                style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', background: '#FFFFFF' }}
                                            >
                                                <option value="BAIK">Baik</option>
                                                <option value="RUSAK">Rusak</option>
                                            </select>
                                        </div>
                                    </div>
                                )))
                            ) : (
                                // SCAN VIEW
                                items.map((item, index) => {
                                    const isActive = activeItemId === item.id;
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => setActiveItemId(item.id)}
                                            style={{
                                                border: isActive ? '1px solid #2F516A' : '1px solid #E0E0E0',
                                                borderRadius: '12px',
                                                padding: '16px 24px',
                                                background: '#FFFFFF',
                                                transition: 'all 0.2s',
                                                boxShadow: isActive ? '0 4px 12px rgba(47, 81, 106, 0.08)' : 'none',
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                                                <div style={{ fontWeight: 700, fontSize: '16px', color: '#333333' }}>
                                                    #{String(index + 1).padStart(2, '0')}
                                                </div>
                                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setActiveItemId(item.id); }}
                                                        style={{
                                                            padding: '6px 16px',
                                                            background: isActive ? '#FFFFFF' : '#2F516A',
                                                            color: isActive ? '#2F516A' : '#FFFFFF',
                                                            border: '1px solid #2F516A',
                                                            borderRadius: '4px',
                                                            fontSize: '13px',
                                                            fontWeight: 600,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {isActive ? 'Dipilih' : 'Pilih'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Hapus Barang (Tidak Aktif)"
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#E37158' }}
                                                    >
                                                        <iconify-icon
                                                            icon="fluent:delete-12-regular"
                                                            height="28"
                                                        />
                                                    </button>
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{ display: 'block', fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Nama Produk</label>
                                                <div style={{
                                                    padding: '12px 16px', background: '#FAFAFA', border: '1px solid #F3F4F6',
                                                    borderRadius: '8px', fontSize: '14px', color: '#333333', fontWeight: 500
                                                }}>
                                                    {item.namaProduk}
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '24px' }}>
                                                <label style={{ display: 'block', fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Kuantitas</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.kuantitas}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 16px', background: '#FFFFFF', border: '1px solid #E0E0E0',
                                                        borderRadius: '8px', fontSize: '14px', color: '#333333', fontWeight: 500
                                                    }}
                                                />
                                            </div>

                                            {/* Iterative Configurable Slot List */}
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Nomor Seri</label>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {Array.from({ length: item.kuantitas }).map((_, slotIndex) => {
                                                        const filledSerial = item.selectedSerials[slotIndex];

                                                        if (filledSerial) {
                                                            return (
                                                                <div key={slotIndex} style={{
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                                    padding: '12px 16px', background: '#FAFAFA', borderRadius: '8px',
                                                                    border: '1px solid #E0E0E0', color: '#333333', fontSize: '14px', fontWeight: 500
                                                                }}>
                                                                    {filledSerial.kode}
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); handleRemoveSerial(item.id, filledSerial.id); }}
                                                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF' }}
                                                                    >
                                                                        <iconify-icon
                                                                            icon="basil:cross-solid"
                                                                            height="24"
                                                                        />
                                                                    </button>
                                                                </div>
                                                            );
                                                        }

                                                        // Empty Input Slot
                                                        const inputKey = `${item.id}-${slotIndex}`;
                                                        return (
                                                            <div key={slotIndex} style={{ position: 'relative' }}>
                                                                <input
                                                                    id={`serial-input-${item.id}-${slotIndex}`}
                                                                    type="text"
                                                                    value={serialInputs[inputKey] || ''}
                                                                    onChange={(e) => setSerialInputs(prev => ({ ...prev, [inputKey]: e.target.value }))}
                                                                    onFocus={() => {
                                                                        setActiveSerialInput(inputKey);
                                                                        setActiveItemId(item.id);
                                                                    }}
                                                                    onBlur={() => setActiveSerialInput(null)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            if (item.productId && serialInputs[inputKey]) {
                                                                                handleAddSerial(item.id, item.productId, serialInputs[inputKey]);
                                                                                setSerialInputs(prev => ({ ...prev, [inputKey]: '' }));
                                                                            }
                                                                        }
                                                                    }}
                                                                    placeholder="(Scan barang)"
                                                                    style={{
                                                                        ...inputStyle,
                                                                        background: '#FFFFFF',
                                                                        borderColor: (isActive && slotIndex === item.selectedSerials.length) ? '#2F516A' : '#E0E0E0',
                                                                        boxShadow: (isActive && slotIndex === item.selectedSerials.length) ? '0 0 0 2px rgba(47,81,106,0.1)' : 'none'
                                                                    }}
                                                                />

                                                                {/* Autocomplete Dropdown */}
                                                                {activeSerialInput === inputKey && item.productId && availableSerials[item.productId] && availableSerials[item.productId].length > 0 && (
                                                                    <div
                                                                        onMouseDown={(e) => e.preventDefault()} // Prevent input natively blurring when clicking dropdown 
                                                                        style={{
                                                                            position: 'absolute', top: '100%', left: 0, right: 0,
                                                                            backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px',
                                                                            marginTop: '4px', maxHeight: '200px', overflowY: 'auto', zIndex: 10,
                                                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                                                        }}
                                                                    >
                                                                        {availableSerials[item.productId]
                                                                            .filter(s => {
                                                                                const query = (serialInputs[inputKey] || '').toLowerCase();
                                                                                const backup = s.produk?.kode ? `${s.produk.kode} - ${s.kode_seri || 'ID:' + s.id}` : '';
                                                                                const fullText = `${s.produk?.nama || ''} ${s.produk?.merk || ''} ${s.produk?.model || ''} ${s.produk?.spesifikasi || ''} ${s.kode_seri || ''} ${s.kode_scan || ''} ${backup}`.toLowerCase();
                                                                                const isSelected = item.selectedSerials.some(selected => selected.id === s.id);
                                                                                return fullText.includes(query) && !isSelected;
                                                                            })
                                                                            .map(s => (
                                                                                <div
                                                                                    key={s.id}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        if (item.productId) {
                                                                                            const matchCode = s.kode_scan || s.kode_seri || (s.produk?.kode ? `${s.produk.kode} - ${s.kode_seri || 'ID:' + s.id}` : s.id.toString());
                                                                                            handleAddSerial(item.id, item.productId, matchCode);
                                                                                            setSerialInputs(prev => ({ ...prev, [inputKey]: '' }));
                                                                                        }
                                                                                    }}
                                                                                    style={{
                                                                                        padding: '10px 16px', fontSize: '14px', color: '#333333',
                                                                                        cursor: 'pointer', borderBottom: '1px solid #F5F5F5'
                                                                                    }}
                                                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                                                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                                                                                >
                                                                                    <div style={{ fontWeight: 500 }}>
                                                                                        {s.produk?.nama} {s.produk?.merk} {s.produk?.model}
                                                                                    </div>
                                                                                    <div style={{ fontSize: '12px', color: '#666666' }}>
                                                                                        {s.produk?.spesifikasi} - <strong>{s.kode_scan || s.kode_seri || `ID: ${s.id}`}</strong> ({s.kondisi})
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }))}
                        </div>

                        {/* Add Item Button (Hidden/Disabled) */}
                        <div style={{ marginBottom: '32px' }}></div>

                        {/* Catatan Barang */}
                        <div style={{ marginTop: '24px', marginBottom: '24px' }}>
                            <label style={{ display: 'block', color: '#666666', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                                Catatan Barang
                            </label>
                            <textarea
                                value={catatanBarang}
                                onChange={(e) => setCatatanBarang(e.target.value)}
                                rows={3}
                                style={{
                                    ...inputStyle,
                                    resize: 'vertical',
                                    minHeight: '80px',
                                }}
                            />
                        </div>

                        {/* Tanggal */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', color: '#666666', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                                    Tanggal Pinjam
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={tanggalPinjam}
                                        onChange={(e) => {
                                            setTanggalPinjam(e.target.value);
                                            if (tanggalKembali && e.target.value > tanggalKembali) {
                                                setTanggalKembali(e.target.value);
                                            }
                                        }}
                                        className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                                        style={{
                                            fontSize: '14px',
                                            color: tanggalPinjam ? '#000000' : '#AAAAAA',
                                            height: '48px',
                                            borderColor: '#E0E0E0',
                                            borderRadius: '8px',
                                            background: '#FFFFFF'
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#666666', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                                    Tanggal Kembali
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={tanggalKembali}
                                        min={tanggalPinjam}
                                        onChange={(e) => setTanggalKembali(e.target.value)}
                                        className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                                        style={{
                                            fontSize: '14px',
                                            color: tanggalKembali ? '#000000' : '#AAAAAA',
                                            height: '48px',
                                            borderColor: '#E0E0E0',
                                            borderRadius: '8px',
                                            background: '#FFFFFF'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Foto Peminjaman */}
                        <div style={{ marginTop: '24px' }}>
                            <label style={{ display: 'block', color: '#666666', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                                Foto Transaksi
                            </label>
                            {status === 'DIPINJAM' ? (
                                <div style={{ border: '1px solid #E0E0E0', borderRadius: '8px', padding: '16px', background: '#FAFAFA', textAlign: 'center' }}>
                                    {invoiceUrl ? (
                                        <img src={invoiceUrl} alt="Foto Transaksi" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', objectFit: 'contain' }} />
                                    ) : (
                                        <p style={{ color: '#999999', fontSize: '14px' }}>Tidak ada foto transaksi</p>
                                    )}
                                </div>
                            ) : (
                                <div
                                    onClick={() => setOpenPhoto(true)}
                                    style={{
                                        border: '2px dashed #ECECEC',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        background: '#F9F9F9',
                                        color: '#C0C0B3'
                                    }}
                                >
                                    {selectedImage ? (
                                        <img
                                            src={URL.createObjectURL(selectedImage)}
                                            style={{ height: '240px', objectFit: 'cover', borderRadius: '8px' }}
                                        />
                                    ) : invoiceUrl ? (
                                        <img
                                            src={invoiceUrl}
                                            style={{ height: '240px', objectFit: 'cover', borderRadius: '8px' }}
                                        />
                                    ) : (
                                        <>
                                            <iconify-icon icon="material-symbols:camera" height="36" />
                                            <p style={{ fontSize: '14px', marginTop: '4px' }}>Tambahkan Foto Bukti</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button
                            type="button"
                            onClick={handleSimpan}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 24px',
                                background: '#2F516A',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}
                        >
                            <iconify-icon
                                icon={status === 'DIPINJAM' ? "material-symbols:call-received-filled" : "material-symbols:save-rounded"}
                                height="24"
                            />
                            {status === 'DIPINJAM' ? 'Kembalikan Barang' : 'Simpan'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCetak}
                            disabled={!isAllFilled}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 24px',
                                background: isAllFilled ? '#FFFFFF' : '#F9FAFB',
                                color: isAllFilled ? '#333333' : '#9CA3AF',
                                border: isAllFilled ? '1px solid #2F516A' : '1px solid #E0E0E0',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: isAllFilled ? 'pointer' : 'not-allowed',
                                fontFamily: 'inherit',
                            }}
                        >
                            <iconify-icon
                                icon="material-symbols-light:print-rounded"
                                height="24"
                            />
                            Cetak
                        </button>
                    </div>
                </div>
            </div>
            <PhotoPickerModal
                isOpen={openPhoto}
                onClose={() => setOpenPhoto(false)}
                onSelect={(file) => {
                    setSelectedImage(file);
                    setOpenPhoto(false);
                }}
            />
        </>
    );
}
