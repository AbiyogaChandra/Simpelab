'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import QRCode from "react-qr-code";

// Interfaces based on Prisma schema and API response
interface Produk {
  id: number;
  kategori: string;
  nama: string;
  kode: string;
  merk: string;
  model: string;
  spesifikasi: string;
  kuantitas: number;
  stok?: number;
}

interface DetailProduk {
  id: number;
  id_produk: number;
  id_lokasi: number;
  status: string;
  kondisi: string;
  kode_seri: string | null;
  kode_scan: string | null;
  produk: Produk;
  lokasi: {
    id: number;
    nama_ruang: string;
    keterangan: string;
  };
}

export default function DataInventarisPage() {
  const router = useRouter();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<DetailProduk | null>(null);

  const [kategori, setKategori] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'produk' | 'barang'>('produk');
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const endpoint = activeTab === 'produk' ? '/api/produk' : '/api/detail-produk';
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();
        setInventoryData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setInventoryData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleEdit = (id: number, type: 'produk' | 'detail') => {
    if (type === 'produk') {
      router.push(`/create-produk?id=${id}`);
    } else {
      router.push(`/create-detail-produk?id=${id}`);
    }
  };

  const handleDelete = async (id: number, type: 'produk' | 'detail') => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

    try {
      const endpoint = type === 'produk' ? `/api/produk?id=${id}` : `/api/detail-produk?id=${id}`;
      const response = await fetch(endpoint, { method: 'DELETE' });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }

      alert('Data berhasil dihapus');
      // Refresh data
      const fetchEndpoint = activeTab === 'produk' ? '/api/produk' : '/api/detail-produk';
      const res = await fetch(fetchEndpoint);
      const data = await res.json();
      setInventoryData(data);
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Gagal menghapus data: ' + (error as Error).message);
    }
  };

  const handleView = (item: DetailProduk) => {
    setSelectedDetail(item);
    setViewModalOpen(true);
  };


  // Filter data client-side based on search and kategori
  const filteredData = inventoryData.filter((item) => {
    const searchTerm = search.toLowerCase();
    const categoryFilter = kategori.toLowerCase();

    if (activeTab === 'produk') {
      const p = item as Produk;
      if (!p) return false;

      const pName = p.nama?.toLowerCase() || '';
      const pKode = p.kode?.toLowerCase() || '';
      const pMerk = p.merk?.toLowerCase() || '';
      const pKategori = p.kategori?.toLowerCase() || '';

      const matchesSearch =
        pName.includes(searchTerm) ||
        pKode.includes(searchTerm) ||
        pMerk.includes(searchTerm);

      const matchesCategory = !categoryFilter || pKategori === categoryFilter;
      return matchesSearch && matchesCategory;
    } else {
      const d = item as DetailProduk;
      if (!d) return false;

      const pName = d.produk?.nama?.toLowerCase() || '';
      const serial = d.kode_seri?.toLowerCase() || '';
      const scan = d.kode_scan?.toLowerCase() || '';

      const matchesSearch =
        pName.includes(searchTerm) ||
        serial.includes(searchTerm) ||
        scan.includes(searchTerm);

      const dCategory = d.produk?.kategori?.toLowerCase() || '';
      const matchesCategory = !categoryFilter || dCategory === categoryFilter;
      return matchesSearch && matchesCategory;
    }
  });

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, kategori, activeTab]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F5',
      fontFamily: 'Outfit, sans-serif'
    }}>
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{
        marginLeft: '280px',
        padding: '32px',
        minHeight: '100vh'
      }}>
        {/* Page Header with Create Buttons */}
        <div>
          <h1 style={{
            color: '#333333',
            fontSize: '32px',
            fontWeight: 700,
            marginBottom: '8px'
          }}>
            Data Inventaris
          </h1>
          <p style={{
            color: '#666666',
            fontSize: '16px',
            fontWeight: 400,
            marginBottom: '32px'
          }}>
            Kelola dan lihat semua data inventaris
          </p>
        </div>

        {/* Controls Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setActiveTab('produk')}
              style={{
                padding: '10px 24px',
                borderRadius: '30px',
                border: 'none',
                background: activeTab === 'produk' ? '#2F516A' : '#FFFFFF',
                color: activeTab === 'produk' ? '#FFFFFF' : '#666666',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: activeTab === 'produk' ? '0 4px 6px -1px rgba(47, 81, 106, 0.2)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <iconify-icon icon="gridicons:product" width="20" />
              Produk
            </button>

            <button
              onClick={() => setActiveTab('barang')}
              style={{
                padding: '10px 24px',
                borderRadius: '30px',
                border: 'none',
                background: activeTab === 'barang' ? '#2F516A' : '#FFFFFF',
                color: activeTab === 'barang' ? '#FFFFFF' : '#666666',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: activeTab === 'barang' ? '0 4px 6px -1px rgba(47, 81, 106, 0.2)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <iconify-icon icon="ep:goods-filled" width="20" />
              Detail Produk
            </button>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link
              href="/create-produk"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#FFFFFF',
                color: '#2F516A',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid #E0E0E0',
                transition: 'all 0.2s'
              }}
            >
              <iconify-icon icon="ic:round-plus" width="16" />
              Buat Produk
            </Link>
            <Link
              href="/create-detail-produk"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#FFFFFF',
                color: '#2F516A',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid #E0E0E0',
                transition: 'all 0.2s'
              }}
            >
              <iconify-icon icon="ic:round-plus" width="16" />
              Buat Detail Produk
            </Link>
          </div>
        </div>

        {/* Filter Card Top */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px 12px 0 0',
          padding: '24px',
          borderBottom: '1px solid #F0F0F0',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' // Added shadow match
        }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center'
          }}>
            {/* Kategori Dropdown */}
            <div style={{
              position: 'relative',
              minWidth: '200px'
            }}>
              <div style={{ position: 'relative' }}>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    paddingLeft: '40px',
                    paddingRight: '40px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: kategori ? '#000000' : '#666666',
                    background: '#F9FAFB',
                    appearance: 'none',
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Kategori</option>
                  <option value="aset">Aset</option>
                  <option value="hp">Habis Pakai</option>
                </select>
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <iconify-icon icon="material-symbols:category-rounded" style={{ color: '#666666' }} width="16" />
                </div>
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  display: 'flex'
                }}>
                  <iconify-icon icon="icon-park-outline:down" style={{ color: '#666666' }} width="16" />
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div style={{
              flex: 1,
              position: 'relative'
            }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={activeTab === 'produk' ? "Cari nama, kode, atau merk..." : "Cari nama, kode seri..."}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    paddingLeft: '40px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: search ? '#000000' : '#666666',
                    background: '#FFFFFF',
                    fontFamily: 'inherit'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <iconify-icon icon="iconamoon:search" style={{ color: '#666666' }} width="16" />
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Conditional Rendering: Table or Empty State */}
        {loading ? (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '0 0 12px 12px',
            padding: '80px 32px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px'
          }}>
            <p>Loading...</p>
          </div>
        ) : filteredData.length > 0 ? (
          /* Table */
          <div style={{
            background: '#FFFFFF',
            borderRadius: '0 0 12px 12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{
                    background: '#E3F2FD',
                    borderBottom: '1px solid #E0E0E0'
                  }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#333333', fontSize: '14px', fontWeight: 600 }}>No</th>
                    {activeTab === 'produk' ? (
                      <>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#333333', fontSize: '14px', fontWeight: 600 }}>Kategori</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#333333', fontSize: '14px', fontWeight: 600 }}>Nama Produk</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#333333', fontSize: '14px', fontWeight: 600 }}>Kode Produk</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#333333', fontSize: '14px', fontWeight: 600 }}>Merk</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#333333', fontSize: '14px', fontWeight: 600 }}>Tipe/Model</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#333333', fontSize: '14px', fontWeight: 600 }}>Stok</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#333333', fontSize: '14px', fontWeight: 600 }}>Jumlah Barang</th>
                      </>
                    ) : (
                      <>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#333333', fontSize: '14px', fontWeight: 600 }}>Kategori</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#333333', fontSize: '14px', fontWeight: 600 }}>Nama Produk</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#333333', fontSize: '14px', fontWeight: 600 }}>Kode Seri</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#333333', fontSize: '14px', fontWeight: 600 }}>Lokasi</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#333333', fontSize: '14px', fontWeight: 600 }}>Status</th>
                      </>
                    )}
                    <th style={{ padding: '16px', textAlign: 'left', color: '#333333', fontSize: '14px', fontWeight: 600 }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, index) => {
                    const globalIndex = startIndex + index + 1; // Calculate global index for "No" column
                    // Render for Produk
                    if (activeTab === 'produk') {
                      const p = item as Produk;
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                          <td style={{ padding: '16px', color: '#333333', fontSize: '14px' }}>{globalIndex}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              background: '#E3F2FD',
                              color: '#333333',
                              fontSize: '12px',
                              fontWeight: 500
                            }}>
                              {p.kategori === 'ASET' ? 'Aset' : p.kategori === 'HP' ? 'Habis Pakai' : p.kategori}
                            </span>
                          </td>
                          <td style={{ padding: '16px', color: '#333333', fontSize: '14px' }}>{p.nama}</td>
                          <td style={{ padding: '16px', color: '#333333', fontSize: '14px' }}>{p.kode}</td>
                          <td style={{ padding: '16px', color: '#333333', fontSize: '14px' }}>{p.merk}</td>
                          <td style={{ padding: '16px', color: '#333333', fontSize: '14px' }}>{p.model}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              background: '#D1FAE5',
                              color: '#065F46',
                              fontSize: '12px',
                              fontWeight: 500
                            }}>
                              {p.stok ?? p.kuantitas}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              background: '#FFF7ED',
                              color: '#9A3412',
                              fontSize: '12px',
                              fontWeight: 500
                            }}>
                              {p.kuantitas} Items
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button
                                onClick={() => handleEdit(p.id, 'produk')}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#1E1E1E' }}
                                title="Edit"
                              >
                                <iconify-icon icon="material-symbols:edit-outline-rounded" width="18" height="18"></iconify-icon>
                              </button>
                              <button
                                onClick={() => handleDelete(p.id, 'produk')}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#E37158' }}
                                title="Delete"
                              >
                                <iconify-icon icon="fluent:delete-12-regular" width="18" height="18"></iconify-icon>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    } else {
                      // Render for Barang (DetailProduk)
                      const d = item as DetailProduk;
                      return (
                        <tr key={d.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                          <td style={{ padding: '16px', color: '#333333', fontSize: '14px' }}>{globalIndex}</td>
                          <td style={{ padding: '16px', color: '#333333', fontSize: '14px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              background: '#E3F2FD',
                              color: '#333333',
                              fontSize: '12px',
                              fontWeight: 500
                            }}>
                              {d.produk?.kategori === 'ASET' ? 'Aset' : d.produk?.kategori === 'HP' ? 'Habis Pakai' : d.produk?.kategori}
                            </span>
                          </td>
                          <td style={{ padding: '16px', color: '#333333', fontSize: '14px' }}>{d.produk?.nama || '-'}</td>
                          <td style={{ padding: '16px', color: '#333333', fontSize: '14px' }}>{d.kode_seri || '-'}</td>
                          {/* <td style={{ padding: '16px' }}>
                            <span style={{
                              color: d.kondisi === 'BAIK' ? '#047857' : '#DC2626',
                              fontWeight: 500,
                              fontSize: '14px'
                            }}>
                              {d.kondisi || '-'}
                            </span>
                          </td> */}
                          <td style={{ padding: '16px', color: '#333333', fontSize: '14px' }}>{d.lokasi?.nama_ruang || ''} - {d.lokasi?.keterangan || ''}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              background: d.status === 'TERSEDIA' ? '#D1FAE5' : '#FEE2E2',
                              color: d.status === 'TERSEDIA' ? '#065F46' : '#991B1B',
                              fontSize: '12px',
                              fontWeight: 500
                            }}>
                              {d.status || '-'}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button
                                onClick={() => handleView(d)}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#1E1E1E' }}
                                title="View"
                              >
                                <iconify-icon icon="lsicon:view-outline" width="18" height="18"></iconify-icon>
                              </button>
                              <button
                                onClick={() => handleEdit(d.id, 'detail')}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#1E1E1E' }}
                                title="Edit"
                              >
                                <iconify-icon icon="material-symbols:edit-outline-rounded" width="18" height="18"></iconify-icon>
                              </button>
                              <button
                                onClick={() => handleDelete(d.id, 'detail')}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#E37158' }}
                                title="Delete"
                              >
                                <iconify-icon icon="fluent:delete-12-regular" width="18" height="18"></iconify-icon>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  })}
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
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
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
                </select>
                <span style={{ color: '#666666', fontSize: '14px' }}>
                  Results: {totalItems > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, totalItems)} of {totalItems}
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
          </div>
        ) : (
          /* Empty State */
          <div style={{
            background: '#FFFFFF',
            borderRadius: '0 0 12px 12px',
            padding: '80px 32px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px'
          }}>
            {/* Box Icon */}
            <div style={{
              marginBottom: '24px',
              color: '#6D7D90'
            }}>
              <iconify-icon
                icon="mingcute:empty-box-line"
                height="80"
              />
            </div>

            {/* Main Text */}
            <h2 style={{
              color: '#333333',
              fontSize: '24px',
              fontWeight: 700,
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              Tidak ada hasil
            </h2>

            {/* Sub Text */}
            <p style={{
              color: '#666666',
              fontSize: '16px',
              fontWeight: 400,
              textAlign: 'center'
            }}>
              Tambahkan produk dan barang
            </p>
          </div>
        )}
      </div>
      {viewModalOpen && selectedDetail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }} onClick={() => setViewModalOpen(false)}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            width: '700px',
            maxWidth: '90%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1E1E1E' }}>Detail Produk</h2>
                <p style={{ margin: 0, fontSize: '14px', color: '#666666' }}>{selectedDetail.produk.nama}</p>
              </div>
              <button onClick={() => setViewModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <iconify-icon icon="basil:cross-solid" width="24" height="24" style={{ color: '#666666' }}></iconify-icon>
              </button>
            </div>

            {/* Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Left: QR Code */}
              <div style={{
                background: '#F9FAFB',
                padding: '16px',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed #E0E0E0'
              }}>
                {selectedDetail.kode_scan ? (
                  <>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                      <QRCode
                        value={selectedDetail.kode_scan}
                        size={120}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                      />
                    </div>
                    <p style={{ marginTop: '12px', fontSize: '12px', fontWeight: 500, color: '#333' }}>{selectedDetail.kode_scan}</p>
                  </>
                ) : (
                  <>
                    <div style={{ background: 'white', padding: '14px', borderRadius: '12px', boxShadow: 'none', border: '2px dashed #e0e0e0' }}>
                      <QRCode
                        value="PLACEHOLDER-QR-CODE"
                        size={120}
                        fgColor="#e0e0e0"
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                      />
                    </div>
                    <div style={{ width: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', marginTop: '12px', fontSize: '12px' }}>No QR</div>
                  </>
                )}
              </div>

              {/* Right: Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Kode Seri</label>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>{selectedDetail.kode_seri || '-'}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Kondisi</label>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>{selectedDetail.kondisi}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Lokasi</label>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
                    {selectedDetail.lokasi.nama_ruang}
                    <br />
                    <span style={{ fontSize: '12px', color: '#666' }}>{selectedDetail.lokasi.keterangan}</span>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Status</label>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: selectedDetail.status === 'TERSEDIA' ? '#D1FAE5' : '#FEE2E2',
                    color: selectedDetail.status === 'TERSEDIA' ? '#065F46' : '#991B1B',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    {selectedDetail.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
