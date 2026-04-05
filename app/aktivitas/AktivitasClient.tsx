'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function AktivitasPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const LIMIT = 5;

  const actionTags = ['Buat', 'Ubah', 'Hapus'];
  const targetTags = ['Produk', 'Detail Produk', 'Peminjaman', 'Lokasi'];

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams();
        if (filter && filter !== 'Semua') query.append('tag', filter);
        if (search) query.append('search', search);
        if (startDate) query.append('startDate', startDate);
        if (endDate) query.append('endDate', endDate);
        query.append('page', page.toString());
        query.append('limit', LIMIT.toString());

        const res = await fetch(`/api/aktivitas?${query.toString()}`);
        if (res.ok) {
          const result = await res.json();
          // Provide backward compatibility if API returns array directly (during migration/caching)
          if (Array.isArray(result)) {
            setActivityLogs(result);
            setTotalPages(1);
          } else {
            setActivityLogs(result.data);
            setTotalPages(result.pagination.totalPages);
          }
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
  }, [filter, search, page, startDate, endDate]);

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
              <iconify-icon icon="mi:filter" style={{ color: filter ? '#3730A3' : "#666666", fontSize: '16px' }}></iconify-icon>
              {filter || 'Filter'}
              <iconify-icon icon="mdi:chevron-down" style={{ color: filter ? '#3730A3' : "#666666", fontSize: '16px' }}></iconify-icon>
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
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center'
            }}>
              <iconify-icon icon="iconamoon:search" style={{ color: '#666666' }} width="16" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#666666' }}>Mulai dari</span>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: startDate ? '#000000' : '#999999',
                  background: '#FFFFFF',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#666666' }}>Sampai dengan</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: endDate ? '#000000' : '#999999',
                  background: '#FFFFFF',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>
        </div>

        {/* Activity Logs Feed */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666666', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <iconify-icon icon="line-md:loading-twotone-loop" style={{ fontSize: '24px', color: '#2F516A' }}></iconify-icon>
              Memuat aktivitas...
            </div>
          ) : activityLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666666' }}>
              Tidak ada aktivitas ditemukan
            </div>
          ) : (
            activityLogs.slice(0, 5).map((log: any) => (
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

        {/* Pagination Controls */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid #E0E0E0',
              background: page === 1 ? '#F5F5F5' : '#FFFFFF',
              color: page === 1 ? '#999999' : '#2F516A',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            <iconify-icon icon="mdi:chevron-left" height="24" />
          </button>
          <span style={{ fontSize: '14px', color: '#666666' }}>
            Halaman {page} dari {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid #E0E0E0',
              background: (page === totalPages || totalPages === 0) ? '#F5F5F5' : '#FFFFFF',
              color: (page === totalPages || totalPages === 0) ? '#999999' : '#2F516A',
              cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
            }}
          >
            <iconify-icon icon="mdi:chevron-right" height="24" />
          </button>
        </div>
      </div>
    </div>
  );
}
