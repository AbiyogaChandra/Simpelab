'use client';

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F5',
      fontFamily: 'Outfit, sans-serif'
    }}>
      {/* Left Sidebar */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '280px',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        boxShadow: '2px 0 4px rgba(0, 0, 0, 0.05)',
        zIndex: 1000,
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #E5E5E5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="Simpelab Logo" style={{ width: '32px', height: '32px' }} />
            <span style={{
              color: '#333333',
              fontSize: '20px',
              fontWeight: 700
            }}>
              Simpelab
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div style={{
          flex: 1,
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {/* Dashboard - Active */}
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#F5F5F5',
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 10L10 2.5L17.5 10M10 17.5V2.5" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{
                color: '#333333',
                fontSize: '16px',
                fontWeight: 500
              }}>
                Dashboard
              </span>
            </div>
          </Link>

          {/* Create Produk */}
          <Link href="/create-produk" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="12" height="12" rx="2" stroke="#666666" strokeWidth="1.5"/>
                <path d="M8 8H12M8 12H12" stroke="#666666" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{
                color: '#666666',
                fontSize: '16px',
                fontWeight: 400
              }}>
                Create Produk
              </span>
            </div>
          </Link>

          {/* Create Barang */}
          <Link href="/create-barang" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6L10 2L16 6M4 6V16C4 16.5523 4.44772 17 5 17H15C15.5523 17 16 16.5523 16 16V6M4 6L10 10L16 6" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 10V18" stroke="#666666" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{
                color: '#666666',
                fontSize: '16px',
                fontWeight: 400
              }}>
                Create Barang
              </span>
            </div>
          </Link>

          {/* Data Inventaris */}
          <Link href="/data-inventaris" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="5" r="3" stroke="#666666" strokeWidth="1.5"/>
                <circle cx="5" cy="12" r="2" stroke="#666666" strokeWidth="1.5"/>
                <circle cx="15" cy="12" r="2" stroke="#666666" strokeWidth="1.5"/>
                <path d="M10 8V15M5 14L10 15L15 14" stroke="#666666" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{
                color: '#666666',
                fontSize: '16px',
                fontWeight: 400
              }}>
                Data Inventaris
              </span>
            </div>
          </Link>

          {/* Peminjaman */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V4C16 2.89543 15.1046 2 14 2Z" stroke="#666666" strokeWidth="1.5"/>
                <path d="M6 6H14M6 10H14M6 14H10" stroke="#666666" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{
                color: '#666666',
                fontSize: '16px',
                fontWeight: 400
              }}>
                Peminjaman
              </span>
            </div>
          </Link>

          {/* Aktifitas */}
          <Link href="/log-perubahan" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="8" stroke="#666666" strokeWidth="1.5"/>
                <path d="M10 6V10L13 13" stroke="#666666" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{
                color: '#666666',
                fontSize: '16px',
                fontWeight: 400
              }}>
                Aktifitas
              </span>
            </div>
          </Link>
        </div>

        {/* Footer Menu */}
        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid #E5E5E5',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {/* Pengaturan */}
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12C11.1046 12 12 11.1046 12 10C12 8.89543 11.1046 8 10 8C8.89543 8 8 8.89543 8 10C8 11.1046 8.89543 12 10 12Z" stroke="#666666" strokeWidth="1.5"/>
              <path d="M15.6569 8.34315L14.2426 6.92893C14.0479 6.73418 13.7315 6.73418 13.5368 6.92893L12.8284 7.63736C12.4379 8.02788 11.8047 8.02788 11.4142 7.63736L10.7071 6.9303C10.5123 6.73554 10.1959 6.73554 10.0012 6.9303L8.58697 8.34451C8.39221 8.53927 8.39221 8.85565 8.58697 9.05041L9.2954 9.75884C9.68592 10.1494 9.68592 10.7825 9.2954 11.173L8.58834 11.8801C8.39358 12.0749 8.39358 12.3913 8.58834 12.586L10.0026 14.0003C10.1973 14.195 10.5137 14.195 10.7085 14.0003L11.4155 13.2932C11.8061 12.9027 12.4392 12.9027 12.8297 13.2932L13.5382 14.0017C13.7329 14.1964 14.0493 14.1964 14.2441 14.0017L15.6583 12.5875C15.853 12.3927 15.853 12.0763 15.6583 11.8816L14.9508 11.1741C14.5603 10.7836 14.5603 10.1504 14.9508 9.75992L15.6579 9.05286C15.8526 8.8581 15.8526 8.54172 15.6579 8.34696L15.6569 8.34315Z" stroke="#666666" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{
              color: '#666666',
              fontSize: '16px',
              fontWeight: 400
            }}>
              Pengaturan
            </span>
          </div>

          {/* Keluar */}
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 17H4C3.44772 17 3 16.5523 3 16V4C3 3.44772 3.44772 3 4 3H7M14 14L17 10M17 10L14 6M17 10H7" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{
              color: '#666666',
              fontSize: '16px',
              fontWeight: 400
            }}>
              Keluar
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        marginLeft: '280px',
        padding: '32px',
        minHeight: '100vh'
      }}>
        {/* Page Title */}
        <h1 style={{
          color: '#333333',
          fontSize: '32px',
          fontWeight: 700,
          marginBottom: '8px'
        }}>
          Dashboard
        </h1>
        <p style={{
          color: '#666666',
          fontSize: '16px',
          fontWeight: 400,
          marginBottom: '32px'
        }}>
          Ringkasan data inventaris Lab TKJ
        </p>

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Total Produk Card */}
          <div style={{
            background: '#2F516A',
            borderRadius: '12px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 400,
              marginBottom: '8px'
            }}>
              Total Produk
            </div>
            <div style={{
              color: '#FFFFFF',
              fontSize: '36px',
              fontWeight: 700,
              marginBottom: '4px'
            }}>
              1
            </div>
            <div style={{
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 400,
              opacity: 0.9
            }}>
              Asset & habis pakai
            </div>
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              opacity: 0.3
            }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="8" width="32" height="32" rx="4" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
          </div>

          {/* Total Asset Card */}
          <div style={{
            background: '#AB5082',
            borderRadius: '12px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 400,
              marginBottom: '8px'
            }}>
              Total Asset
            </div>
            <div style={{
              color: '#FFFFFF',
              fontSize: '36px',
              fontWeight: 700,
              marginBottom: '4px'
            }}>
              2
            </div>
            <div style={{
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 400,
              opacity: 0.9
            }}>
              Barang
            </div>
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              opacity: 0.3
            }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="8" stroke="white" strokeWidth="2"/>
                <path d="M24 8V16M24 32V40M8 24H16M32 24H40" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Total Habis Pakai Card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '24px',
            position: 'relative',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              color: '#333333',
              fontSize: '14px',
              fontWeight: 400,
              marginBottom: '8px'
            }}>
              Total Habis Pakai
            </div>
            <div style={{
              color: '#333333',
              fontSize: '36px',
              fontWeight: 700,
              marginBottom: '4px'
            }}>
              0
            </div>
            <div style={{
              color: '#333333',
              fontSize: '14px',
              fontWeight: 400,
              opacity: 0.7
            }}>
              Barang
            </div>
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              opacity: 0.3
            }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 20L24 12L32 20M16 28L24 36L32 28" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Total Stok Card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '24px',
            position: 'relative',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              color: '#333333',
              fontSize: '14px',
              fontWeight: 400,
              marginBottom: '8px'
            }}>
              Total Stok
            </div>
            <div style={{
              color: '#333333',
              fontSize: '36px',
              fontWeight: 700,
              marginBottom: '4px'
            }}>
              2
            </div>
            <div style={{
              color: '#333333',
              fontSize: '14px',
              fontWeight: 400,
              opacity: 0.7
            }}>
              Barang tersedia
            </div>
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              opacity: 0.3
            }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="12" y="12" width="12" height="12" rx="2" stroke="#333333" strokeWidth="2"/>
                <rect x="24" y="24" width="12" height="12" rx="2" stroke="#333333" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px'
        }}>
          {/* Produk Terbaru */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              color: '#333333',
              fontSize: '20px',
              fontWeight: 700,
              marginBottom: '20px'
            }}>
              Produk Terbaru
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              background: '#F9F9F9',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#F5F5F5',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="4" width="16" height="16" rx="2" stroke="#666666" strokeWidth="1.5"/>
                  <path d="M8 8H16M8 12H16M8 16H12" stroke="#666666" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  color: '#333333',
                  fontSize: '16px',
                  fontWeight: 700,
                  marginBottom: '4px'
                }}>
                  Router
                </div>
                <div style={{
                  color: '#666666',
                  fontSize: '14px',
                  fontWeight: 400
                }}>
                  KODEPRODUK111
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  color: '#333333',
                  fontSize: '16px',
                  fontWeight: 700,
                  marginBottom: '4px'
                }}>
                  Asset
                </div>
                <div style={{
                  color: '#666666',
                  fontSize: '14px',
                  fontWeight: 400
                }}>
                  Stok : 2
                </div>
              </div>
            </div>
          </div>

          {/* Aktivitas Terbaru */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              color: '#333333',
              fontSize: '20px',
              fontWeight: 700,
              marginBottom: '20px'
            }}>
              Aktivitas Terbaru
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Activity 1 */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#3B82F6',
                  marginTop: '6px',
                  flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: '#333333',
                    fontSize: '16px',
                    fontWeight: 400,
                    marginBottom: '4px'
                  }}>
                    Barang baru : Router - KODEBARANG111
                  </div>
                  <div style={{
                    color: '#666666',
                    fontSize: '14px',
                    fontWeight: 400
                  }}>
                    23 Jan 2026, 21:27 | Admin
                  </div>
                </div>
              </div>

              {/* Activity 2 */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#3B82F6',
                  marginTop: '6px',
                  flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: '#333333',
                    fontSize: '16px',
                    fontWeight: 400,
                    marginBottom: '4px'
                  }}>
                    Barang baru : Router - KODEBARANG112
                  </div>
                  <div style={{
                    color: '#666666',
                    fontSize: '14px',
                    fontWeight: 400
                  }}>
                    23 Jan 2026, 21:27 | Admin
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
