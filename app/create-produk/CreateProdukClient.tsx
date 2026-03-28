'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

function CreateProdukContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    kategoriProduk: '',
    namaProduk: '',
    kodeProduk: '',
    merk: '',
    tipeModel: '',
    spesifikasi: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchProduk = async () => {
        try {
          // Fetch all products to find the one we need (simpler given current API structure)
          // Ideally API should support GET /api/produk?id=...
          // But our GET /api/produk returns list. Let's filter client side or update API later if needed.
          // UPDATE: Actually let's just fetch the list and find it, or we could ask to update GET to support ID.
          // For now, let's just fetch all and filter.
          const response = await fetch('/api/produk');
          if (response.ok) {
            const data = await response.json();
            const produk = data.find((p: any) => p.id === parseInt(id));
            if (produk) {
              setFormData({
                kategoriProduk: produk.kategori === 'ASET' ? 'aset' : 'hp',
                namaProduk: produk.nama,
                kodeProduk: produk.kode,
                merk: produk.merk,
                tipeModel: produk.model,
                spesifikasi: produk.spesifikasi,
              });
            }
          }
        } catch (error) {
          console.error("Error fetching product:", error);
        }
      };
      fetchProduk();
    }
  }, [isEditing, id]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.kategoriProduk) {
      alert('Mohon pilih kategori produk');
      setIsLoading(false);
      return;
    }

    // Validate Kode Produk (Alphanumeric only)
    if (!/^[a-zA-Z0-9]+$/.test(formData.kodeProduk)) {
      alert('Kode Produk hanya boleh berisi huruf dan angka (tanpa spasi atau karakter spesial)');
      setIsLoading(false);
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
      // quantity is handled by backend logic or existing data
    };

    try {
      const url = isEditing ? `/api/produk?id=${id}` : '/api/produk';
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
        // Handle unique constraint error
        if (response.status === 409) {
          alert(errorData.error || 'Kode produk sudah digunakan. Mohon gunakan kode lain.');
          setIsLoading(false);
          return;
        }
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} product`);
      }

      alert(`Produk berhasil ${isEditing ? 'diperbarui' : 'dibuat'}!`);

      if (isEditing) {
        router.push('/data-inventaris');
      } else {
        handleReset();
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} product:`, error);
      alert(`Gagal ${isEditing ? 'memperbarui' : 'membuat'} produk. Silakan coba lagi.`);
    } finally {
      setIsLoading(false);
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
          {isEditing ? 'Ubah Produk' : 'Buat Produk'}
        </h1>
        <p style={{
          color: '#666666',
          fontSize: '16px',
          fontWeight: 400,
          marginBottom: '32px'
        }}>
          {isEditing ? 'Perbarui data produk master' : 'Tambahkan produk master baru ke inventaris'}
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
                icon="gridicons:product"
                height="24"
                style={{
                  color: '#1E1E1E'
                }}
              />
            </div>
            <div>
              <h2 style={{
                color: '#333333',
                fontSize: '20px',
                fontWeight: 700
              }}>
                Informasi Produk
              </h2>
              <p style={{
                color: '#666666',
                fontSize: '14px',
                fontWeight: 400,
              }}>
                Isi data produk dengan lengkap
              </p>
            </div>
          </div>

          <hr style={{ margin: '24px 0px' }} />

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
                  <iconify-icon
                    icon="icon-park-outline:down"
                    height="20"
                    style={{
                      color: '#A7A7A7'
                    }}
                  />
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
                {isEditing ? 'Simpan Perubahan' : 'Tambahkan Produk'}
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CreateProdukPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateProdukContent />
    </Suspense>
  );
}
