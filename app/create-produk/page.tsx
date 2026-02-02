'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.kategoriProduk) {
      alert('Mohon pilih kategori produk');
      return;
    }

    // Validate Kode Produk (Alphanumeric only)
    if (!/^[a-zA-Z0-9]+$/.test(formData.kodeProduk)) {
      alert('Kode Produk hanya boleh berisi huruf dan angka (tanpa spasi atau karakter spesial)');
      return;
    }

    // Map form data to API schema
    const apiData = {
      kategori: formData.kategoriProduk === 'aset' ? 'ASET' : 'HP',
      nama: formData.namaProduk,
      kode: formData.kodeProduk,
      merk: formData.merk,
      model: formData.tipeModel,
      spesifikasi: formData.spesifikasi,
      kuantitas: 0 // Default per schema/logic
    };

    try {
      const response = await fetch('/api/produk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      alert('Produk berhasil dibuat!');
      handleReset();
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Gagal membuat produk. Silakan coba lagi.');
    }
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
              <rect x="4" y="4" width="16" height="16" rx="2" stroke="#333333" strokeWidth="1.5" />
              <path d="M8 8H16M8 12H16M8 16H12" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" />
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
                  <option value="aset">Aset</option>
                  <option value="hp">Habis Pakai</option>
                </select>
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
                  <rect x="4" y="4" width="8" height="8" rx="1" stroke="white" strokeWidth="1.5" />
                  <path d="M6 8H10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
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
