'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

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
  const [kategori, setKategori] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'produk' | 'barang'>('produk');
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{
              color: '#333333',
              fontSize: '32px',
              fontWeight: 700,
              marginBottom: '8px',
              margin: 0
            }}>
              Data Inventaris
            </h1>
            <p style={{
              color: '#666666',
              fontSize: '16px',
              fontWeight: 400,
              margin: 0
            }}>
              Kelola dan lihat semua data inventaris
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link
              href="/create-produk"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#2F516A',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                fontFamily: 'inherit',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <span>+</span>
              Create Produk
            </Link>
            <Link
              href="/create-barang"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#2F516A',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                fontFamily: 'inherit',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <span>+</span>
              Create Detail Produk
            </Link>
          </div>
        </div>

        {/* Tabs and Filter Bar */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '16px 24px',
          marginBottom: '24px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '2px solid #F5F5F5'
          }}>
            {/* Produk Tab */}
            <button
              onClick={() => setActiveTab('produk')}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 'produk' ? '2px solid #2F516A' : '2px solid transparent',
                color: activeTab === 'produk' ? '#2F516A' : '#666666',
                fontSize: '16px',
                fontWeight: activeTab === 'produk' ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'inherit',
                marginBottom: '-2px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="12" height="12" rx="2" stroke={activeTab === 'produk' ? '#2F516A' : '#666666'} strokeWidth="1.5" />
                <path d="M8 8H12M8 12H12" stroke={activeTab === 'produk' ? '#2F516A' : '#666666'} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Produk
            </button>

            {/* Detail Produk Tab */}
            <button
              onClick={() => setActiveTab('barang')}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 'barang' ? '2px solid #2F516A' : '2px solid transparent',
                color: activeTab === 'barang' ? '#2F516A' : '#666666',
                fontSize: '16px',
                fontWeight: activeTab === 'barang' ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'inherit',
                marginBottom: '-2px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6L10 2L16 6M4 6V16C4 16.5523 4.44772 17 5 17H15C15.5523 17 16 16.5523 16 16V6M4 6L10 10L16 6" stroke={activeTab === 'barang' ? '#2F516A' : '#666666'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 10V18" stroke={activeTab === 'barang' ? '#2F516A' : '#666666'} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Detail Produk
            </button>
          </div>

          {/* Filter Bar */}
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-end'
          }}>
            {/* Kategori Dropdown */}
            <div style={{
              position: 'relative',
              minWidth: '200px'
            }}>
              <label style={{
                display: 'block',
                color: '#333333',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px'
              }}>
                Kategori
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingLeft: '40px',
                    paddingRight: '40px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: kategori ? '#000000' : '#999999',
                    background: '#FFFFFF',
                    appearance: 'none',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="">Semua Kategori</option>
                  <option value="aset">Aset</option>
                  <option value="hp">Habis Pakai</option>
                </select>
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="4" cy="4" r="1.5" fill="#666666" />
                    <circle cx="8" cy="4" r="1.5" fill="#666666" />
                    <circle cx="12" cy="4" r="1.5" fill="#666666" />
                  </svg>
                </div>
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div style={{
              flex: 1,
              position: 'relative'
            }}>
              <label style={{
                display: 'block',
                color: '#333333',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px'
              }}>
                Cari
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={activeTab === 'produk' ? "Cari nama, kode, atau merk..." : "Cari nama barang atau kode seri..."}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingLeft: '40px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: search ? '#000000' : '#999999',
                    background: '#FFFFFF',
                    fontFamily: 'inherit'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7" cy="7" r="5" stroke="#666666" strokeWidth="1.5" />
                    <path d="M11 11L14 14" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conditional Rendering: Table or Empty State */}
        {loading ? (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
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
            borderRadius: '12px',
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
                  {filteredData.map((item, index) => {
                    // Render for Produk
                    if (activeTab === 'produk') {
                      const p = item as Produk;
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                          <td style={{ padding: '16px', color: '#333333', fontSize: '14px' }}>{index + 1}</td>
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
                              {p.kuantitas}
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
                              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} title="View">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M8 3C4.66667 3 2 5.66667 2 9C2 12.3333 4.66667 15 8 15C11.3333 15 14 12.3333 14 9C14 5.66667 11.3333 3 8 3Z" stroke="#666666" strokeWidth="1.5" />
                                  <circle cx="8" cy="9" r="2" stroke="#666666" strokeWidth="1.5" />
                                </svg>
                              </button>
                              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} title="Edit">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M11.333 2A1.886 1.886 0 0 1 14 4.667L5 13.667l-3 1 1-3L11.333 2z" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} title="Delete">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2 4h12M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1m2 0v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4h10zM6 7v4M10 7v4" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
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
                          <td style={{ padding: '16px', color: '#333333', fontSize: '14px' }}>{index + 1}</td>
                          <td style={{ padding: '16px', color: '#333333', fontSize: '14px' }}>{(d.produk?.kategori === 'ASET' ? 'Aset' : d.produk?.kategori === 'HP' ? 'Habis Pakai' : d.produk?.kategori) || '-'}</td>
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
                              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M8 3C4.66667 3 2 5.66667 2 9C2 12.3333 4.66667 15 8 15C11.3333 15 14 12.3333 14 9C14 5.66667 11.3333 3 8 3Z" stroke="#666666" strokeWidth="1.5" />
                                  <circle cx="8" cy="9" r="2" stroke="#666666" strokeWidth="1.5" />
                                </svg>
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
                <span style={{ color: '#666666', fontSize: '14px' }}>Show</span>
                <select style={{
                  padding: '6px 12px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
                <span style={{ color: '#666666', fontSize: '14px' }}>Results: 1-{filteredData.length} of {filteredData.length}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button style={{
                  padding: '8px 16px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '6px',
                  background: '#FFFFFF',
                  color: '#666666',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}>
                  &lt; Previous
                </button>
                <button style={{
                  padding: '8px 16px',
                  border: '1px solid #2F516A',
                  borderRadius: '6px',
                  background: '#2F516A',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}>
                  1
                </button>
                <button style={{
                  padding: '8px 16px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '6px',
                  background: '#FFFFFF',
                  color: '#666666',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}>
                  Next &gt;
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '80px 32px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px'
          }}>
            {/* Box Icon */}
            <div style={{ marginBottom: '24px', opacity: 0.5 }}>
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 30L60 10L100 30M20 30V90C20 92.2091 21.7909 94 24 94H96C98.2091 94 100 92.2091 100 90V30M20 30L60 50L100 30" stroke="#666666" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M60 50V94" stroke="#666666" strokeWidth="3" strokeLinecap="round" />
              </svg>
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
    </div>
  );
}
