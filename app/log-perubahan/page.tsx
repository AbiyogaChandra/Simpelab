'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

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
                <path d="M2 4H14M4 8H12M6 12H10" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Filter
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
