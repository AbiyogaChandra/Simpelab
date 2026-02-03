'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

type StatusPengajuan = 'DIAJUKAN' | 'DIPINJAM' | 'KEMBALI' | 'TERLAMBAT';

interface BarangItem {
  id: string;
  namaProduk: string;
  kuantitas: string;
  nomorSeri: string;
}

const STATUS_LABEL: Record<StatusPengajuan, string> = {
  DIAJUKAN: 'Diajukan',
  DIPINJAM: 'Dipinjam',
  KEMBALI: 'Dikembalikan',
  TERLAMBAT: 'Terlambat',
};

const DEFAULT_DATA: Record<string, {
  kode_resi: string;
  status: StatusPengajuan;
  kategori: 'guru' | 'siswa';
  identitas: string;
  items: BarangItem[];
  catatanBarang: string;
  tanggalPinjam: string;
  tanggalKembali: string;
}> = {
  '1': {
    kode_resi: '21012026-001',
    status: 'DIAJUKAN',
    kategori: 'guru',
    identitas: 'Adinda F - XII RPL B - 246151837063',
    items: [
      { id: '1', namaProduk: 'Flashdisk', kuantitas: '2', nomorSeri: '' },
      { id: '2', namaProduk: 'HDMI', kuantitas: '2', nomorSeri: '' },
    ],
    catatanBarang: 'Type OTG, dipinjam untuk DDK',
    tanggalPinjam: '2026-01-21',
    tanggalKembali: '2026-01-21',
  },
  '2': {
    kode_resi: '22012026-002',
    status: 'DIAJUKAN',
    kategori: 'siswa',
    identitas: 'Budi S - XII RPL A - 246151837064',
    items: [
      { id: '1', namaProduk: 'Tissue', kuantitas: '2', nomorSeri: '' },
      { id: '2', namaProduk: 'Flashdisk', kuantitas: '1', nomorSeri: '' },
    ],
    catatanBarang: 'Praktikum',
    tanggalPinjam: '2026-01-22',
    tanggalKembali: '',
  },
  '3': {
    kode_resi: '20012026-003',
    status: 'DIPINJAM',
    kategori: 'siswa',
    identitas: 'Citra D - XI MM B - 246151837065',
    items: [{ id: '1', namaProduk: 'HDMI', kuantitas: '1', nomorSeri: '' }],
    catatanBarang: 'Presentasi',
    tanggalPinjam: '2026-01-20',
    tanggalKembali: '',
  },
  '4': {
    kode_resi: '15012026-004',
    status: 'TERLAMBAT',
    kategori: 'siswa',
    identitas: 'Dewi L - XII TKJ A - 246151837066',
    items: [
      { id: '1', namaProduk: 'Flashdisk', kuantitas: '1', nomorSeri: '' },
      { id: '2', namaProduk: 'Raspberry Pi', kuantitas: '1', nomorSeri: '' },
    ],
    catatanBarang: '-',
    tanggalPinjam: '2026-01-15',
    tanggalKembali: '',
  },
};

