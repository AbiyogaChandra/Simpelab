'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function CreatePeminjamClient() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    kategori: '',
    nama: '',
    nomor_induk: '',
    kelas: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [peminjamList, setPeminjamList] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchPeminjam = async () => {
      try {
        const response = await fetch('/api/peminjam/list');
        if (response.ok) {
          const data = await response.json();
          setPeminjamList(data);
        }
      } catch (error) {
        console.error("Error fetching peminjam:", error);
      }
    };
    fetchPeminjam();
  }, []);

  const uniqueKelas = Array.from(new Set(peminjamList.map(p => p.kelas).filter(Boolean)));
  const filteredKelas = formData.kelas
      ? uniqueKelas.filter(k => typeof k === 'string' && k.toLowerCase().includes(formData.kelas.toLowerCase()))
      : uniqueKelas;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.kategori) {
      alert('Mohon pilih kategori');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/peminjam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Dispatch global sync just in case
        window.dispatchEvent(new CustomEvent('syncData'));
        router.push('/data-peminjam');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Terjadi kesalahan saat menyimpan data');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent editing check via searchParams not needed because inline edit was chosen.

  return (
    <div className="page-wrapper">
      <Sidebar />

      <div className="main-content">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/data-peminjam" style={{ color: '#2F516A', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
            Data Peminjam
          </Link>
          <iconify-icon icon="mdi:chevron-right" style={{ color: '#666666' }}></iconify-icon>
          <span style={{ color: '#666666', fontSize: '14px', fontWeight: 500 }}>
            Buat Data Peminjam
          </span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 className="page-title">
            Buat Data Peminjam
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Silahkan masukkan informasi guru atau siswa baru.
          </p>
        </div>

        {/* Form Container */}
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Row 1 */}
              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">
                    Kategori <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <select
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0',
                      borderRadius: '8px', fontSize: '14px', color: formData.kategori ? '#000000' : '#666666',
                      background: '#F9FAFB', outline: 'none'
                    }}
                  >
                    <option value="" disabled>Pilih Kategori</option>
                    <option value="GURU">Guru</option>
                    <option value="SISWA">Siswa</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label className="form-label">
                    Nama Lengkap <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">
                    NIP / NIS <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="nomor_induk"
                    value={formData.nomor_induk}
                    onChange={handleChange}
                    placeholder="Masukkan NIP atau NIS"
                    required
                    className="form-input"
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label className="form-label">
                    Kelas
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="kelas"
                      value={formData.kelas}
                      onChange={handleChange}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                      placeholder="Contoh: XII RPL A"
                      disabled={formData.kategori === 'GURU'}
                      style={{
                        width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0',
                        borderRadius: '8px', fontSize: '14px', outline: 'none',
                        background: formData.kategori === 'GURU' ? '#F5F5F5' : '#FFFFFF',
                        cursor: formData.kategori === 'GURU' ? 'not-allowed' : 'text', color: '#000000',
                        fontFamily: 'inherit'
                      }}
                    />
                    {/* Combobox Suggestions Dropdown */}
                    {showDropdown && filteredKelas.length > 0 && formData.kategori !== 'GURU' && (
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
                        {filteredKelas.map((kelasItem: any) => (
                          <div
                            key={kelasItem}
                            onClick={() => {
                              setFormData({ ...formData, kelas: kelasItem });
                              setShowDropdown(false);
                            }}
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
                            {kelasItem}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Form Actions */}
            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
              <button
                type="button"
                onClick={() => router.back()}
                style={{
                  padding: '12px 24px', background: '#FFFFFF', color: '#666666', border: '1px solid #E0E0E0',
                  borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '12px 24px', background: '#2F516A', color: '#FFFFFF', border: 'none',
                  borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                {isLoading ? (
                  <>
                    <iconify-icon icon="line-md:loading-twotone-loop" width="16" />
                    Menyimpan...
                  </>
                ) : 'Simpan Data Peminjam'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
