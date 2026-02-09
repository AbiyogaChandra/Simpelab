'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function AktivitasPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const actionTags = ['Buat', 'Ubah', 'Hapus'];
  const targetTags = ['Produk', 'Detail Produk', 'Peminjaman', 'Lokasi'];

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams();
        if (filter && filter !== 'Semua') query.append('tag', filter);
        if (search) query.append('search', search);

        const res = await fetch(`/api/aktivitas?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setActivityLogs(data);
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchActivities();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [filter, search]);

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Buat':
      case 'Tambah': // Backward compatibility
        return { bg: '#D1FAE5', text: '#065F46' }; // Green
      case 'Ubah':
      case 'Edit': // Backward compatibility
        return { bg: '#DBEAFE', text: '#1E40AF' }; // Blue
      case 'Hapus':
        return { bg: '#FEE2E2', text: '#991B1B' }; // Red
      case 'Disetujui':
      case 'Pengembalian':
        return { bg: '#D1FAE5', text: '#065F46' }; // Green

      case 'Produk':
      case 'Detail Produk':
      case 'Barang': // Backward compatibility
        return { bg: '#FCE7F3', text: '#9F1239' }; // Pink
      case 'Peminjaman':
        return { bg: '#E0E7FF', text: '#3730A3' }; // Indigo
      case 'Lokasi':
        return { bg: '#FEF3C7', text: '#92400E' }; // Amber

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
          Aktivitas
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
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{
                padding: '12px 20px',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                background: filter ? '#E0E7FF' : '#FFFFFF',
                color: filter ? '#3730A3' : '#333333',
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
                <path d="M2 4H14M4 8H12M6 12H10" stroke={filter ? '#3730A3' : "#666666"} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {filter || 'Filter'}
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke={filter ? '#3730A3' : "#666666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Filter Dropdown */}
            {showFilterDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '8px',
                background: '#FFFFFF',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                padding: '8px',
                zIndex: 10,
                minWidth: '200px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <button
                  onClick={() => { setFilter(''); setShowFilterDropdown(false); }}
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: !filter ? '#F3F4F6' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#333333'
                  }}
                >
                  Semua
                </button>
                <div style={{ margin: '4px 0', borderTop: '1px solid #E5E7EB' }}></div>
                <div style={{ fontSize: '12px', color: '#9CA3AF', padding: '4px 12px' }}>Aksi</div>
                {actionTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => { setFilter(tag); setShowFilterDropdown(false); }}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: filter === tag ? '#F3F4F6' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#333333'
                    }}
                  >
                    {tag}
                  </button>
                ))}
                <div style={{ margin: '4px 0', borderTop: '1px solid #E5E7EB' }}></div>
                <div style={{ fontSize: '12px', color: '#9CA3AF', padding: '4px 12px' }}>Target</div>
                {targetTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => { setFilter(tag); setShowFilterDropdown(false); }}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: filter === tag ? '#F3F4F6' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#333333'
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
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
                <circle cx="7" cy="7" r="5" stroke="#666666" strokeWidth="1.5" />
                <path d="M11 11L14 14" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" />
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
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666666' }}>
              Memuat aktivitas...
            </div>
          ) : activityLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666666' }}>
              Tidak ada aktivitas ditemukan
            </div>
          ) : (
            activityLogs.map((log: any) => (
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
                  {log.tags.map((tag: string, index: number) => {
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
            )))}
        </div>
      </div>
    </div>
  );
}
