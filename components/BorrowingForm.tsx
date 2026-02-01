'use client';

import { useState } from 'react';
import illustration from '@/app/illustration.png';

export default function BorrowingForm() {
  const [formData, setFormData] = useState({
    kategori: '',
    identitas: '',
    barang: '',
    catatanBarang: '',
    tanggalPinjam: '',
    tanggalKembali: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Left Panel - Dark Teal */}
      <div style={{
        width: '50%',
        background: '#20B2AA',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Illustration Image - Full Background */}
        <img 
          src={typeof illustration === 'string' ? illustration : illustration.src} 
          alt="Lab Illustration" 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block'
          }}
        />

        {/* Overlay Content */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '40px'
        }}>
          {/* Logo */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '12px',
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '12px 20px'
            }}>
              <img src="/logo.png" alt="Simpelab Logo" style={{ width: '32px', height: '32px' }} />
              <span style={{ 
                color: '#20B2AA', 
                fontSize: '20px', 
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif'
              }}>
                Simpelab
              </span>
            </div>
          </div>

          {/* Welcome Text */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              color: '#FEFEFE',
              fontSize: '24px',
              fontWeight: 400,
              lineHeight: '100%',
              letterSpacing: '0%',
              marginBottom: '8px',
              fontFamily: 'Outfit, sans-serif'
            }}>
              Welcome To
            </div>
            <h1 style={{
              color: '#FEFEFE',
              fontSize: '64px',
              fontWeight: 600,
              lineHeight: '100%',
              letterSpacing: '0%',
              margin: 0,
              textTransform: 'capitalize',
              fontFamily: 'Outfit, sans-serif'
            }}>
              Simpelab
            </h1>
          </div>
        </div>
      </div>

      {/* Right Panel - White Form */}
      <div style={{
        width: '50%',
        background: '#F5F5F5',
        display: 'flex',
        flexDirection: 'column',
        padding: '60px 80px',
        justifyContent: 'center'
      }}>
        {/* Form */}
        <form 
          onSubmit={handleSubmit} 
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* Row 1: Kategori and Identitas */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {/* Kategori */}
            <div style={{ flex: 1 }}>
              <label className="block mb-2.5" style={{ color: '#333333', fontSize: '14px', fontWeight: 600 }}>
                Kategori
              </label>
              <div className="relative">
                <select
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                  style={{
                    appearance: 'none',
                    background: '#FFFFFF',
                    fontSize: '14px',
                    color: formData.kategori ? '#000000' : '#AAAAAA',
                    height: '48px',
                    paddingLeft: '40px',
                    borderColor: '#E0E0E0',
                    borderRadius: '8px'
                  }}
                >
                  <option value="">Opsi</option>
                  <option value="guru">Guru</option>
                  <option value="murid">Murid</option>
                </select>
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="4" cy="4" r="1.5" fill="#666666"/>
                    <rect x="6.5" y="2.5" width="3" height="3" rx="0.5" fill="#666666"/>
                    <path d="M11.5 2L13.5 4L11.5 6L9.5 4L11.5 2Z" fill="#666666"/>
                  </svg>
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Identitas */}
            <div style={{ flex: 1 }}>
              <label className="block mb-2.5" style={{ color: '#333333', fontSize: '14px', fontWeight: 600 }}>
                Identitas
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="identitas"
                  value={formData.identitas}
                  onChange={handleChange}
                  placeholder="Ketik identitas anda"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                  style={{ 
                    fontSize: '14px', 
                    color: formData.identitas ? '#000000' : '#AAAAAA', 
                    height: '48px',
                    paddingLeft: '40px',
                    borderColor: '#E0E0E0',
                    borderRadius: '8px',
                    background: '#FFFFFF'
                  }}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" stroke="#666666" strokeWidth="1.5"/>
                    <path d="M2 14C2 11.7909 4.68629 10 8 10C11.3137 10 14 11.7909 14 14" stroke="#666666" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Barang */}
          <div>
            <label className="block mb-2.5" style={{ color: '#333333', fontSize: '14px', fontWeight: 600 }}>
              Barang
            </label>
            <div className="relative">
              <input
                type="text"
                name="barang"
                value={formData.barang}
                onChange={handleChange}
                placeholder="Apa saja barang yang akan kamu pinjam?"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                style={{ 
                  fontSize: '14px', 
                  color: formData.barang ? '#000000' : '#AAAAAA', 
                  height: '48px',
                  paddingLeft: '40px',
                  borderColor: '#E0E0E0',
                  borderRadius: '8px',
                  background: '#FFFFFF'
                }}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4L3 6V13C3 13.5523 3.44772 14 4 14H12C12.5523 14 13 13.5523 13 13V6L12 4H4Z" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 4V2C4 1.44772 4.44772 1 5 1H11C11.5523 1 12 1.44772 12 2V4" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 8V10" stroke="#666666" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M10 8V10" stroke="#666666" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Row 3: Catatan Barang */}
          <div>
            <label className="block mb-2.5" style={{ color: '#333333', fontSize: '14px', fontWeight: 600 }}>
              Catatan Barang
            </label>
            <textarea
              name="catatanBarang"
              value={formData.catatanBarang}
              onChange={handleChange}
              placeholder="Ketik catatan barang disini..."
              className="w-full px-4 py-3 border rounded-lg focus:outline-none resize-none"
              style={{ 
                fontSize: '14px', 
                color: formData.catatanBarang ? '#000000' : '#AAAAAA', 
                minHeight: '100px',
                fontFamily: 'inherit',
                borderColor: '#E0E0E0',
                borderRadius: '8px',
                background: '#FFFFFF'
              }}
            />
          </div>

          {/* Row 4: Tanggal Pinjam and Tanggal Kembali */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {/* Tanggal Pinjam */}
            <div style={{ flex: 1 }}>
              <label className="block mb-2.5" style={{ color: '#333333', fontSize: '14px', fontWeight: 600 }}>
                Tanggal Pinjam
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="tanggalPinjam"
                  value={formData.tanggalPinjam}
                  onChange={handleChange}
                  placeholder="DD/MM/YY"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                  style={{ 
                    fontSize: '14px', 
                    color: formData.tanggalPinjam ? '#000000' : '#AAAAAA', 
                    height: '48px',
                    paddingRight: '40px',
                    borderColor: '#E0E0E0',
                    borderRadius: '8px',
                    background: '#FFFFFF'
                  }}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2H4C2.89543 2 2 2.89543 2 4V12C2 13.1046 2.89543 14 4 14H12C13.1046 14 14 13.1046 14 12V4C14 2.89543 13.1046 2 12 2Z" stroke="#666666" strokeWidth="1.5"/>
                    <path d="M2 6H14" stroke="#666666" strokeWidth="1.5"/>
                    <path d="M5 2V6" stroke="#666666" strokeWidth="1.5"/>
                    <path d="M11 2V6" stroke="#666666" strokeWidth="1.5"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Tanggal Kembali */}
            <div style={{ flex: 1 }}>
              <label className="block mb-2.5" style={{ color: '#333333', fontSize: '14px', fontWeight: 600 }}>
                Tanggal Kembali
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="tanggalKembali"
                  value={formData.tanggalKembali}
                  onChange={handleChange}
                  placeholder="DD/MM/YY"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                  style={{ 
                    fontSize: '14px', 
                    color: formData.tanggalKembali ? '#000000' : '#AAAAAA', 
                    height: '48px',
                    paddingRight: '40px',
                    borderColor: '#E0E0E0',
                    borderRadius: '8px',
                    background: '#FFFFFF'
                  }}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2H4C2.89543 2 2 2.89543 2 4V12C2 13.1046 2.89543 14 4 14H12C13.1046 14 14 13.1046 14 12V4C14 2.89543 13.1046 2 12 2Z" stroke="#666666" strokeWidth="1.5"/>
                    <path d="M2 6H14" stroke="#666666" strokeWidth="1.5"/>
                    <path d="M5 2V6" stroke="#666666" strokeWidth="1.5"/>
                    <path d="M11 2V6" stroke="#666666" strokeWidth="1.5"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-lg font-semibold text-white transition-colors"
            style={{
              background: '#2F5F7C',
              fontSize: '15px',
              fontWeight: 600,
              height: '48px',
              marginTop: '8px',
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#254A63'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#2F5F7C'}
          >
            Ajukan peminjaman
          </button>
        </form>
      </div>
    </div>
  );
}
