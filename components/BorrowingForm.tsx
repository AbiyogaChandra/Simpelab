'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'
import moment from 'moment';

interface Product {
  id: number;
  nama: string;
  stok: number;
}

interface SelectedProduct extends Product {
  quantity: number;
}

interface Peminjam {
  id: string;
  nama: string;
  nomor_induk: string;
  kelas?: string;
}

export default function BorrowingForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    kategori: 'siswa', // Default select
    identitas: '',
    barang: '', // Used for hidden field or legacy
    catatanBarang: '',
    tanggalPinjam: moment().format('YYYY-MM-DD'),
    tanggalKembali: moment().format('YYYY-MM-DD'),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [peminjamList, setPeminjamList] = useState<Peminjam[]>([]);
  const [selectedPeminjam, setSelectedPeminjam] = useState<Peminjam | null>(null);
  const [showPeminjamDropdown, setShowPeminjamDropdown] = useState(false);

  // Fetch Products
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/produk');
      if (res.ok) {
        const data = await res.json();

        // Group products by name
        const groupedMap = new Map<string, Product>();

        data.forEach((p: any) => {
          const existing = groupedMap.get(p.nama);
          const stock = p.stok ?? p.kuantitas;

          if (existing) {
            // Accumulate stock
            existing.stok += stock;
          } else {
            groupedMap.set(p.nama, {
              id: p.id, // Use the first ID encountered for this name
              nama: p.nama,
              stok: stock
            });
          }
        });

        const availableProducts = Array.from(groupedMap.values()).filter(p => p.stok > 0);
        setProducts(availableProducts);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  // Fetch Peminjam
  const fetchPeminjam = async (query: string, kategori: string) => {
    if (!query) {
      setPeminjamList([]);
      return;
    }
    try {
      const res = await fetch(`/api/peminjam?query=${query}&kategori=${kategori}`);
      if (res.ok) {
        const data = await res.json();
        setPeminjamList(data);
      }
    } catch (error) {
      console.error("Failed to fetch peminjam", error);
    }
  };

  // Filter produk berdasarkan search query
  const filteredProducts = products.filter(product =>
    product.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = (product: Product) => {
    if (!selectedProducts.find(p => p.nama === product.nama)) {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setSelectedProducts(selectedProducts.map(p =>
      p.id === productId ? { ...p, quantity: newQuantity } : p
    ));
  };

  const handleConfirm = () => {
    // Legacy support if needed, but we use selectedProducts directly now
    setIsModalOpen(false);
    setSearchQuery('');
  };

  const handleBarangClick = () => {
    if (products.length === 0) fetchProducts();
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi form
    if (!formData.kategori || !selectedPeminjam || selectedProducts.length === 0) {
      alert('Mohon lengkapi identitas valid dan pilih minimal satu barang');
      return;
    }

    try {
      const payload = {
        id_peminjam: selectedPeminjam.id,
        items: selectedProducts.map(p => ({
          id_produk: p.id,
          kuantitas: p.quantity
        })),
        catatan: formData.catatanBarang || 'Peminjaman Lab', // Use clarification as reason
        tanggal_pinjam: new Date(formData.tanggalPinjam).toISOString(),
        tanggal_kembali: formData.tanggalKembali ? new Date(formData.tanggalKembali).toISOString() : '',
      };

      const res = await fetch('/api/pengajuan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit');
      }

      const data = await res.json();

      // Format dates for receipt query params (display format)
      const tanggalPinjamFormatted = moment(formData.tanggalPinjam).format('DD MMMM YYYY');
      const tanggalKembaliFormatted = formData.tanggalKembali
        ? moment(formData.tanggalKembali).format('DD MMMM YYYY')
        : '-';

      const kategoriFormatted = formData.kategori === 'guru' ? 'Guru' : 'Siswa';

      const barangFormatted = selectedProducts.map(p => `${p.quantity} ${p.nama}`).join(', ');

      const params = new URLSearchParams({
        nomorResi: data.kode_resi || 'PENDING',
        kategori: kategoriFormatted,
        identitas: `${selectedPeminjam.nama} - ${selectedPeminjam.nomor_induk}`,
        barang: barangFormatted,
        catatanBarang: formData.catatanBarang || '-',
        tanggalPinjam: tanggalPinjamFormatted,
        tanggalKembali: tanggalKembaliFormatted,
      });

      router.push(`/struk?${params.toString()}`);

    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;

    if (name === 'tanggalPinjam') {
      setFormData(prev => ({
        ...prev,
        tanggalPinjam: value,
        tanggalKembali: value // Auto-sync tanggal kembali
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    if (name === 'identitas') {
      fetchPeminjam(value, formData.kategori);
      setShowPeminjamDropdown(true);
      setSelectedPeminjam(null); // Reset selection on typing
    }
  };

  const handlePeminjamSelect = (peminjam: Peminjam) => {
    setFormData({ ...formData, identitas: peminjam.nama });
    setSelectedPeminjam(peminjam);
    setShowPeminjamDropdown(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Left Panel - Dark Teal */}
      <div style={{
        width: '50%',
        height: '100vh',
        background: '#425B67',
        position: 'sticky',
        top: 0,
        overflow: 'hidden'
      }}>
        {/* Illustration Image - Full Background */}
        <Image
          src="/illustration.webp"
          alt="Lab Illustration"
          fill
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            objectFit: 'cover',
            objectPosition: 'bottom',
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
              gap: '6px',
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '4px 8px'
            }}>
              <Image src="/logo.webp" alt="Simpelab Logo" width={56} height={56} />
              <span style={{
                color: '#2F516A',
                fontSize: '26px',
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
        {/* Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#333333',
            marginBottom: '8px',
            margin: 0,
            fontFamily: 'Outfit, sans-serif'
          }}>
            Ajukan Peminjaman
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#666666',
            margin: 0,
            lineHeight: '1.5',
            fontFamily: 'Outfit, sans-serif'
          }}>
            Ajukan peminjaman alat lab dengan cepat dan terintegrasi dalam satu sistem
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '12px',
            color: '#2F516A',
            backgroundColor: 'rgba(108, 174, 222, 0.3)',
            border: '1px solid #4A7E91',
            borderRadius: '4px',
            padding: '12px 10px',
            margin: 0,
            lineHeight: '1.5',
            fontFamily: 'Outfit, sans-serif'
          }}>
            <iconify-icon
              icon="fluent:warning-24-filled"
              height="20"
            />
            Peminjaman barang membutuhkan jaminan berupa kartu pelajar, untuk Peminjam Guru diharapkan datang ke UPJ sesuai identitas
          </div>
        </div>

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
              <label className="block mb-2.5" style={{ color: '#333333', fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'block' }}>
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
              <label className="block mb-2.5" style={{ color: '#333333', fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'block' }}>
                Identitas
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="identitas"
                  value={formData.identitas}
                  onChange={handleChange}
                  onFocus={() => {
                    if (formData.identitas) fetchPeminjam(formData.identitas, formData.kategori);
                    setShowPeminjamDropdown(true);
                  }}
                  onBlur={() => setTimeout(() => setShowPeminjamDropdown(false), 200)} // Delay to allow click
                  placeholder="Ketik identitas anda"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                  style={{
                    fontSize: '14px',
                    color: formData.identitas ? '#000000' : '#A7A7A7',
                    height: '48px',
                    paddingLeft: '40px',
                    borderColor: '#E0E0E0',
                    borderRadius: '8px',
                    background: '#FFFFFF'
                  }}
                  autoComplete="off"
                />
                <div className="flex items-center absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <iconify-icon
                    icon="majesticons:user"
                    height="20"
                    style={{ color: '#A7A7A7' }}
                  />
                </div>

                {/* Dropdown */}
                {showPeminjamDropdown && peminjamList.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    marginTop: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 10,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}>
                    {peminjamList.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handlePeminjamSelect(p)}
                        style={{
                          padding: '10px 16px',
                          fontSize: '14px',
                          color: '#333333',
                          cursor: 'pointer',
                          borderBottom: '1px solid #F5F5F5'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                      >
                        <div style={{ fontWeight: 500 }}>{p.nama}</div>
                        <div style={{ fontSize: '12px', color: '#666666' }}>{formData.kategori === 'guru' ? 'NIP ' : p.kelas + ' - '} {p.nomor_induk}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Barang */}
          <div>
            <label className="block mb-2.5" style={{ color: '#333333', fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'block' }}>
              Barang
            </label>
            {/* Selected Products List */}
            {selectedProducts.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
                {selectedProducts.map((product, index) => (
                  <div key={product.id} style={{
                    background: '#FFFFFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '12px',
                    padding: '16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#333333' }}>
                        #{String(index + 1).padStart(2, '0')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product.id)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                      >
                        <iconify-icon
                          icon="fluent:delete-12-regular"
                          height="24"
                          style={{ color: '#E37158' }}
                        />
                      </button>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#999999', marginBottom: '6px' }}>
                        Nama Produk
                      </label>
                      <div style={{
                        background: '#F5F5F5',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        fontSize: '14px',
                        color: '#333333',
                        border: '1px solid #EEEEEE'
                      }}>
                        {product.nama}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#999999', marginBottom: '6px' }}>
                        Kuantitas
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                        style={{
                          width: '100%',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          fontSize: '14px',
                          color: '#333333',
                          border: '1px solid #E0E0E0',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleBarangClick}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                background: '#FFFFFF',
                color: '#2F516A',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                border: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <iconify-icon
                icon="ic:round-plus"
                height="24"
              />
              <span>Tambahkan Barang</span>
            </button>
          </div>

          {/* Row 3: Catatan Barang */}
          <div>
            <label className="block mb-2.5" style={{ color: '#333333', fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'block' }}>
              Keperluan Barang
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
              <label className="block mb-2.5" style={{ color: '#333333', fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'block' }}>
                Tanggal Pinjam
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="tanggalPinjam"
                  value={formData.tanggalPinjam}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                  style={{
                    fontSize: '14px',
                    color: formData.tanggalPinjam ? '#000000' : '#AAAAAA',
                    height: '48px',
                    borderColor: '#E0E0E0',
                    borderRadius: '8px',
                    background: '#FFFFFF'
                  }}
                />
              </div>
            </div>

            {/* Tanggal Kembali */}
            <div style={{ flex: 1 }}>
              <label className="block mb-2.5" style={{ color: '#333333', fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'block' }}>
                Tanggal Kembali
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="tanggalKembali"
                  value={formData.tanggalKembali}
                  onChange={handleChange}
                  min={formData.tanggalPinjam} // Prevent dates before pinjam
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                  style={{
                    fontSize: '14px',
                    color: formData.tanggalKembali ? '#000000' : '#AAAAAA',
                    height: '48px',
                    borderColor: '#E0E0E0',
                    borderRadius: '8px',
                    background: '#FFFFFF'
                  }}
                />
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
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='placeholder-[#9CA3AF]'
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'Outfit, sans-serif',
                }}
              />
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#2F516A'
              }}>
                <iconify-icon
                  icon="iconamoon:search"
                  height="24"
                />
              </div>
            </div>

            {/* Table */}
            <div style={{ marginBottom: '20px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#E3F2FD' }}>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#000000',
                      fontFamily: 'Outfit, sans-serif'
                    }}>
                      No
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#000000',
                      fontFamily: 'Outfit, sans-serif'
                    }}>
                      Nama Produk
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#000000',
                      fontFamily: 'Outfit, sans-serif'
                    }}>
                      Stok
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#000000',
                      fontFamily: 'Outfit, sans-serif'
                    }}>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #E0E0E0' }}>
                      <td style={{
                        padding: '12px',
                        fontSize: '14px',
                        color: '#000000',
                        fontFamily: 'Outfit, sans-serif'
                      }}>
                        {index + 1}
                      </td>
                      <td style={{
                        padding: '12px',
                        fontSize: '16px',
                        color: '#2F516A',
                        fontWeight: 400,
                        lineHeight: '100%',
                        fontFamily: 'Outfit, sans-serif'
                      }}>
                        {product.nama}
                      </td>
                      <td style={{
                        padding: '12px',
                        fontSize: '14px',
                        color: '#000000',
                        fontFamily: 'Outfit, sans-serif'
                      }}>
                        {product.stok}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          type="button"
                          onClick={() => handleAddProduct(product)}
                          disabled={selectedProducts.some(p => p.id === product.id)}
                          style={{
                            padding: '6px 16px',
                            border: '1px solid #2F516A',
                            borderRadius: '6px',
                            backgroundColor: selectedProducts.some(p => p.id === product.id) ? '#E0E0E0' : '#FFFFFF',
                            color: selectedProducts.some(p => p.id === product.id) ? '#999999' : '#2F516A',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: selectedProducts.some(p => p.id === product.id) ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            fontFamily: 'Outfit, sans-serif',
                          }}
                          onMouseEnter={(e) => {
                            if (!selectedProducts.some(p => p.id === product.id)) {
                              e.currentTarget.style.backgroundColor = '#F5F5F5';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!selectedProducts.some(p => p.id === product.id)) {
                              e.currentTarget.style.backgroundColor = '#FFFFFF';
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
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button
                type="button"
                onClick={handleConfirm}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#2F5F7C',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  fontFamily: 'Outfit, sans-serif',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#254A63'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2F5F7C'}
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
