'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { useSearchParams, useRouter } from 'next/navigation';
import QRCode from "react-qr-code";
import PhotoPickerModal from "@/components/PhotoPickerModal";

function CreateDetailProdukContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEditing = !!editId;

  const [formData, setFormData] = useState({
    pilihProduk: '',
    nomorSeri: '',
    tanggalMasuk: '',
    letak: '',
    kondisi: 'BAIK',
    kodeScan: '', // Used for editing or generated
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

        if (isEditing) {
          const detailRes = await fetch(`/api/detail-produk?id=${editId}`);
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            if (detailData.length > 0) {
              const item = detailData[0];
              setFormData({
                pilihProduk: item.id_produk.toString(),
                nomorSeri: item.kode_seri || '',
                tanggalMasuk: '', // Date usually managed by created_at if not explicit input
                letak: item.id_lokasi.toString(),
                kondisi: item.kondisi,
                kodeScan: item.kode_scan || '',
              });
              // Initialize search queries for autocomplete
              setSearchQuery(`${item.produk.nama} - ${item.produk.merk} - ${item.produk.model} - ${item.produk.spesifikasi} (${item.produk.kode})`);
              setLokasiSearchQuery(item.lokasi.keterangan);
              setSelectedRuang(item.lokasi.nama_ruang);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [editId, isEditing]);

  // Autocomplete state for Produk
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Autocomplete state for Lokasi
  const [lokasiSearchQuery, setLokasiSearchQuery] = useState('');
  const [showLokasiDropdown, setShowLokasiDropdown] = useState(false);
  const [selectedRuang, setSelectedRuang] = useState<string | null>(null);
  const [isGeneratingSerial, setIsGeneratingSerial] = useState(false);
  
  // for photopicker
const [openPhoto, setOpenPhoto] = useState(false);
const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Filter products based on search
  const filteredProduk = produkList.filter(produk =>
    produk.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    produk.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    produk.merk.toLowerCase().includes(searchQuery.toLowerCase()) ||
    produk.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter lokasi based on state (Ruang or Keterangan)
  const filteredLokasi = (() => {
    if (!selectedRuang) {
      const uniqueRuangs = Array.from(new Set(lokasiList.map(l => l.nama_ruang)));
      return uniqueRuangs
        .filter(ruang => ruang.toLowerCase().includes(lokasiSearchQuery.toLowerCase()))
        .map(ruang => ({ type: 'ruang', value: ruang }));
    } else {
      return lokasiList
        .filter(l => l.nama_ruang === selectedRuang)
        .filter(l => l.keterangan.toLowerCase().includes(lokasiSearchQuery.toLowerCase()))
        .map(l => ({ type: 'lokasi', value: l }));
    }
  })();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
    setFormData(prev => ({ ...prev, pilihProduk: '' }));
  };

  const handleSelectProduk = (produk: any) => {
    setFormData(prev => ({ ...prev, pilihProduk: produk.id }));
    setSearchQuery(`${produk.nama} - ${produk.merk} - ${produk.model} - ${produk.spesifikasi} (${produk.kode})`);
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
    if (selectedRuang) {
      setFormData(prev => ({ ...prev, letak: '' }));
    }
  };

  const createNewLocation = async (ruang: string, keterangan: string) => {
    try {
      const response = await fetch('/api/lokasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama_ruang: ruang, keterangan }),
      });

      if (!response.ok) throw new Error('Failed to create location');

      const newLokasi = await response.json();
      setLokasiList(prev => [...prev, newLokasi]);
      setFormData(prev => ({ ...prev, letak: newLokasi.id }));
      setLokasiSearchQuery(newLokasi.keterangan);
      setShowLokasiDropdown(false);
    } catch (error) {
      console.error('Error creating location:', error);
      alert('Gagal membuat lokasi baru');
    }
  };

  const handleSelectLokasiItem = async (item: any) => {
    if (item.type === 'ruang') {
      setSelectedRuang(item.value);
      setLokasiSearchQuery('');
      setShowLokasiDropdown(true);
    } else if (item.type === 'lokasi') {
      const lokasi = item.value;
      setFormData(prev => ({ ...prev, letak: lokasi.id }));
      setLokasiSearchQuery('');
      setShowLokasiDropdown(false);
    } else if (item.type === 'new_ruang') {
      setSelectedRuang(lokasiSearchQuery);
      setLokasiSearchQuery('');
      setShowLokasiDropdown(true);
    } else if (item.type === 'new_lokasi') {
      await createNewLocation(selectedRuang!, lokasiSearchQuery);
      setLokasiSearchQuery('');
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

      while (!isUnique && attempts < 10) {
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

  const handleClearRuang = () => {
    setSelectedRuang(null);
    setLokasiSearchQuery('');
    setFormData(prev => ({ ...prev, letak: '' }));
    setShowLokasiDropdown(true);
  };

  const handleBlur = () => {
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

    // Map form data to API schema
    const apiData = {
      id_produk: parseInt(formData.pilihProduk),
      id_lokasi: parseInt(formData.letak),
      kode_seri: isHabisPakai ? null : formData.nomorSeri,
      status: 'TERSEDIA',
      kondisi: formData.kondisi,
      kode_scan: isHabisPakai ? null : getQRValue(),
    };

    try {
      const url = isEditing ? `/api/detail-produk?id=${editId}` : '/api/detail-produk';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} detail product`);
      }

      alert(`Detail produk berhasil ${isEditing ? 'diperbarui' : 'dibuat'}!`);

      if (isEditing) {
        router.push('/data-inventaris');
      } else {
        handleReset();
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} item:`, error);
      alert(`Gagal ${isEditing ? 'memperbarui' : 'menambahkan'} barang. Silakan coba lagi.`);
    }
  };

  const handleReset = () => {
    setFormData({
      pilihProduk: '',
      nomorSeri: '',
      tanggalMasuk: '',
      letak: '',
      kondisi: 'BAIK',
      kodeScan: '',
    });
    setSearchQuery('');
    setLokasiSearchQuery('');
    router.push('/create-detail-produk'); // Clear ID param
  };

  const getQRValue = () => {
    // If editing and has kodeScan, use it.
    if (isEditing && formData.kodeScan) return formData.kodeScan;

    // If creating or editing without kodeScan, compute it.
    if (formData.nomorSeri && selectedProduct) {
      return `${selectedProduct.kode}-${formData.nomorSeri}`;
    }
    return '';
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
          {isEditing ? 'Ubah Detail Produk' : 'Buat Detail Produk'}
        </h1>
        <p style={{
          color: '#666666',
          fontSize: '16px',
          fontWeight: 400,
          marginBottom: '32px'
        }}>
          {isEditing ? 'Perbarui data detail produk' : 'Daftarkan detail produk untuk setiap produk'}
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
            gap: '16px',
          }}>
            <div style={{
              padding: '10px',
              backgroundColor: '#F3F3F3',
              borderRadius: '8px'
            }}>
              <iconify-icon
                icon="ep:goods-filled"
                height="24"
                style={{
                  color: '#1E1E1E'
                }}
              />
            </div>
            <div>
              <h2 style={{
                color: '#1E1E1E',
                fontSize: '20px',
                fontWeight: 700
              }}>
                Informasi Detail Produk
              </h2>
              <p style={{
                color: '#6D7D90',
                fontSize: '14px',
                fontWeight: 400,
              }}>
                Isi data detail produk dengan lengkap
              </p>
            </div>
          </div>

          <hr style={{ margin: '24px 0px' }} />

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '24px',
              marginBottom: '24px',
              alignItems: 'stretch'
            }}>
              {/* Left Column: Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Pilih Produk */}
                <div>
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
                      placeholder="Ketik nama, kode, merk, atau model produk..."
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
                            {`${produk.nama} - ${produk.merk} - ${produk.model} - ${produk.spesifikasi} (${produk.kode})`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

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
                          <iconify-icon
                            icon="tabler:dice"
                            height="24"
                          />
                          Buat
                        </>
                      )}
                    </button>
                  </div>
                </div>


                {/* Kondisi and Lokasi Row */}
                <div style={{ display: 'flex', gap: '24px' }}>
                  {/* Kondisi Barang (Small) */}
                  <div style={{ flex: '0 0 150px' }}>
                    <label style={{
                      display: 'block',
                      color: '#333333',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '8px'
                    }}>
                      Kondisi
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select
                        name="kondisi"
                        value={formData.kondisi}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          paddingRight: '32px',
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
                    </div>
                  </div>

                  {/* Lokasi Autocomplete (Wide) */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1
                  }}>
                    <label style={{
                      display: 'block',
                      color: '#333333',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '8px'
                    }}>
                      Lokasi
                    </label>
                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      flex: 1
                    }}>
                      <div style={{
                        display: 'flex',
                        flex: 1,
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
                            gap: '8px',
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
                                color: '#1E1E1E',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <iconify-icon
                                icon="basil:cross-solid"
                                height="20"
                              />
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
                                color: '#1E1E1E',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <iconify-icon
                                icon="basil:cross-solid"
                                height="20"
                              />
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
                            >
                              + Tambahkan lokasi baru di {selectedRuang} "{lokasiSearchQuery}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: QR Code Display */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#F9FAFB',
                borderRadius: '12px',
                border: '1px dashed #E0E0E0',
                padding: '24px',
                height: '100%',
                minHeight: '200px'
              }}>
                {isHabisPakai ? (
                  <div style={{ textAlign: 'center', color: '#666' }}>
                    <iconify-icon icon="mdi:qrcode-off" height="48" style={{ marginBottom: '16px', color: '#999' }} />
                    <p style={{ fontSize: '14px' }}>QR Code tidak tersedia untuk barang Habis Pakai</p>
                  </div>
                ) : getQRValue() ? (
                  <>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                      <QRCode
                        value={getQRValue()}
                        size={120}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 120 120`}
                      />
                    </div>
                    {/* <p style={{
                      marginTop: '16px',
                      color: '#333333',
                      fontSize: '14px',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}>
                      {getQRValue()}
                    </p> */}
                    <p style={{
                      marginTop: '16px',
                      color: '#A7A7A7',
                      fontSize: '12px'
                    }}>
                      Simpan kode ini untuk ditempel pada barang
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ background: 'white', padding: '14px', borderRadius: '12px', boxShadow: 'none', border: '2px dashed #e0e0e0' }}>
                      <QRCode
                        value="PLACEHOLDER-QR-CODE"
                        size={180}
                        fgColor="#e0e0e0"
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                      />
                    </div>
                    <span style={{ marginTop: '16px', fontSize: '13px', color: '#999999', fontWeight: 500 }}>
                      Menunggu Generasi Kode...
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* FOTO PRODUK */}
<div style={{ marginTop: '24px' }}>
  <label style={{
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '8px'
  }}>
    Foto Produk
  </label>

  <div
    onClick={() => setOpenPhoto(true)}
    style={{
      border: '2px dashed #E0E0E0',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      cursor: 'pointer',
      background: '#FAFAFA'
    }}
  >
    {selectedImage ? (
      <img
        src={URL.createObjectURL(selectedImage)}
        style={{
          width: '120px',
          height: '120px',
          objectFit: 'cover',
          borderRadius: '12px'
        }}
      />
    ) : (
      <>
        <div style={{ fontSize: '32px' }}>📷</div>
        <p style={{ fontSize: '14px', color: '#777' }}>
          Tambahkan Foto
        </p>
      </>
    )}
  </div>
</div>

            <hr style={{ margin: '8px 0px' }} />

            {/* Actions */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
              <button
                type="submit"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '16px',
                  background: '#2F516A',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 400,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  boxShadow: '0 4px 6px rgba(47, 81, 106, 0.2)'
                }}
              >
                <iconify-icon
                  icon="material-symbols:save-rounded"
                  height="20"
                />
                {isEditing ? 'Simpan Perubahan' : 'Tambahkan Detail Produk'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '16px',
                  background: '#FFFFFF',
                  border: '1px solid #2F516A',
                  borderRadius: '12px',
                  color: '#2F516A',
                  fontSize: '16px',
                  fontWeight: 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <iconify-icon
                  icon="ri:reset-left-line"
                  height="20"
                />
                Reset Form
              </button>
              {/* FOTO PRODUK */}
<div style={{ marginTop: '24px' }}>
  <label style={{
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '8px'
  }}>
    Foto Produk
  </label>

  <div
    onClick={() => setOpenPhoto(true)}
    style={{
      border: '2px dashed #E0E0E0',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      cursor: 'pointer',
      background: '#FAFAFA'
    }}
  >
    {selectedImage ? (
      <img
        src={URL.createObjectURL(selectedImage)}
        style={{
          width: '120px',
          height: '120px',
          objectFit: 'cover',
          borderRadius: '12px'
        }}
      />
    ) : (
      <>
        <div style={{ fontSize: '32px' }}>📷</div>
        <p style={{ fontSize: '14px', color: '#777' }}>
          Tambahkan Foto
        </p>
      </>
    )}
  </div>
</div>

<hr style={{ margin: '8px 0px' }} />
            </div>
          </form>
          <PhotoPickerModal
  isOpen={openPhoto}
  onClose={() => setOpenPhoto(false)}
  onSelect={(file) => {
    setSelectedImage(file);
    setOpenPhoto(false);
  }}
/>
        </div>
      </div>

    </div>
  );
}

export default function CreateDetailProdukPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateDetailProdukContent />
    </Suspense>
  );
}
