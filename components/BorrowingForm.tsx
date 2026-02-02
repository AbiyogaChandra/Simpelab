'use client';

import { useState } from 'react';
import illustration from '@/app/illustration.png';

interface Product {
  id: number;
  nama: string;
  stok: number;
}

export default function BorrowingForm() {
  const [formData, setFormData] = useState({
    kategori: '',
    identitas: '',
    barang: '',
    catatanBarang: '',
    tanggalPinjam: '',
    tanggalKembali: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  // Dummy data produk
  const [products] = useState<Product[]>([
    { id: 1, nama: 'Flashdisk USB C', stok: 3 },
    { id: 2, nama: 'HDMI', stok: 2 },
  ]);

  // Filter produk berdasarkan search query
  const filteredProducts = products.filter(product =>
    product.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = (product: Product) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleConfirm = () => {
    const productNames = selectedProducts.map(p => p.nama).join(', ');
    setFormData({
      ...formData,
      barang: productNames,
    });
    setIsModalOpen(false);
    setSelectedProducts([]);
    setSearchQuery('');
  };

  const handleBarangClick = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [target.name]: target.value,
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
          {/* Row 1: Kategori Peminjam and Identitas */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {/* Kategori Peminjam */}
            <div style={{ flex: 1 }}>
              <label className="block mb-2.5" style={{ color: '#333333', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                Kategori Peminjam
              </label>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="kategori"
                    value="guru"
                    checked={formData.kategori === 'guru'}
                    onChange={handleChange}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#333333'
                    }}
                  />
                  <span style={{ fontSize: '14px', color: '#333333' }}>Guru</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="kategori"
                    value="siswa"
                    checked={formData.kategori === 'siswa'}
                    onChange={handleChange}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#333333'
                    }}
                  />
                  <span style={{ fontSize: '14px', color: '#333333' }}>Siswa</span>
                </label>
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
            <label className="block mb-2.5" style={{ color: '#333333', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
              Barang
            </label>
            <button
              type="button"
              onClick={handleBarangClick}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #2F5F7C',
                borderRadius: '8px',
                background: '#FFFFFF',
                color: '#2F5F7C',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0F7FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3V13M3 8H13" stroke="#2F5F7C" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Tambahkan Barang</span>
            </button>
            {/* Display selected products */}
            {formData.barang && (
              <div style={{ marginTop: '12px', padding: '12px', background: '#F9F9F9', borderRadius: '8px', fontSize: '14px', color: '#333333' }}>
                {formData.barang}
              </div>
            )}
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

      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Bar */}
            <div style={{ marginBottom: '20px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Cari nama produk"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 14L11.1 11.1" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Table */}
            <div style={{ marginBottom: '20px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E0E0E0' }}>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#333333' 
                    }}>
                      No
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#333333' 
                    }}>
                      Nama Produk
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#333333' 
                    }}>
                      Stok
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#333333' 
                    }}>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#333333' }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#333333' }}>
                        {product.nama}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#333333' }}>
                        {product.stok}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          type="button"
                          onClick={() => handleAddProduct(product)}
                          disabled={selectedProducts.some(p => p.id === product.id)}
                          style={{
                            padding: '6px 16px',
                            border: '1px solid #4A90E2',
                            borderRadius: '6px',
                            backgroundColor: selectedProducts.some(p => p.id === product.id) ? '#E0E0E0' : '#E8F4FD',
                            color: selectedProducts.some(p => p.id === product.id) ? '#999999' : '#4A90E2',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: selectedProducts.some(p => p.id === product.id) ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            if (!selectedProducts.some(p => p.id === product.id)) {
                              e.currentTarget.style.backgroundColor = '#D4EBFC';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!selectedProducts.some(p => p.id === product.id)) {
                              e.currentTarget.style.backgroundColor = '#E8F4FD';
                            }
                          }}
                        >
                          {selectedProducts.some(p => p.id === product.id) ? 'Ditambahkan' : 'Tambahkan'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={handleConfirm}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2F5F7C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#254A63'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2F5F7C'}
            >
              Konfirmasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
