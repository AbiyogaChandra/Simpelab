'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LogPerubahanPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  // Sample data - nanti akan di-fetch dari API
  const activityLogs = [
    {
      id: 1,
      tags: ['Pengembalian', 'Barang'],
      message: 'Barang dikembalikan : Adinda F - XII RPL B - 246151837063 / Flashdisk',
      timestamp: '21-01-2026, 21:14:08',
      user: 'Admin'
    },
    {
      id: 2,
      tags: ['Edit', 'Produk'],
      message: 'Produk diperbarui : Tissue',
      timestamp: '21-01-2026, 20:14:08',
      user: 'Admin'
    },
    {
      id: 3,
      tags: ['Disetujui', 'Barang'],
      message: 'Peminjaman disetujui : Adinda F - XII RPL B - 246151837063 / Flashdisk',
      timestamp: '21-01-2026, 16:14:08',
      user: 'Admin'
    },
    {
      id: 4,
      tags: ['Tambah', 'Barang'],
      message: 'Unit baru: Tissue - SN: 002',
      timestamp: '21-01-2026, 14:14:08',
      user: 'Admin'
    }
  ];

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Pengembalian':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'Edit':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'Disetujui':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'Tambah':
        return { bg: '#FED7AA', text: '#92400E' };
      case 'Barang':
        return { bg: '#E0E7FF', text: '#3730A3' };
      case 'Produk':
        return { bg: '#FCE7F3', text: '#9F1239' };
      default:
        return { bg: '#F5F5F5', text: '#333333' };
    }
  };

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
          {/* Dashboard */}
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 10L10 2.5L17.5 10M10 17.5V2.5" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{
                color: '#666666',
                fontSize: '16px',
                fontWeight: 400
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

          {/* Aktifitas - Active */}
          <Link href="/log-perubahan" style={{ textDecoration: 'none' }}>
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
                <circle cx="10" cy="10" r="8" stroke="#333333" strokeWidth="1.5"/>
                <path d="M10 6V10L13 13" stroke="#333333" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{
                color: '#333333',
                fontSize: '16px',
                fontWeight: 500
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
        {/* Page Header */}
        <h1 style={{
          color: '#333333',
          fontSize: '32px',
          fontWeight: 700,
          marginBottom: '8px'
        }}>
          Log Perubahan
        </h1>
        <p style={{
          color: '#666666',
          fontSize: '16px',
          fontWeight: 400,
          marginBottom: '24px'
        }}>
          Riwayat semua perubahan data inventaris
        </p>

        {/* Search and Filter Bar */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '16px 24px',
          marginBottom: '24px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          gap: '16px',
          alignItems: 'center'
        }}>
          {/* Filter Button */}
          <div style={{
            position: 'relative'
          }}>
            <button
              onClick={() => setFilter(filter ? '' : 'all')}
              style={{
                padding: '12px 20px',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                background: '#FFFFFF',
                color: '#333333',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'inherit'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4H14M4 8H12M6 12H10" stroke="#666666" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Filter
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Search Input */}
          <div style={{
            flex: 1,
            position: 'relative'
          }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari aktivitas..."
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
                <circle cx="7" cy="7" r="5" stroke="#666666" strokeWidth="1.5"/>
                <path d="M11 11L14 14" stroke="#666666" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Activity Log Cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {activityLogs.map((log) => (
            <div
              key={log.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '20px 24px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Tags */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '12px',
                flexWrap: 'wrap'
              }}>
                {log.tags.map((tag, index) => {
                  const colors = getTagColor(tag);
                  return (
                    <span
                      key={index}
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        background: colors.bg,
                        color: colors.text,
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>

              {/* Message */}
              <p style={{
                color: '#333333',
                fontSize: '16px',
                fontWeight: 400,
                marginBottom: '8px',
                lineHeight: '1.5'
              }}>
                {log.message}
              </p>

              {/* Timestamp and User */}
              <p style={{
                color: '#666666',
                fontSize: '14px',
                fontWeight: 400
              }}>
                {log.timestamp} | oleh {log.user}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
