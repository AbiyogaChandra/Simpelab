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

        // Recent Products (Last 3)
        const sortedProducts = [...products].sort((a: any, b: any) => b.id - a.id).slice(0, 5);
        setRecentProducts(sortedProducts);

        // Fetch Activities (Aktivitas)
        const actRes = await fetch('/api/aktivitas');
        const activitiesData = await actRes.json();

        // Handle both array (legacy) and object with data property (new)
        const activitiesList = Array.isArray(activitiesData) ? activitiesData : (activitiesData.data || []);

        // Limit to 3 recent activities
        setRecentActivities(activitiesList.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handleSync = () => fetchData();
    window.addEventListener('syncData', handleSync);
    return () => window.removeEventListener('syncData', handleSync);
  }, []);

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
    <div className="page-wrapper">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Page Title */}
        <h1 className="page-title">
          Dashboard
        </h1>
        <p className="page-subtitle">
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
              Aset & habis pakai
            </div>
            <div style={{
              color: '#FFFFFF',
              position: 'absolute',
              top: '16px',
              right: '16px',
              padding: '12px',
              backgroundColor: '#437090',
              borderRadius: '8px'
            }}>
              <iconify-icon
                icon="gridicons:product"
                height="24"
              />
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
              Total Aset
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
              color: '#FFFFFF',
              position: 'absolute',
              top: '16px',
              right: '16px',
              padding: '12px',
              backgroundColor: '#D363A1',
              borderRadius: '8px'
            }}>
              <iconify-icon
                icon="carbon:asset"
                height="24"
              />
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
              color: '#000000',
              position: 'absolute',
              top: '16px',
              right: '16px',
              padding: '12px',
              backgroundColor: '#F3F3F3',
              borderRadius: '8px'
            }}>
              <iconify-icon
                icon="fa7-solid:cart-arrow-down"
                height="24"
              />
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
              color: '#000000',
              position: 'absolute',
              top: '16px',
              right: '16px',
              padding: '12px',
              backgroundColor: '#F3F3F3',
              borderRadius: '8px'
            }}>
              <iconify-icon
                icon="mingcute:stock-line"
                height="24"
              />
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
            <h2 className="section-title">
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
                    gap: '10px',
                    padding: '16px',
                    background: '#F0F7FC',
                    borderRadius: '12px'
                  }}>
                    <div style={{
                      color: '#ffffff',
                      width: '45px',
                      height: '45px',
                      padding: '12px',
                      backgroundColor: '#A7CEEB',
                      borderRadius: '8px'
                    }}>
                      <iconify-icon
                        icon="gridicons:product"
                        height="20"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: '#588FB7',
                        fontSize: '16px',
                        fontWeight: 700,
                        marginBottom: '4px'
                      }}>
                        {product.nama}
                      </div>
                      <div style={{
                        color: '#C0C0B3',
                        fontSize: '14px',
                        fontWeight: 400
                      }}>
                        {product.kode}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'right',
                      gap: '4px'
                    }}>
                      <div style={{
                        color: '#2C364B',
                        backgroundColor: '#FEFEFE',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 400,
                        padding: '2px 8px'
                      }}>
                        {product.kategori === 'ASET' ? 'Aset' : product.kategori === 'HP' ? 'Habis Pakai' : product.kategori}
                      </div>
                      <div style={{
                        color: '#647589',
                        fontSize: '14px',
                        fontWeight: 400,
                        textAlign: 'right'
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
            <h2 className="section-title">
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
                recentActivities.map((activity: any) => ( // Typings could be improved
                  <div key={activity.id} style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '16px',
                  }}>
                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      {activity.tags && activity.tags.map((tag: string, idx: number) => {
                        const colors = getTagColor(tag);
                        return (
                          <span key={idx} style={{
                            fontSize: '12px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: colors.bg,
                            color: colors.text,
                            fontWeight: 500
                          }}>
                            {tag}
                          </span>
                        );
                      })}
                    </div>

                    <div style={{
                      color: '#333333',
                      fontSize: '16px',
                      fontWeight: 500,
                      marginBottom: '4px'
                    }}>
                      {activity.message}
                    </div>
                    <div style={{
                      color: '#666666',
                      fontSize: '14px',
                      fontWeight: 400
                    }}>
                      {activity.timestamp} | oleh {activity.user}
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
