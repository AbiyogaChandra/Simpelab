'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import moment from 'moment';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProduk: 0,
    totalAsset: 0,
    totalHabisPakai: 0,
    totalStok: 0
  });
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Products
        const prodRes = await fetch('/api/produk');
        const products = await prodRes.json();

        // Calculate Stats
        const totalProduk = products.length;
        const totalAsset = products.filter((p: any) => p.kategori === 'ASET').length;
        const totalHabisPakai = products.filter((p: any) => p.kategori === 'HP').length;
        
        // Calculate Stock: Sum of kuantitas for HP, + 1 for each Asset (assuming each asset entry is a unit, OR use kuantitas if assets have it)
        // Based on schema, Asset also has kuantitas.
        const totalStok = products.reduce((sum: number, p: any) => sum + (p.kuantitas || 0), 0);

        setStats({
          totalProduk,
          totalAsset,
          totalHabisPakai,
          totalStok
        });

        // Recent Products (Last 5)
        const sortedProducts = [...products].sort((a: any, b: any) => b.id - a.id).slice(0, 5);
        setRecentProducts(sortedProducts);

        // Fetch Activities (Pengajuan)
        const actRes = await fetch('/api/pengajuan');
        const activities = await actRes.json();
        
        setRecentActivities(activities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F5' }}>
        <Sidebar />
        <div style={{ marginLeft: '280px', padding: '32px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
              {stats.totalProduk}
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
                <rect x="8" y="8" width="32" height="32" rx="4" stroke="white" strokeWidth="2" />
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
              {stats.totalAsset}
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
                <circle cx="24" cy="24" r="8" stroke="white" strokeWidth="2" />
                <path d="M24 8V16M24 32V40M8 24H16M32 24H40" stroke="white" strokeWidth="2" strokeLinecap="round" />
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
              {stats.totalHabisPakai}
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
                <path d="M16 20L24 12L32 20M16 28L24 36L32 28" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
              {stats.totalStok}
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
                <rect x="12" y="12" width="12" height="12" rx="2" stroke="#333333" strokeWidth="2" />
                <rect x="24" y="24" width="12" height="12" rx="2" stroke="#333333" strokeWidth="2" />
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
              flexDirection: 'column',
              gap: '16px'
            }}>
              {recentProducts.length === 0 ? (
                <p style={{ color: '#999' }}>Belum ada produk.</p>
              ) : (
                recentProducts.map((product) => (
                  <div key={product.id} style={{
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
                        <rect x="4" y="4" width="16" height="16" rx="2" stroke="#666666" strokeWidth="1.5" />
                        <path d="M8 8H16M8 12H16M8 16H12" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: '#333333',
                        fontSize: '16px',
                        fontWeight: 700,
                        marginBottom: '4px'
                      }}>
                        {product.nama}
                      </div>
                      <div style={{
                        color: '#666666',
                        fontSize: '14px',
                        fontWeight: 400
                      }}>
                        {product.kode}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        color: '#333333',
                        fontSize: '16px',
                        fontWeight: 700,
                        marginBottom: '4px'
                      }}>
                        {product.kategori === 'ASET' ? 'Aset' : product.kategori === 'HP' ? 'Habis Pakai' : product.kategori}
                      </div>
                      <div style={{
                        color: '#666666',
                        fontSize: '14px',
                        fontWeight: 400
                      }}>
                        Stok : {product.kuantitas}
                      </div>
                    </div>
                  </div>
                ))
              )}
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
              {recentActivities.length === 0 ? (
                <p style={{ color: '#999' }}>Belum ada aktivitas.</p>
              ) : (
                recentActivities.map((activity, index) => (
                  <div key={activity.id} style={{
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
                        Peminjaman: {activity.peminjam?.nama} - {activity.kode_resi}
                      </div>
                      <div style={{
                        color: '#666666',
                        fontSize: '14px',
                        fontWeight: 400
                      }}>
                        {moment(activity.tanggal_pinjam).format('DD MMM YYYY, HH:mm')} | {activity.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
