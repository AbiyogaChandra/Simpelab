'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CreateProdukPage() {
  const [formData, setFormData] = useState({
    kategoriProduk: '',
    namaProduk: '',
    kodeProduk: '',
    merk: '',
    tipeModel: '',
    spesifikasi: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  const handleReset = () => {
    setFormData({
      kategoriProduk: '',
      namaProduk: '',
      kodeProduk: '',
      merk: '',
      tipeModel: '',
      spesifikasi: '',
    });
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

          {/* Create Produk - Active */}
          <Link href="/create-produk" style={{ textDecoration: 'none' }}>
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
                <rect x="4" y="4" width="12" height="12" rx="2" stroke="#333333" strokeWidth="1.5"/>
                <path d="M8 8H12M8 12H12" stroke="#333333" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{
                color: '#333333',
                fontSize: '16px',
                fontWeight: 500
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
        {/* Page Header */}
        <h1 style={{
          color: '#333333',
          fontSize: '32px',
          fontWeight: 700,
          marginBottom: '8px'
        }}>
          Create Produk
        </h1>
        <p style={{
          color: '#666666',
          fontSize: '16px',
          fontWeight: 400,
          marginBottom: '32px'
        }}>
          Tambahkan produk master baru ke inventaris
        </p>

        {/* Form Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Section Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="16" height="16" rx="2" stroke="#333333" strokeWidth="1.5"/>
              <path d="M8 8H16M8 12H16M8 16H12" stroke="#333333" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <h2 style={{
              color: '#333333',
              fontSize: '20px',
              fontWeight: 700
            }}>
              Informasi Produk
            </h2>
          </div>
          <p style={{
            color: '#666666',
            fontSize: '14px',
            fontWeight: 400,
            marginBottom: '24px',
            marginLeft: '36px'
          }}>
            Isi data produk dengan lengkap
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Kategori Produk */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                color: '#333333',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px'
              }}>
                Kategori Produk
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  name="kategoriProduk"
                  value={formData.kategoriProduk}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingRight: '40px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: formData.kategoriProduk ? '#000000' : '#999999',
                    background: '#FFFFFF',
                    appearance: 'none',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="">Opsi</option>
                  <option value="asset">Asset</option>
                  <option value="habis-pakai">Habis Pakai</option>
                </select>
                <div style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Nama Produk and Kode Produk - Two Columns */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginBottom: '24px'
            }}>
              {/* Nama Produk */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}>
                  Nama Produk
                </label>
                <input
                  type="text"
                  name="namaProduk"
                  value={formData.namaProduk}
                  onChange={handleChange}
                  placeholder="Contoh : Flashdisk"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: formData.namaProduk ? '#000000' : '#999999',
                    background: '#FFFFFF',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Kode Produk */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}>
                  Kode Produk
                </label>
                <input
                  type="text"
                  name="kodeProduk"
                  value={formData.kodeProduk}
                  onChange={handleChange}
                  placeholder="Contoh : FLS111"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: formData.kodeProduk ? '#000000' : '#999999',
                    background: '#FFFFFF',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Merk and Tipe/Model - Two Columns */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginBottom: '24px'
            }}>
              {/* Merk */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}>
                  Merk
                </label>
                <input
                  type="text"
                  name="merk"
                  value={formData.merk}
                  onChange={handleChange}
                  placeholder="Contoh : Samsung"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: formData.merk ? '#000000' : '#999999',
                    background: '#FFFFFF',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Tipe/Model */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}>
                  Tipe/Model
                </label>
                <input
                  type="text"
                  name="tipeModel"
                  value={formData.tipeModel}
                  onChange={handleChange}
                  placeholder="Contoh : OTG"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: formData.tipeModel ? '#000000' : '#999999',
                    background: '#FFFFFF',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Spesifikasi */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                color: '#333333',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px'
              }}>
                Spesifikasi
              </label>
              <textarea
                name="spesifikasi"
                value={formData.spesifikasi}
                onChange={handleChange}
                placeholder="Deskripsikan spesifikasi produk"
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: formData.spesifikasi ? '#000000' : '#999999',
                  background: '#FFFFFF',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'flex-end'
            }}>
              {/* Reset Form Button */}
              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'inherit'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 2C11.3137 2 14 4.68629 14 8C14 11.3137 11.3137 14 8 14M8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14M8 2V6M8 14V10" stroke="#333333" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M4 4L8 8M12 12L8 8" stroke="#333333" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Reset Form
              </button>

              {/* Simpan Produk Button */}
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#2F516A',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'inherit'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="4" width="8" height="8" rx="1" stroke="white" strokeWidth="1.5"/>
                  <path d="M6 8H10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Simpan Produk
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
