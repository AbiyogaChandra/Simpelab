'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function CreateBarangPage() {
  const [formData, setFormData] = useState({
    pilihProduk: '',
    nomorSeri: '',
    tanggalMasuk: '',
    letak: '',
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
      pilihProduk: '',
      nomorSeri: '',
      tanggalMasuk: '',
      letak: '',
    });
  };

  const handleGenerateQR = () => {
    // Handle QR code generation
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
          Create Barang
        </h1>
        <p style={{
          color: '#666666',
          fontSize: '16px',
          fontWeight: 400,
          marginBottom: '32px'
        }}>
          Daftarkan barang untuk setiap produk
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
              <path d="M4 6L10 2L16 6M4 6V16C4 16.5523 4.44772 17 5 17H15C15.5523 17 16 16.5523 16 16V6M4 6L10 10L16 6" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 10V18" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <h2 style={{
              color: '#333333',
              fontSize: '20px',
              fontWeight: 700
            }}>
              Informasi Barang
            </h2>
          </div>
          <p style={{
            color: '#666666',
            fontSize: '14px',
            fontWeight: 400,
            marginBottom: '24px',
            marginLeft: '36px'
          }}>
            Isi data barang dengan lengkap
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Pilih Produk */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                color: '#333333',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px'
              }}>
                Pilih Produk
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="pilihProduk"
                  value={formData.pilihProduk}
                  onChange={handleChange}
                  placeholder="Pilih produk master"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingRight: '40px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: formData.pilihProduk ? '#000000' : '#999999',
                    background: '#FFFFFF',
                    fontFamily: 'inherit'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  right: '16px',
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

            {/* Nomor Seri and Tanggal Masuk - Two Columns */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginBottom: '24px'
            }}>
              {/* Nomor Seri */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}>
                  Nomor Seri
                </label>
                <input
                  type="text"
                  name="nomorSeri"
                  value={formData.nomorSeri}
                  onChange={handleChange}
                  placeholder="Contoh : 001"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: formData.nomorSeri ? '#000000' : '#999999',
                    background: '#FFFFFF',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Tanggal Masuk */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}>
                  Tanggal Masuk
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="tanggalMasuk"
                    value={formData.tanggalMasuk}
                    onChange={handleChange}
                    placeholder="DD/MM/YYYY"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      paddingRight: '40px',
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: formData.tanggalMasuk ? '#000000' : '#999999',
                      background: '#FFFFFF',
                      fontFamily: 'inherit'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2H4C2.89543 2 2 2.89543 2 4V12C2 13.1046 2.89543 14 4 14H12C13.1046 14 14 13.1046 14 12V4C14 2.89543 13.1046 2 12 2Z" stroke="#666666" strokeWidth="1.5" />
                      <path d="M2 6H14" stroke="#666666" strokeWidth="1.5" />
                      <path d="M5 2V6" stroke="#666666" strokeWidth="1.5" />
                      <path d="M11 2V6" stroke="#666666" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Letak */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                color: '#333333',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px'
              }}>
                Letak
              </label>
              <textarea
                name="letak"
                value={formData.letak}
                onChange={handleChange}
                placeholder="Ketik letak barang disini..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: formData.letak ? '#000000' : '#999999',
                  background: '#FFFFFF',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* QR Code Section */}
            <div style={{
              marginBottom: '32px',
              padding: '20px',
              background: '#F9F9F9',
              borderRadius: '8px',
              border: '1px solid #E0E0E0'
            }}>
              <label style={{
                display: 'block',
                color: '#333333',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px'
              }}>
                QR Code
              </label>
              <p style={{
                color: '#666666',
                fontSize: '14px',
                fontWeight: 400,
                marginBottom: '16px'
              }}>
                Generate QR Code untuk barang ini
              </p>
              <button
                type="button"
                onClick={handleGenerateQR}
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
                Generate QR Code
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="5" height="5" rx="1" stroke="#333333" strokeWidth="1.5" />
                  <rect x="9" y="2" width="5" height="5" rx="1" stroke="#333333" strokeWidth="1.5" />
                  <rect x="2" y="9" width="5" height="5" rx="1" stroke="#333333" strokeWidth="1.5" />
                  <rect x="9" y="9" width="5" height="5" rx="1" stroke="#333333" strokeWidth="1.5" />
                  <rect x="4" y="4" width="1" height="1" fill="#333333" />
                  <rect x="11" y="4" width="1" height="1" fill="#333333" />
                  <rect x="4" y="11" width="1" height="1" fill="#333333" />
                  <rect x="11" y="11" width="1" height="1" fill="#333333" />
                </svg>
              </button>
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
                  <path d="M8 2C11.3137 2 14 4.68629 14 8C14 11.3137 11.3137 14 8 14M8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14M8 2V6M8 14V10" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M4 4L8 8M12 12L8 8" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" />
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
                  <path d="M4 6L10 2L16 6M4 6V16C4 16.5523 4.44772 17 5 17H15C15.5523 17 16 16.5523 16 16V6M4 6L10 10L16 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 10V18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
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
