'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function DataInventarisPage() {
  const [kategori, setKategori] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('produk');
  const [inventoryData, setInventoryData] = useState<any[]>([]); // Default empty, akan diisi setelah fetch

  // TODO: Fetch data dari API
  // useEffect(() => {
  //   fetchInventoryData().then(data => setInventoryData(data));
  // }, []);

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
        {/* Page Header */}
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
            {/* Produk Tab - Active */}
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

            {/* Barang Tab */}
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
              Barang
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
                  <option value="asset">Asset</option>
                  <option value="habis-pakai">Habis Pakai</option>
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
                  placeholder="Cari nama, kode, atau merk..."
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
        {inventoryData.length > 0 ? (
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
                    background: '#F9F9F9',
                    borderBottom: '1px solid #E0E0E0'
                  }}>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      color: '#333333',
                      fontSize: '14px',
                      fontWeight: 600
                    }}>No</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      color: '#333333',
                      fontSize: '14px',
                      fontWeight: 600
                    }}>Kategori</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      color: '#333333',
                      fontSize: '14px',
                      fontWeight: 600
                    }}>Nama Barang</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      color: '#333333',
                      fontSize: '14px',
                      fontWeight: 600
                    }}>Kode Produk</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      color: '#333333',
                      fontSize: '14px',
                      fontWeight: 600
                    }}>Merk</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      color: '#333333',
                      fontSize: '14px',
                      fontWeight: 600
                    }}>Tipe/Model</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      color: '#333333',
                      fontSize: '14px',
                      fontWeight: 600
                    }}>Stok</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      color: '#333333',
                      fontSize: '14px',
                      fontWeight: 600
                    }}>Jumlah Barang</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      color: '#333333',
                      fontSize: '14px',
                      fontWeight: 600
                    }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.map((item) => (
                    <tr key={item.no} style={{
                      borderBottom: '1px solid #F0F0F0'
                    }}>
                      <td style={{
                        padding: '16px',
                        color: '#333333',
                        fontSize: '14px'
                      }}>{item.no}</td>
                      <td style={{
                        padding: '16px'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          background: '#F5F5F5',
                          color: '#333333',
                          fontSize: '12px',
                          fontWeight: 500
                        }}>
                          {item.kategori}
                        </span>
                      </td>
                      <td style={{
                        padding: '16px',
                        color: '#333333',
                        fontSize: '14px'
                      }}>{item.namaBarang}</td>
                      <td style={{
                        padding: '16px',
                        color: '#333333',
                        fontSize: '14px'
                      }}>{item.kodeProduk}</td>
                      <td style={{
                        padding: '16px',
                        color: '#333333',
                        fontSize: '14px'
                      }}>{item.merk}</td>
                      <td style={{
                        padding: '16px',
                        color: '#333333',
                        fontSize: '14px'
                      }}>{item.tipeModel}</td>
                      <td style={{
                        padding: '16px'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          background: '#D1FAE5',
                          color: '#065F46',
                          fontSize: '12px',
                          fontWeight: 500
                        }}>
                          {item.stok}
                        </span>
                      </td>
                      <td style={{
                        padding: '16px'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          background: '#FED7AA',
                          color: '#92400E',
                          fontSize: '12px',
                          fontWeight: 500
                        }}>
                          {item.jumlahBarang} Items
                        </span>
                      </td>
                      <td style={{
                        padding: '16px'
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center'
                        }}>
                          <button style={{
                            padding: '6px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8 3C4.66667 3 2 5.66667 2 9C2 12.3333 4.66667 15 8 15C11.3333 15 14 12.3333 14 9C14 5.66667 11.3333 3 8 3Z" stroke="#666666" strokeWidth="1.5" />
                              <circle cx="8" cy="9" r="2" stroke="#666666" strokeWidth="1.5" />
                            </svg>
                          </button>
                          <button style={{
                            padding: '6px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11.3333 2.00004C11.5084 1.82493 11.7163 1.68605 11.9451 1.59128C12.1739 1.49651 12.4187 1.44775 12.6667 1.44775C12.9146 1.44775 13.1594 1.49651 13.3882 1.59128C13.617 1.68605 13.8249 1.82493 14 2.00004C14.1751 2.17515 14.314 2.38305 14.4088 2.61185C14.5035 2.84065 14.5523 3.08547 14.5523 3.33337C14.5523 3.58128 14.5035 3.8261 14.4088 4.0549C14.314 4.2837 14.1751 4.4916 14 4.66671L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00004Z" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button style={{
                            padding: '6px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M2 4H14M6 4V2C6 1.44772 6.44772 1 7 1H9C9.55228 1 10 1.44772 10 2V4M13 4V14C13 14.5523 12.5523 15 12 15H4C3.44772 15 3 14.5523 3 14V4H13Z" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{
                  color: '#666666',
                  fontSize: '14px'
                }}>Show</span>
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
                <span style={{
                  color: '#666666',
                  fontSize: '14px'
                }}>Results: 1-{inventoryData.length} of {inventoryData.length}</span>
              </div>
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
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
            <div style={{
              marginBottom: '24px',
              opacity: 0.5
            }}>
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
