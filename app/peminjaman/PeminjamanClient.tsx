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
  foto?: string;
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
  const [kondisiBarang, setKondisiBarang] = useState<Record<number, string>>({});



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

    const handleSync = () => fetchPeminjaman();
    window.addEventListener('syncData', handleSync);
    return () => window.removeEventListener('syncData', handleSync);
  }, []);


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
    if (!selectedPengajuanReturn) {
      return;
    }

    try {
      const res = await fetch(`/api/peminjaman?id=${selectedPengajuanReturn.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'KEMBALI',
          itemConditions: kondisiBarang
        })
      });

      if (res.ok) {
        setReturnModalOpen(false);
        setSelectedPengajuanReturn(null);
        setKondisiBarang({});

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
            <iconify-icon icon="mdi:magnify" style={{ color: '#666666', fontSize: '16px' }}></iconify-icon>
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
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <iconify-icon icon="line-md:loading-twotone-loop" style={{ fontSize: '24px', color: '#2F516A' }}></iconify-icon>
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
                                  href={`/peminjaman/proses/${p.id}`}
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
                                  <iconify-icon icon="mdi:arrow-right" style={{ color: '#666666', fontSize: '16px' }}></iconify-icon>
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
                                  <iconify-icon icon="mdi:close" style={{ color: '#666666', fontSize: '16px' }}></iconify-icon>
                                </button>
                              </>
                            )}

                            {(p.status === 'DIPINJAM' || p.status === 'TERLAMBAT') && (
                              <button
                                type="button"
                                title="Pengembalian Barang"
                                onClick={() => {
                                  setSelectedPengajuanReturn(p);
                                  const initConds: Record<number, string> = {};
                                  p.detail_pengajuan?.forEach((dp: any) => {
                                    dp.detail_produk_pengajuan?.forEach((dpp: any) => {
                                      initConds[dpp.id_detail_produk] = 'BAIK';
                                    });
                                  });
                                  setKondisiBarang(initConds);
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
                                <iconify-icon icon="mdi:keyboard-return" style={{ color: '#666666', fontSize: '16px' }}></iconify-icon>
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

            {/* Preview Invoice Document */}
            <div
              style={{
                background: '#F5F5F5',
                borderRadius: '12px',
                height: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                overflow: 'hidden',
                border: '1px solid #E0E0E0'
              }}
            >
              {selectedPengajuanReturn ? (
                <iframe
                  src={`/api/cetak/${selectedPengajuanReturn.id}`}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Cetak Invoice Preview"
                />
              ) : (
                <span style={{ color: '#9CA3AF', fontSize: '16px', fontWeight: 500 }}>
                  Tidak dapat memuat invoice
                </span>
              )}
            </div>

            {/* Individual Item Conditions & Check */}
            <div style={{ marginBottom: '24px', maxHeight: '30vh', overflowY: 'auto' }}>
              <label
                style={{
                  display: 'block',
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '12px',
                }}
              >
                Kondisi Pengembalian Masing-Masing Barang
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedPengajuanReturn?.detail_pengajuan?.flatMap((dp: any) => 
                  dp.detail_produk_pengajuan?.map((dpp: any) => {
                    const productId = dpp.id_detail_produk;
                    const lokasi = dpp.detail_produk?.lokasi;
                    const locationText = lokasi ? `${lokasi.nama_ruang} - ${lokasi.keterangan}` : '-';

                    return (
                      <div key={productId} style={{ padding: '12px', border: '1px solid #E0E0E0', borderRadius: '8px', background: '#FAFAFA' }}>
                        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#333333' }}>
                          {dp.produk?.nama} - {dpp.detail_produk?.kode_scan || dpp.detail_produk?.kode_seri || `ID: ${productId}`}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                           <div style={{ fontSize: '12px', color: '#666666' }}>
                              Kembalikan ke Letak: <strong>{locationText}</strong>
                           </div>
                           <select
                             value={kondisiBarang[productId] || 'BAIK'}
                             onChange={(e) => setKondisiBarang(prev => ({ ...prev, [productId]: e.target.value }))}
                             style={{
                               padding: '8px 12px',
                               border: '1px solid #E0E0E0',
                               borderRadius: '6px',
                               fontSize: '13px',
                               background: '#FFFFFF',
                               outline: 'none',
                               flexShrink: 0,
                               width: '120px'
                             }}
                           >
                             <option value="BAIK">Baik</option>
                             <option value="RUSAK">Rusak</option>
                           </select>
                        </div>
                      </div>
                    );
                  })
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
