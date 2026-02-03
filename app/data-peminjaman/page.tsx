'use client';

import { useState } from 'react';
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
  alasan?: string;
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

const DUMMY_PENGAJUAN: Pengajuan[] = [
  {
    id: '1',
    status: 'KEMBALI',
    kode_resi: '21012026-001',
    alasan: 'Type OTG, dipinjam untuk DDK',
    tanggal_pinjam: '2026-01-21T08:00:00',
    tanggal_kembali: '2026-01-21T16:00:00',
    peminjam: {
      id: 'p1',
      nama: 'Adinda F',
      nomor_induk: '246151837063',
      kelas: 'XII RPL B',
    },
    detail_pengajuan: [
      { id: 'dp1', kuantitas: 1, produk: { id: 1, nama: 'Flashdisk' } },
    ],
  },
  {
    id: '2',
    status: 'DIAJUKAN',
    kode_resi: '22012026-002',
    alasan: 'Praktikum',
    tanggal_pinjam: '2026-01-22T09:00:00',
    tanggal_kembali: null,
    peminjam: {
      id: 'p2',
      nama: 'Budi S',
      nomor_induk: '246151837064',
      kelas: 'XII RPL A',
    },
    detail_pengajuan: [
      { id: 'dp2', kuantitas: 2, produk: { id: 2, nama: 'Tissue' } },
      { id: 'dp3', kuantitas: 1, produk: { id: 1, nama: 'Flashdisk' } },
    ],
  },
  {
    id: '3',
    status: 'DIPINJAM',
    kode_resi: '20012026-003',
    alasan: 'Presentasi',
    tanggal_pinjam: '2026-01-20T10:00:00',
    tanggal_kembali: null,
    peminjam: {
      id: 'p3',
      nama: 'Citra D',
      nomor_induk: '246151837065',
      kelas: 'XI MM B',
    },
    detail_pengajuan: [
      { id: 'dp4', kuantitas: 1, produk: { id: 3, nama: 'HDMI' } },
    ],
  },
  {
    id: '4',
    status: 'TERLAMBAT',
    kode_resi: '15012026-004',
    alasan: '-',
    tanggal_pinjam: '2026-01-15T08:00:00',
    tanggal_kembali: null,
    peminjam: {
      id: 'p4',
      nama: 'Dewi L',
      nomor_induk: '246151837066',
      kelas: 'XII TKJ A',
    },
    detail_pengajuan: [
      { id: 'dp5', kuantitas: 1, produk: { id: 1, nama: 'Flashdisk' } },
      { id: 'dp6', kuantitas: 1, produk: { id: 4, nama: 'Raspberry Pi' } },
    ],
  },
];

export default function DataPeminjamanPage() {
  const [pengajuanList, setPengajuanList] = useState<Pengajuan[]>(DUMMY_PENGAJUAN);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusPengajuan | 'SEMUA'>('SEMUA');
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedPengajuanReturn, setSelectedPengajuanReturn] = useState<Pengajuan | null>(null);
  const [kondisiBarang, setKondisiBarang] = useState('bagus');
  const [letakBarang, setLetakBarang] = useState('');

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

  const summaryCards: { key: 'SEMUA' | StatusPengajuan; label: string; count: number; primary?: boolean }[] = [
    { key: 'SEMUA', label: 'Semua', count: counts.SEMUA, primary: true },
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
            marginBottom: '8px',
            margin: 0,
          }}
        >
          Peminjaman
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
            const isPrimary = card.primary && isSelected;
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
                  border: isPrimary ? 'none' : isSelected ? '2px solid #2F516A' : '1px solid #E0E0E0',
                  background: isPrimary ? '#2F516A' : '#FFFFFF',
                  color: isPrimary ? '#FFFFFF' : '#333333',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: isPrimary ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
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
              Memuat...
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
                            <button
                              type="button"
                              title="Pengembalian Barang"
                              onClick={() => {
                                setSelectedPengajuanReturn(p);
                                setKondisiBarang('bagus');
                                setLetakBarang('');
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
                  <option value="bagus">Bagus</option>
                  <option value="rusak">Rusak</option>
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
              <input
                type="text"
                value={letakBarang}
                onChange={(e) => setLetakBarang(e.target.value)}
                placeholder="Ketik letak barang disini..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: letakBarang ? '#333333' : '#9CA3AF',
                  background: '#FFFFFF',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start' }}>
              <button
                type="button"
                onClick={() => {
                  setReturnModalOpen(false);
                  setSelectedPengajuanReturn(null);
                }}
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
