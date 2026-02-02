'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function CreateBarangPage() {
  const [formData, setFormData] = useState({
    pilihProduk: '',
    nomorSeri: '',
    tanggalMasuk: '',
    letak: '',
    kondisi: 'BAIK',
  });

  const [produkList, setProdukList] = useState<any[]>([]);
  const [lokasiList, setLokasiList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [produkRes, lokasiRes] = await Promise.all([
          fetch('/api/produk'),
          fetch('/api/lokasi')
        ]);

        const produkData = await produkRes.json();
        const lokasiData = await lokasiRes.json();

        setProdukList(produkData);
        setLokasiList(lokasiData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Autocomplete state for Produk
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Autocomplete state for Lokasi
  const [lokasiSearchQuery, setLokasiSearchQuery] = useState('');
  const [showLokasiDropdown, setShowLokasiDropdown] = useState(false);
  const [selectedRuang, setSelectedRuang] = useState<string | null>(null);
  const [isGeneratingSerial, setIsGeneratingSerial] = useState(false);

  // Filter products based on search
  const filteredProduk = produkList.filter(produk =>
    produk.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    produk.kode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter lokasi based on state (Ruang or Keterangan)
  const filteredLokasi = (() => {
    if (!selectedRuang) {
      // Phase 1: Filter unique Ruang
      const uniqueRuangs = Array.from(new Set(lokasiList.map(l => l.nama_ruang)));
      return uniqueRuangs
        .filter(ruang => ruang.toLowerCase().includes(lokasiSearchQuery.toLowerCase()))
        .map(ruang => ({ type: 'ruang', value: ruang }));
    } else {
      // Phase 2: Filter Keterangan within selected Ruang
      return lokasiList
        .filter(l => l.nama_ruang === selectedRuang)
        .filter(l => l.keterangan.toLowerCase().includes(lokasiSearchQuery.toLowerCase()))
        .map(l => ({ type: 'lokasi', value: l }));
    }
  })();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
    // Reset selected product when typing
    setFormData(prev => ({ ...prev, pilihProduk: '' }));
  };

  const handleSelectProduk = (produk: any) => {
    setFormData(prev => ({ ...prev, pilihProduk: produk.id }));
    setSearchQuery(`${produk.nama} (${produk.kode})`);
    setShowDropdown(false);
  };

  const selectedKeterangan = formData.letak ? lokasiList.find(l => l.id === parseInt(formData.letak as unknown as string))?.keterangan : null;

  const handleClearLokasi = () => {
    setFormData(prev => ({ ...prev, letak: '' }));
    setLokasiSearchQuery('');
    setShowLokasiDropdown(true);
  };

  const handleLokasiSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLokasiSearchQuery(e.target.value);
    setShowLokasiDropdown(true);
    // If we are in Phase 2 (Ruang selected), clearing the text shouldn't reset Ruang, 
    // unless user explicitly deletes the chip (handled separately).
    if (selectedRuang) {
      setFormData(prev => ({ ...prev, letak: '' }));
    }
  };

  const handleSelectLokasiItem = async (item: any) => {
    if (item.type === 'ruang') {
      setSelectedRuang(item.value);
      setLokasiSearchQuery(''); // Clear query for next step
      setShowLokasiDropdown(true);
    } else if (item.type === 'lokasi') {
      const lokasi = item.value;
      setFormData(prev => ({ ...prev, letak: lokasi.id }));
      setLokasiSearchQuery('');
      setShowLokasiDropdown(false);
    } else if (item.type === 'new_ruang') {
      // Handle creating new Ruang (set as selectedRuang)
      setSelectedRuang(lokasiSearchQuery);
      setLokasiSearchQuery('');
      setShowLokasiDropdown(true);
    } else if (item.type === 'new_lokasi') {
      // Handle creating new Location
      await createNewLocation(selectedRuang!, lokasiSearchQuery);
      setLokasiSearchQuery(''); // Clear query after creation
    }
  };

  const handleGenerateSerial = async () => {
    if (!formData.pilihProduk) {
      alert('Mohon pilih produk terlebih dahulu untuk memastikan keunikan kode seri.');
      return;
    }

    setIsGeneratingSerial(true);
    try {
      const res = await fetch(`/api/detail-produk?id_produk=${formData.pilihProduk}`);
      if (!res.ok) throw new Error('Failed to fetch existing products');

      const data = await res.json();
      const existingSerials = new Set(data.map((item: any) => item.kode_seri));

      let candidate = '';
      let isUnique = false;
      let attempts = 0;

      // Try to generate a unique serial
      while (!isUnique && attempts < 10) {
        // Generate random 8-char string (e.g., A1B2C3D4)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        candidate = Array.from({ length: 32 }, () =>
          chars.charAt(Math.floor(Math.random() * chars.length))
        ).join('');

        if (!existingSerials.has(candidate)) {
          isUnique = true;
        }
        attempts++;
      }

      if (isUnique) {
        setFormData(prev => ({ ...prev, nomorSeri: candidate }));
      } else {
        alert('Gagal membuat kode seri unik. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error generating serial:', error);
      alert('Terjadi kesalahan saat generate kode seri.');
    } finally {
      setIsGeneratingSerial(false);
    }
  };

  const selectedProduct = formData.pilihProduk ? produkList.find(p => p.id === parseInt(formData.pilihProduk)) : null;
  const isHabisPakai = selectedProduct?.kategori === 'HP';

  const createNewLocation = async (ruang: string, keterangan: string) => {
    try {
      const response = await fetch('/api/lokasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama_ruang: ruang, keterangan }),
      });

      if (!response.ok) throw new Error('Failed to create location');

      const newLokasi = await response.json();
      // Update list
      setLokasiList(prev => [...prev, newLokasi]);
      // Select it
      setFormData(prev => ({ ...prev, letak: newLokasi.id }));
      setLokasiSearchQuery(newLokasi.keterangan);
      setShowLokasiDropdown(false);
    } catch (error) {
      console.error('Error creating location:', error);
      alert('Gagal membuat lokasi baru');
    }
  };

  const handleClearRuang = () => {
    setSelectedRuang(null);
    setLokasiSearchQuery('');
    setFormData(prev => ({ ...prev, letak: '' }));
    setShowLokasiDropdown(true);
  };

  // Close dropdown when clicking outside (simple implementation using blur delay)
  const handleBlur = () => {
    // Small delay to allow click event on dropdown items to fire
    setTimeout(() => setShowDropdown(false), 200);
  };

  const handleLokasiBlur = () => {
    setTimeout(() => setShowLokasiDropdown(false), 200);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.pilihProduk || !formData.letak) {
      alert('Mohon pilih produk dan lokasi');
      return;
    }

    // ... rest of submit logic
    const apiData = {
      id_produk: parseInt(formData.pilihProduk),
      id_lokasi: parseInt(formData.letak),
      kode_seri: formData.nomorSeri,
      status: 'TERSEDIA', // Default
      kondisi: formData.kondisi,
      kode_scan: formData.nomorSeri && selectedProduct
        ? `${selectedProduct.kode}-${formData.nomorSeri}`
        : '',
    };

    try {
      const response = await fetch('/api/detail-produk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create item');
      }

      alert('Barang berhasil ditambahkan!');
      handleReset();
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Gagal menambahkan barang. Silakan coba lagi.');
    }
  };

  const handleReset = () => {
    setFormData({
      pilihProduk: '',
      nomorSeri: '',
      tanggalMasuk: '',
      letak: '',
      kondisi: 'BAIK',
    });
    setSearchQuery('');
    setLokasiSearchQuery('');
  };

  const handleGenerateQR = () => {
    // Handle QR code generation
    alert('Fitur Generate QR Code belum tersedia');
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
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={handleBlur}
                  placeholder="Ketik nama atau kode produk..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingRight: '40px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: searchQuery ? '#000000' : '#999999',
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
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 11L8.5 8.5M9.5 5.5C9.5 7.70914 7.70914 9.5 5.5 9.5C3.29086 9.5 1.5 7.70914 1.5 5.5C1.5 3.29086 3.29086 1.5 5.5 1.5C7.70914 1.5 9.5 3.29086 9.5 5.5Z" stroke="#999999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Autocomplete Dropdown */}
                {showDropdown && filteredProduk.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    background: '#FFFFFF',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #F3F4F6',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 20
                  }}>
                    {filteredProduk.map(produk => (
                      <div
                        key={produk.id}
                        onClick={() => handleSelectProduk(produk)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: '#333333',
                          borderBottom: '1px solid #F9FAFB'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                      >
                        {produk.nama} <span style={{ color: '#6B7280', fontSize: '12px' }}>({produk.kode})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Kode Seri and Tanggal Masuk - Two Columns */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginBottom: '24px'
            }}>
              {/* Kode Seri */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}>
                  Kode Seri
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="nomorSeri"
                    value={isHabisPakai ? "" : formData.nomorSeri}
                    onChange={handleChange}
                    placeholder={isHabisPakai ? "Tidak diperlukan untuk barang habis pakai" : "Generasi otomatis..."}
                    disabled
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: formData.nomorSeri ? '#333333' : '#999999',
                      background: '#F9FAFB',
                      fontFamily: 'inherit',
                      cursor: 'not-allowed'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateSerial}
                    disabled={!formData.pilihProduk || isGeneratingSerial || isHabisPakai}
                    style={{
                      padding: '12px 16px',
                      background: isHabisPakai ? '#E2E8F0' : '#0F172A',
                      color: isHabisPakai ? '#94A3B8' : '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: (!formData.pilihProduk || isGeneratingSerial || isHabisPakai) ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      opacity: (!formData.pilihProduk || isGeneratingSerial) ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isGeneratingSerial ? '...' : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                          <line x1="9" y1="9" x2="9.01" y2="9" />
                          <line x1="15" y1="9" x2="15.01" y2="9" />
                          <line x1="9" y1="15" x2="9.01" y2="15" />
                          <line x1="15" y1="15" x2="15.01" y2="15" />
                        </svg>
                        Buat
                      </>
                    )}
                  </button>
                </div>
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
                    type="date"
                    name="tanggalMasuk"
                    value={formData.tanggalMasuk}
                    onChange={handleChange}
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
                </div>
              </div>
            </div>

            {/* Kondisi and Lokasi - Two Columns */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginBottom: '24px'
            }}>
              {/* Kondisi Barang */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}>
                  Kondisi Barang
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    name="kondisi"
                    value={formData.kondisi}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      paddingRight: '40px',
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: formData.kondisi ? '#000000' : '#999999',
                      background: '#FFFFFF',
                      appearance: 'none',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="BAIK">Baik</option>
                    <option value="RUSAK">Rusak</option>
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

              {/* Lokasi Autocomplete */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}>
                  Lokasi
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    padding: '8px 12px',
                    gap: '8px'
                  }}>
                    {/* Chip for Selected Ruang */}
                    {selectedRuang && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#ECEFF1',
                        borderRadius: '16px',
                        padding: '4px 12px',
                        gap: '6px',
                        width: 'auto',
                        minWidth: '100px',
                        maxWidth: '45%'
                      }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#333333',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          flex: 1
                        }}>
                          {selectedRuang}
                        </span>
                        <button
                          type="button"
                          onClick={handleClearRuang}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 3L3 9M3 3L9 9" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Chip for Selected Keterangan (Lokasi) */}
                    {selectedKeterangan && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#E0F2F1', // Greenish tint
                        borderRadius: '16px',
                        padding: '4px 12px',
                        gap: '6px',
                        width: 'auto',
                        minWidth: '100px',
                        maxWidth: '45%'
                      }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#00695C',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          flex: 1
                        }}>
                          {selectedKeterangan}
                        </span>
                        <button
                          type="button"
                          onClick={handleClearLokasi}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 3L3 9M3 3L9 9" stroke="#004D40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Input Field - Hide if Keterangan is selected */}
                    {!selectedKeterangan && (
                      <input
                        type="text"
                        value={lokasiSearchQuery}
                        onChange={handleLokasiSearchChange}
                        onFocus={() => setShowLokasiDropdown(true)}
                        onBlur={handleLokasiBlur}
                        placeholder={selectedRuang ? "Ketik keterangan spesifik..." : "Pilih Ruangan"}
                        style={{
                          border: 'none',
                          outline: 'none',
                          width: '100%',
                          fontSize: '14px',
                          color: lokasiSearchQuery ? '#000000' : '#999999',
                          fontFamily: 'inherit',
                          flex: 1
                        }}
                      />
                    )}
                  </div>

                  {/* Dropdown Icon */}
                  <div style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 11L8.5 8.5M9.5 5.5C9.5 7.70914 7.70914 9.5 5.5 9.5C3.29086 9.5 1.5 7.70914 1.5 5.5C1.5 3.29086 3.29086 1.5 5.5 1.5C7.70914 1.5 9.5 3.29086 9.5 5.5Z" stroke="#999999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* Lokasi Dropdown */}
                  {showLokasiDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      background: '#FFFFFF',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      border: '1px solid #F3F4F6',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 20
                    }}>
                      {/* Filtered Items */}
                      {filteredLokasi.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => handleSelectLokasiItem(item)}
                          style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#333333',
                            borderBottom: '1px solid #F9FAFB'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                        >
                          {item.type === 'ruang' ? (item.value as string) : (item.value as any).keterangan}
                        </div>
                      ))}

                      {/* Add New Options */}
                      {!selectedRuang && !filteredLokasi.some(i => i.type === 'ruang' && i.value === lokasiSearchQuery) && lokasiSearchQuery && (
                        <div
                          onClick={() => handleSelectLokasiItem({ type: 'new_ruang' })}
                          style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#2F516A',
                            fontWeight: 500,
                            borderTop: '1px solid #F3F4F6'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                        >
                          + Tambahkan ruang baru "{lokasiSearchQuery}"
                        </div>
                      )}

                      {selectedRuang && !filteredLokasi.some(i => i.type === 'lokasi' && (i.value as any).keterangan === lokasiSearchQuery) && lokasiSearchQuery && (
                        <div
                          onClick={() => handleSelectLokasiItem({ type: 'new_lokasi' })}
                          style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#2F516A',
                            fontWeight: 500,
                            borderTop: '1px solid #F3F4F6'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                        >
                          + Tambahkan lokasi baru "{lokasiSearchQuery}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
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