export default function ProsesPeminjamanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [kodeResi, setKodeResi] = useState('');
  const [status, setStatus] = useState<StatusPengajuan>('DIAJUKAN');
  const [kategori, setKategori] = useState<'guru' | 'siswa'>('guru');
  const [identitas, setIdentitas] = useState('');
  const [items, setItems] = useState<BarangItem[]>([]);
  const [catatanBarang, setCatatanBarang] = useState('');
  const [tanggalPinjam, setTanggalPinjam] = useState('');
  const [tanggalKembali, setTanggalKembali] = useState('');

  useEffect(() => {
    const data = id ? DEFAULT_DATA[id] : DEFAULT_DATA['1'];
    if (data) {
      setKodeResi(data.kode_resi);
      setStatus(data.status);
      setKategori(data.kategori);
      setIdentitas(data.identitas);
      setItems(data.items.map((i) => ({ ...i })));
      setCatatanBarang(data.catatanBarang);
      setTanggalPinjam(data.tanggalPinjam);
      setTanggalKembali(data.tanggalKembali);
    } else {
      const fallback = DEFAULT_DATA['1'];
      setKodeResi(fallback.kode_resi);
      setStatus(fallback.status);
      setKategori(fallback.kategori);
      setIdentitas(fallback.identitas);
      setItems(fallback.items.map((i) => ({ ...i })));
      setCatatanBarang(fallback.catatanBarang);
      setTanggalPinjam(fallback.tanggalPinjam);
      setTanggalKembali(fallback.tanggalKembali);
    }
  }, [id]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        namaProduk: '',
        kuantitas: '1',
        nomorSeri: '',
      },
    ]);
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateItem = (itemId: string, field: keyof BarangItem, value: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, [field]: value } : i))
    );
  };

  const handleSimpan = () => {
    // TODO: API save
    router.push('/data-peminjaman');
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
            marginBottom: '8px',
            margin: 0,
          }}
        >
          Proses Peminjaman
        </h1>
        <p
          style={{
            color: '#666666',
            fontSize: '16px',
            fontWeight: 400,
            marginBottom: '24px',
            margin: 0,
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
          {/* Data Peminjam */}
          <h2
            style={{
              color: '#333333',
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: '20px',
              margin: 0,
            }}
          >
            Data Peminjam
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginBottom: '24px',
            }}
          >
            <div>
              <label style={{ display: 'block', color: '#666666', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                Nomor Resi
              </label>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#333333' }}>
                {kodeResi}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', color: '#666666', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                Status
              </label>
              <span
                style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  background: '#EA580C',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                {STATUS_LABEL[status]}
              </span>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginBottom: '24px',
            }}
          >
            <div>
              <label style={{ display: 'block', color: '#666666', fontSize: '14px', fontWeight: 500, marginBottom: '10px' }}>
                Kategori Peminjam
              </label>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="kategori"
                    checked={kategori === 'guru'}
                    onChange={() => setKategori('guru')}
                    style={{ width: '18px', height: '18px', accentColor: '#2F516A' }}
                  />
                  <span style={{ fontSize: '14px', color: '#333333' }}>Guru</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="kategori"
                    checked={kategori === 'siswa'}
                    onChange={() => setKategori('siswa')}
                    style={{ width: '18px', height: '18px', accentColor: '#2F516A' }}
                  />
                  <span style={{ fontSize: '14px', color: '#333333' }}>Siswa</span>
                </label>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', color: '#666666', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                Identitas
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={identitas}
                  onChange={(e) => setIdentitas(e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingLeft: '40px',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" stroke="#666666" strokeWidth="1.5" />
                    <path d="M2 14C2 11.7909 4.68629 10 8 10C11.3137 10 14 11.7909 14 14" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Barang */}
          <h2
            style={{
              color: '#333333',
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: '16px',
              margin: 0,
            }}
          >
            Barang
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            {items.map((item, index) => (
              <div
                key={item.id}
                style={{
                  flex: '1 1 280px',
                  maxWidth: '400px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '12px',
                  padding: '16px',
                  background: '#FAFAFA',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#333333' }}>
                    #{String(index + 1).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Hapus"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10 11v6M14 11v6" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666666', marginBottom: '4px' }}>Nama Produk</label>
                  <input
                    type="text"
                    value={item.namaProduk}
                    onChange={(e) => updateItem(item.id, 'namaProduk', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666666', marginBottom: '4px' }}>Kuantitas</label>
                  <input
                    type="text"
                    value={item.kuantitas}
                    onChange={(e) => updateItem(item.id, 'kuantitas', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666666', marginBottom: '4px' }}>Nomor Seri</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={item.nomorSeri}
                      onChange={(e) => updateItem(item.id, 'nomorSeri', e.target.value)}
                      placeholder="Contoh : 001"
                      style={{
                        ...inputStyle,
                        paddingRight: '40px',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        color: '#2F516A',
                        fontSize: '18px',
                        fontWeight: 600,
                      }}
                    >
                      +
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              maxWidth: '400px',
              padding: '12px',
              border: '1px solid #2F516A',
              borderRadius: '8px',
              background: '#FFFFFF',
              color: '#2F516A',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <span>+</span>
            Tambahkan Barang
          </button>

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
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={tanggalPinjam}
                  onChange={(e) => setTanggalPinjam(e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingRight: '40px',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2H4C2.89543 2 2 2.89543 2 4V12C2 13.1046 2.89543 14 4 14H12C13.1046 14 14 13.1046 14 12V4C14 2.89543 13.1046 2 12 2Z" stroke="#666666" strokeWidth="1.5" />
                    <path d="M2 6H14" stroke="#666666" strokeWidth="1.5" />
                    <path d="M5 2V6" stroke="#666666" strokeWidth="1.5" />
                    <path d="M11 2V6" stroke="#666666" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', color: '#666666', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                Tanggal Kembali
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={tanggalKembali}
                  onChange={(e) => setTanggalKembali(e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingRight: '40px',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2H4C2.89543 2 2 2.89543 2 4V12C2 13.1046 2.89543 14 4 14H12C13.1046 14 14 13.1046 14 12V4C14 2.89543 13.1046 2 12 2Z" stroke="#666666" strokeWidth="1.5" />
                    <path d="M2 6H14" stroke="#666666" strokeWidth="1.5" />
                    <path d="M5 2V6" stroke="#666666" strokeWidth="1.5" />
                    <path d="M11 2V6" stroke="#666666" strokeWidth="1.5" />
                  </svg>
                </div>
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
