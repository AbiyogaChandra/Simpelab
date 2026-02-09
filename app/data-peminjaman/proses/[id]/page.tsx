'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

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

  // Available serials cache: productId -> list of DetailProduk
  const [availableSerials, setAvailableSerials] = useState<Record<number, any[]>>({});
  // Input state for serial number per item: itemId -> current input value
  const [serialInputs, setSerialInputs] = useState<Record<string, string>>({});
  // State for active dropdown
  const [activeSerialInput, setActiveSerialInput] = useState<string | null>(null);

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
                fetchAvailableSerials(item.productId);
              }
            });
          }

          setCatatanBarang(data.catatan || '');
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

  const fetchAvailableSerials = async (productId: number) => {
    try {
      const res = await fetch(`/api/detail-produk?id_produk=${productId}&status=TERSEDIA`);
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

  const handleAddSerial = (itemId: string, productId: number, specificSerialCode?: string) => {
    const inputVal = specificSerialCode || serialInputs[itemId];
    if (!inputVal) return;

    // Find the serial in available list
    const available = availableSerials[productId] || [];
    const found = available.find(s =>
      (s.kode_seri && s.kode_seri === inputVal) ||
      (!s.kode_seri && s.id.toString() === inputVal)
    );

    if (found) {
      setItems(prev => prev.map(item => {
        if (item.id === itemId) {
          // Check if already selected
          if (item.selectedSerials.some(s => s.id === found.id)) return item;
          // Check quantity limit
          if (item.selectedSerials.length >= item.kuantitas) {
            alert(`Maksimal ${item.kuantitas} serial number.`);
            return item;
          }

          return {
            ...item,
            selectedSerials: [...item.selectedSerials, { id: found.id, kode: found.kode_seri || found.id.toString() }]
          };
        }
        return item;
      }));
      // Clear input and close dropdown
      setSerialInputs(prev => ({ ...prev, [itemId]: '' }));
      setActiveSerialInput(null);
    } else {
      alert('Serial Number tidak ditemukan atau tidak tersedia.');
    }
  };

  const handleRemoveSerial = (itemId: string, serialId: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          selectedSerials: item.selectedSerials.filter(s => s.id !== serialId)
        };
      }
      return item;
    }));
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

    // Validation: Check if all items have required serials (only if status is DIPINJAM)
    // Since we are now forcing DIPINJAM on save, we always validate
    const invalidItem = items.find(i => i.selectedSerials.length !== i.kuantitas);
    if (invalidItem) {
      alert(`Harap lengkapi Serial Number untuk ${invalidItem.namaProduk} (Perlu ${invalidItem.kuantitas}, Terpilih ${invalidItem.selectedSerials.length})`);
      return;
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

      const res = await fetch(`/api/peminjaman?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'DIPINJAM', // Force status to DIPINJAM on save
          catatan: catatanBarang,
          tanggal_pinjam: tanggalPinjam,
          tanggal_kembali: tanggalKembali || null,
          items: flattenedItems,
          quantities: quantitiesPayload
        }),
      });

      if (res.ok) {
        router.push('/data-peminjaman');
      } else {
        alert('Gagal menyimpan data');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Terjadi kesalahan saat menyimpan');
    }
  };

  const handleCetak = () => {
    window.print();
  };

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
          href="/data-peminjaman"
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            {items.map((item, index) => (
              <div
                key={item.id}
                style={{
                  border: '1px solid #E0E0E0',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  background: '#FFFFFF',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: '#333333' }}>
                    #{String(index + 1).padStart(2, '0')}
                  </div>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                    title="Hapus Barang (Tidak Aktif)"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Nama Produk</label>
                    <div style={{
                      padding: '12px 16px', background: '#FAFAFA', border: '1px solid #F3F4F6',
                      borderRadius: '8px', fontSize: '14px', color: '#333333', fontWeight: 500
                    }}>
                      {item.namaProduk}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Kuantitas</label>
                    <input
                      type="number"
                      min="1"
                      value={item.kuantitas}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                      style={{
                        width: '100%',
                        padding: '12px 16px', background: '#FFFFFF', border: '1px solid #E0E0E0',
                        borderRadius: '8px', fontSize: '14px', color: '#333333', fontWeight: 500
                      }}
                    />
                  </div>
                </div>

                {/* Serial Number Section */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Nomor Seri</label>

                  {/* Selected Serials List */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {item.selectedSerials.map(serial => (
                      <div key={serial.id} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '6px 12px', background: '#EFF6FF', borderRadius: '6px',
                        border: '1px solid #BFDBFE', color: '#2F516A', fontSize: '13px', fontWeight: 500
                      }}>
                        {serial.kode}
                        <button
                          type="button"
                          onClick={() => handleRemoveSerial(item.id, serial.id)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Serial Input */}
                  {item.selectedSerials.length < item.kuantitas && (
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={serialInputs[item.id] || ''}
                        onChange={(e) => setSerialInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                        onFocus={() => setActiveSerialInput(item.id)}
                        onBlur={() => setTimeout(() => setActiveSerialInput(null), 200)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (item.productId) {
                              handleAddSerial(item.id, item.productId);
                            }
                          }
                        }}
                        placeholder={item.productId ? `Ketik nomor seri (tersedia: ${(availableSerials[item.productId] || []).length})` : "Loading..."}
                        style={{
                          ...inputStyle,
                          paddingRight: '40px',
                          background: item.productId ? '#FFFFFF' : '#FAFAFA'
                        }}
                      />

                      {/* Check if active and has content */}
                      {activeSerialInput === item.id && item.productId && availableSerials[item.productId] && availableSerials[item.productId].length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px',
                          marginTop: '4px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          zIndex: 10,
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                          {availableSerials[item.productId]
                            .filter(s => {
                              const query = (serialInputs[item.id] || '').toLowerCase();
                              const fullText = `${s.produk?.nama || ''} ${s.produk?.merk || ''} ${s.produk?.model || ''} ${s.produk?.spesifikasi || ''} ${s.kode_seri || ''}`.toLowerCase();
                              const isSelected = item.selectedSerials.some(selected => selected.id === s.id);
                              return fullText.includes(query) && !isSelected;
                            })
                            .map(s => (
                              <div
                                key={s.id}
                                onClick={() => item.productId && handleAddSerial(item.id, item.productId, s.kode_seri || s.id.toString())}
                                style={{
                                  padding: '10px 16px',
                                  fontSize: '14px',
                                  color: '#333333',
                                  cursor: 'pointer',
                                  borderBottom: '1px solid #F5F5F5'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                              >
                                <div style={{ fontWeight: 500 }}>
                                  {s.produk?.nama} {s.produk?.merk} {s.produk?.model}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666666' }}>
                                  {s.produk?.spesifikasi} - <strong>{s.kode_seri || `ID: ${s.id}`}</strong> ({s.kondisi})
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => item.productId && handleAddSerial(item.id, item.productId)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          cursor: 'pointer',
                          color: '#2F516A',
                          border: 'none',
                          background: 'transparent',
                          fontSize: '20px',
                          fontWeight: 300,
                        }}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Simpan
          </button>
          <button
            type="button"
            onClick={handleCetak}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: '#FFFFFF',
              color: '#333333',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 14h12v8H6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Cetak
          </button>
        </div>
      </div>
    </div>
  );
}
