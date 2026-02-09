'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

type StatusPengajuan = 'DIAJUKAN' | 'DIPINJAM' | 'KEMBALI' | 'TERLAMBAT';

interface Peminjam {
  id: string;
  nama: string;
  nomor_induk: string;
  kelas: string | null;
}

interface Produk {
  id: number;
  nama: string;
}

interface DetailPengajuan {
  id: string;
  kuantitas: number;
  produk: Produk;
}

interface Pengajuan {
  id: string;
  status: StatusPengajuan;
  kode_resi?: string;
  catatan?: string;
  tanggal_pinjam: string;
  tanggal_kembali: string | null;
  peminjam: Peminjam;
  detail_pengajuan: DetailPengajuan[];
}

const STATUS_LABEL: Record<StatusPengajuan, string> = {
  DIAJUKAN: 'Diajukan',
  DIPINJAM: 'Dipinjam',
  KEMBALI: 'Dikembalikan',
  TERLAMBAT: 'Terlambat',
};

const STATUS_COLOR: Record<StatusPengajuan, { bg: string; text: string }> = {
  DIAJUKAN: { bg: '#FFF7ED', text: '#9A3412' },
  DIPINJAM: { bg: '#F3E8FF', text: '#6B21A8' },
  KEMBALI: { bg: '#D1FAE5', text: '#065F46' },
  TERLAMBAT: { bg: '#FEE2E2', text: '#991B1B' },
};

function formatDate(d: string | null): string {
  if (!d) return '-';
  const date = new Date(d);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}



export default function DataPeminjamanPage() {
  const [pengajuanList, setPengajuanList] = useState<Pengajuan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusPengajuan | 'SEMUA'>('SEMUA');

  // Return modal state (kept for future implementation/UI consistency)
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedPengajuanReturn, setSelectedPengajuanReturn] = useState<Pengajuan | null>(null);
  const [kondisiBarang, setKondisiBarang] = useState('BAIK');

  // Location Autofill State
  const [lokasiList, setLokasiList] = useState<any[]>([]);
  const [lokasiSearchQuery, setLokasiSearchQuery] = useState('');
  const [showLokasiDropdown, setShowLokasiDropdown] = useState(false);
  const [selectedRuang, setSelectedRuang] = useState<string | null>(null);
  const [selectedLokasiId, setSelectedLokasiId] = useState<number | null>(null);



  const fetchPeminjaman = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/peminjaman');
      if (res.ok) {
        const data = await res.json();
        setPengajuanList(data);
      }
    } catch (error) {
      console.error('Failed to fetch peminjaman:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeminjaman();
    fetchLokasi();
  }, []);

  const fetchLokasi = async () => {
    try {
      const res = await fetch('/api/lokasi');
      if (res.ok) {
        const data = await res.json();
        setLokasiList(data);
      }
    } catch (error) {
      console.error('Failed to fetch lokasi:', error);
    }
  };

  // Location Filtering Logic
  const filteredLokasi = (() => {
    if (!selectedRuang) {
      const uniqueRuangs = Array.from(new Set(lokasiList.map(l => l.nama_ruang)));
      return uniqueRuangs
        .filter(ruang => ruang.toLowerCase().includes(lokasiSearchQuery.toLowerCase()))
        .map(ruang => ({ type: 'ruang', value: ruang }));
    } else {
      return lokasiList
        .filter(l => l.nama_ruang === selectedRuang)
        .filter(l => l.keterangan.toLowerCase().includes(lokasiSearchQuery.toLowerCase()))
        .map(l => ({ type: 'lokasi', value: l }));
    }
  })();

  const createNewLocation = async (ruang: string, keterangan: string) => {
    try {
      const response = await fetch('/api/lokasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama_ruang: ruang, keterangan }),
      });

      if (!response.ok) throw new Error('Failed to create location');

      const newLokasi = await response.json();
      setLokasiList(prev => [...prev, newLokasi]);
      setSelectedLokasiId(newLokasi.id);
      setLokasiSearchQuery(newLokasi.keterangan);
      setShowLokasiDropdown(false);
    } catch (error) {
      console.error('Error creating location:', error);
      alert('Gagal membuat lokasi baru');
    }
  };

  const handleSelectLokasiItem = async (item: any) => {
    if (item.type === 'ruang') {
      setSelectedRuang(item.value);
      setLokasiSearchQuery('');
      setShowLokasiDropdown(true);
    } else if (item.type === 'lokasi') {
      const lokasi = item.value;
      setSelectedLokasiId(lokasi.id);
      setLokasiSearchQuery(''); // Just show selected state
      setShowLokasiDropdown(false);
    } else if (item.type === 'new_ruang') {
      setSelectedRuang(lokasiSearchQuery);
      setLokasiSearchQuery('');
      setShowLokasiDropdown(true);
    } else if (item.type === 'new_lokasi') {
      await createNewLocation(selectedRuang!, lokasiSearchQuery);
      setLokasiSearchQuery('');
    }
  };

  const handleClearLokasi = () => {
    setSelectedLokasiId(null);
    setLokasiSearchQuery('');
    setShowLokasiDropdown(true);
  };

  const handleClearRuang = () => {
    setSelectedRuang(null);
    setLokasiSearchQuery('');
    setSelectedLokasiId(null);
    setShowLokasiDropdown(true);
  };

  const selectedKeterangan = selectedLokasiId
    ? lokasiList.find(l => l.id === selectedLokasiId)?.keterangan
    : null;

  const handleTolak = async (id: string) => {
    if (!confirm('Apakah anda yakin ingin menolak pengajuan ini? Data akan dihapus permanen.')) return;

    try {
      const res = await fetch(`/api/peminjaman?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPeminjaman();
      } else {
        alert('Gagal menolak pengajuan');
      }
    } catch (e) {
      console.error('Error deleting:', e);
      alert('Terjadi kesalahan');
    }
  };

  const handleConfirmReturn = async () => {
    if (!selectedPengajuanReturn || (!selectedLokasiId && !lokasiSearchQuery && !selectedRuang)) {
      alert('Mohon isi letak barang');
      return;
    }

    try {
      const res = await fetch(`/api/peminjaman?id=${selectedPengajuanReturn.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'KEMBALI',
          condition: kondisiBarang,
          // If we have an ID, send it. If not, try to construct a name from Ruang + Query (fallback)
          id_lokasi: selectedLokasiId,
          location_name: selectedLokasiId ? undefined : (selectedRuang || lokasiSearchQuery)
        })
      });

      if (res.ok) {
        setReturnModalOpen(false);
        setSelectedPengajuanReturn(null);
        // Reset Location State
        setSelectedLokasiId(null);
        setSelectedRuang(null);
        setLokasiSearchQuery('');

        fetchPeminjaman();
      } else {
        alert('Gagal memproses pengembalian');
      }
    } catch (e) {
      console.error('Error returning:', e);
      alert('Terjadi kesalahan');
    }
  };

  const filteredList = pengajuanList.filter((p) => {
    const matchStatus =
      statusFilter === 'SEMUA' || p.status === statusFilter;
    const searchLower = search.toLowerCase().trim();
    if (!searchLower) return matchStatus;
    const namaPeminjam = `${p.peminjam?.nama || ''} ${p.peminjam?.nomor_induk || ''} ${p.peminjam?.kelas || ''}`.toLowerCase();
    const barangNames = p.detail_pengajuan?.map((d) => d.produk?.nama || '').join(' ').toLowerCase() || '';
    const matchSearch =
      namaPeminjam.includes(searchLower) || barangNames.includes(searchLower);
    return matchStatus && matchSearch;
  });

  const counts = {
    SEMUA: pengajuanList.length,
    DIAJUKAN: pengajuanList.filter((p) => p.status === 'DIAJUKAN').length,
    DIPINJAM: pengajuanList.filter((p) => p.status === 'DIPINJAM').length,
    TERLAMBAT: pengajuanList.filter((p) => p.status === 'TERLAMBAT').length,
    KEMBALI: pengajuanList.filter((p) => p.status === 'KEMBALI').length,
  };

  const summaryCards: { key: 'SEMUA' | StatusPengajuan; label: string; count: number }[] = [
    { key: 'SEMUA', label: 'Semua', count: counts.SEMUA },
    { key: 'DIAJUKAN', label: 'Diajukan', count: counts.DIAJUKAN },
    { key: 'DIPINJAM', label: 'Dipinjam', count: counts.DIPINJAM },
    { key: 'TERLAMBAT', label: 'Terlambat', count: counts.TERLAMBAT },
    { key: 'KEMBALI', label: 'Dikembalikan', count: counts.KEMBALI },
  ];

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
        {/* Header */}
        <h1
          style={{
            color: '#333333',
            fontSize: '32px',
            fontWeight: 700,
            marginBottom: '8px'
          }}
        >
          Peminjaman
        </h1>
        <p
          style={{
            color: '#666666',
            fontSize: '16px',
            fontWeight: 400,
            marginBottom: '32px'
          }}
        >
          Kelola pengajuan dan status peminjaman barang lab
        </p>

        {/* Summary Cards - equal width */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          {summaryCards.map((card) => {
            const isSelected = statusFilter === card.key;
            // Use primary style if selected, regardless of which tab it is
            const isPrimary = isSelected;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setStatusFilter(card.key)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  padding: '16px 12px',
                  borderRadius: '12px',
                  border: isPrimary ? 'none' : '1px solid #E0E0E0',
                  background: isPrimary ? '#2F516A' : '#FFFFFF',
                  color: isPrimary ? '#FFFFFF' : '#333333',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: isPrimary ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '24px', fontWeight: 700, lineHeight: 1.2 }}>
                  {card.count}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 500, marginTop: '4px' }}>
                  {card.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div
          style={{
            position: 'relative',
            marginBottom: '24px',
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama peminjam atau barang..."
            style={{
              width: '100%',
              padding: '12px 16px 12px 40px',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              fontSize: '14px',
              color: search ? '#000000' : '#999999',
              background: '#FFFFFF',
              fontFamily: 'inherit',
              outline: 'none',
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="7"
                cy="7"
                r="5"
                stroke="#666666"
                strokeWidth="1.5"
              />
              <path
                d="M11 11L14 14"
                stroke="#666666"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div
              style={{
                padding: '48px',
                textAlign: 'center',
                color: '#666666',
              }}
            >
              Memuat data peminjaman...
            </div>
          ) : filteredList.length === 0 ? (
            <div
              style={{
                padding: '48px',
                textAlign: 'center',
                color: '#666666',
              }}
            >
              Tidak ada data peminjaman.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: '#E3F2FD',
                      borderBottom: '1px solid #E0E0E0',
                    }}
                  >
                    <th
                      style={{
                        padding: '14px 16px',
                        textAlign: 'left',
                        color: '#333333',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      No
                    </th>
                    <th
                      style={{
                        padding: '14px 16px',
                        textAlign: 'left',
                        color: '#333333',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Nama Peminjam
                    </th>
                    <th
                      style={{
                        padding: '14px 16px',
                        textAlign: 'left',
                        color: '#333333',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Barang
                    </th>
                    <th
                      style={{
                        padding: '14px 16px',
                        textAlign: 'left',
                        color: '#333333',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Jumlah
                    </th>
                    <th
                      style={{
                        padding: '14px 16px',
                        textAlign: 'left',
                        color: '#333333',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Tanggal Pinjam
                    </th>
                    <th
                      style={{
                        padding: '14px 16px',
                        textAlign: 'left',
                        color: '#333333',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Tanggal Kembali
                    </th>
                    <th
                      style={{
                        padding: '14px 16px',
                        textAlign: 'left',
                        color: '#333333',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: '14px 16px',
                        textAlign: 'left',
                        color: '#333333',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((p, index) => {
                    const namaPeminjam = p.peminjam
                      ? `${p.peminjam.nama} - ${p.peminjam.kelas || ''} - ${p.peminjam.nomor_induk}`
                      : '-';
                    const barang = p.detail_pengajuan
                      ?.map((d) => d.produk?.nama || '')
                      .filter(Boolean)
                      .join(', ') || '-';
                    const jumlah = p.detail_pengajuan?.reduce(
                      (s, d) => s + (d.kuantitas || 0),
                      0
                    ) ?? 0;
                    const statusStyle = STATUS_COLOR[p.status] || {
                      bg: '#F5F5F5',
                      text: '#333333',
                    };
                    return (
                      <tr
                        key={p.id}
                        style={{
                          borderBottom: '1px solid #F0F0F0',
                        }}
                      >
                        <td
                          style={{
                            padding: '14px 16px',
                            color: '#333333',
                            fontSize: '14px',
                          }}
                        >
                          {index + 1}
                        </td>
                        <td
                          style={{
                            padding: '14px 16px',
                            color: '#2F516A',
                            fontSize: '14px',
                            fontWeight: 500,
                          }}
                        >
                          {namaPeminjam}
                        </td>
                        <td
                          style={{
                            padding: '14px 16px',
                            color: '#333333',
                            fontSize: '14px',
                          }}
                        >
                          {barang}
                        </td>
                        <td
                          style={{
                            padding: '14px 16px',
                            color: '#333333',
                            fontSize: '14px',
                          }}
                        >
                          {jumlah}
                        </td>
                        <td
                          style={{
                            padding: '14px 16px',
                            color: '#333333',
                            fontSize: '14px',
                          }}
                        >
                          {formatDate(p.tanggal_pinjam)}
                        </td>
                        <td
                          style={{
                            padding: '14px 16px',
                            color: '#333333',
                            fontSize: '14px',
                          }}
                        >
                          {formatDate(p.tanggal_kembali)}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              background: statusStyle.bg,
                              color: statusStyle.text,
                              fontSize: '12px',
                              fontWeight: 500,
                            }}
                          >
                            {STATUS_LABEL[p.status]}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div
                            style={{
                              display: 'flex',
                              gap: '8px',
                              alignItems: 'center',
                            }}
                          >
                            {p.status === 'DIAJUKAN' && (
                              <>
                                <Link
                                  href={`/data-peminjaman/proses/${p.id}`}
                                  title="Proses Peminjaman"
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    border: '1px solid #E0E0E0',
                                    background: '#FFFFFF',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textDecoration: 'none',
                                  }}
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M13 4L6 11L3 8"
                                      stroke="#666666"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </Link>
                                <button
                                  type="button"
                                  title="Tolak"
                                  onClick={() => handleTolak(p.id)}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    border: '1px solid #E0E0E0',
                                    background: '#FFFFFF',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M12 4L4 12M4 4l8 8"
                                      stroke="#666666"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                </button>
                              </>
                            )}

                            {(p.status === 'DIPINJAM' || p.status === 'TERLAMBAT') && (
                              <button
                                type="button"
                                title="Pengembalian Barang"
                                onClick={() => {
                                  setSelectedPengajuanReturn(p);
                                  setKondisiBarang('BAIK');
                                  // Reset Location State
                                  setSelectedLokasiId(null);
                                  setSelectedRuang(null);
                                  setLokasiSearchQuery('');
                                  setReturnModalOpen(true);
                                }}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  border: '1px solid #E0E0E0',
                                  background: '#FFFFFF',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M6 12L2 8l4-4M2 8h9a2 2 0 012 2v1"
                                    stroke="#666666"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>


      {/* Modal Pengembalian Barang */}
      {returnModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setReturnModalOpen(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '32px',
              width: '90%',
              maxWidth: '560px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <h2
                style={{
                  color: '#333333',
                  fontSize: '24px',
                  fontWeight: 700,
                  marginBottom: '8px',
                  margin: 0,
                }}
              >
                Pengembalian Barang
              </h2>
              <p
                style={{
                  color: '#666666',
                  fontSize: '14px',
                  fontWeight: 400,
                  margin: 0,
                }}
              >
                Konfirmasi pengembalian dan catat kondisi barang
              </p>
            </div>

            {/* Preview Invoice */}
            <div
              style={{
                background: '#F5F5F5',
                borderRadius: '12px',
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
              }}
            >
              <span style={{ color: '#9CA3AF', fontSize: '16px', fontWeight: 500 }}>
                Preview Invoice
              </span>
            </div>

            {/* Kondisi barang */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                Kondisi barang
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={kondisiBarang}
                  onChange={(e) => setKondisiBarang(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 16px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#333333',
                    background: '#FFFFFF',
                    appearance: 'none',
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                >
                  <option value="BAIK">Baik</option>
                  <option value="RUSAK">Rusak</option>
                </select>
                <div
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                >
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Letak */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                Letak
              </label>

              <div style={{ position: 'relative' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  padding: '8px 12px',
                  gap: '8px'
                }}>
                  {/* Chip for Selected Ruang */}
                  {selectedRuang && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#ECEFF1',
                      borderRadius: '16px',
                      padding: '4px 12px',
                      gap: '8px',
                      width: 'auto',
                      minWidth: '100px',
                      maxWidth: '45%'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#333333',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1
                      }}>
                        {selectedRuang}
                      </span>
                      <button
                        type="button"
                        onClick={handleClearRuang}
                        style={{
                          border: 'none',
                          color: '#1E1E1E',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          background: 'transparent'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18M6 6l12 12" stroke="#666666" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Chip for Selected Keterangan (Lokasi) */}
                  {selectedKeterangan && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#E0F2F1', // Greenish tint
                      borderRadius: '16px',
                      padding: '4px 12px',
                      gap: '6px',
                      width: 'auto',
                      minWidth: '100px',
                      maxWidth: '45%'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#00695C',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1
                      }}>
                        {selectedKeterangan}
                      </span>
                      <button
                        type="button"
                        onClick={handleClearLokasi}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#1E1E1E',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18M6 6l12 12" stroke="#666666" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Input Field - Hide if Keterangan is selected */}
                  {!selectedKeterangan && (
                    <input
                      type="text"
                      value={lokasiSearchQuery}
                      onChange={(e) => {
                        setLokasiSearchQuery(e.target.value);
                        setShowLokasiDropdown(true);
                      }}
                      onFocus={() => setShowLokasiDropdown(true)}
                      onBlur={() => setTimeout(() => setShowLokasiDropdown(false), 200)}
                      placeholder={selectedRuang ? "Ketik keterangan spesifik..." : "Pilih Ruangan"}
                      style={{
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        fontSize: '14px',
                        color: lokasiSearchQuery ? '#000000' : '#999999',
                        fontFamily: 'inherit',
                        flex: 1
                      }}
                    />
                  )}
                </div>

                {/* Lokasi Dropdown */}
                {showLokasiDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    background: '#FFFFFF',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #F3F4F6',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 20
                  }}>
                    {filteredLokasi.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectLokasiItem(item)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: '#333333',
                          borderBottom: '1px solid #F9FAFB'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                      >
                        {item.type === 'ruang' ? (item.value as string) : (item.value as any).keterangan}
                      </div>
                    ))}

                    {!selectedRuang && !filteredLokasi.some(i => i.type === 'ruang' && i.value === lokasiSearchQuery) && lokasiSearchQuery && (
                      <div
                        onClick={() => handleSelectLokasiItem({ type: 'new_ruang' })}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: '#2F516A',
                          fontWeight: 500,
                          borderTop: '1px solid #F3F4F6'
                        }}
                      >
                        + Tambahkan ruang baru "{lokasiSearchQuery}"
                      </div>
                    )}

                    {selectedRuang && !filteredLokasi.some(i => i.type === 'lokasi' && (i.value as any).keterangan === lokasiSearchQuery) && lokasiSearchQuery && (
                      <div
                        onClick={() => handleSelectLokasiItem({ type: 'new_lokasi' })}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: '#2F516A',
                          fontWeight: 500,
                          borderTop: '1px solid #F3F4F6'
                        }}
                      >
                        + Tambahkan lokasi baru di {selectedRuang} "{lokasiSearchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start' }}>
              <button
                type="button"
                onClick={handleConfirmReturn}
                style={{
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
                Konfirmasi
              </button>
              <button
                type="button"
                onClick={() => {
                  setReturnModalOpen(false);
                  setSelectedPengajuanReturn(null);
                }}
                style={{
                  padding: '12px 24px',
                  background: '#FFFFFF',
                  color: '#2F516A',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
