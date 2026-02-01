'use client';

import moment from 'moment';

export default function StrukPage() {
  // Data contoh - nanti bisa diambil dari props atau state
  const receiptData = {
    nomorResi: '21012026-001',
    kategori: 'Siswa',
    identitas: 'Adinda F - XII RPL B - 246151837063',
    barang: '2 Flashdisk, 1 Raspberry',
    catatanBarang: '-',
    tanggalPinjam: '21 Januari 2026',
    tanggalKembali: '21 Januari 2026',
  };

  const currentDate = moment().format('DD MMMM YYYY');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(173, 216, 230, 0.3) 0%, rgba(255, 182, 193, 0.3) 100%)',
      padding: '40px 20px',
      fontFamily: 'Outfit, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="Simpelab Logo" style={{ width: '40px', height: '40px' }} />
            <span style={{
              color: '#000000',
              fontSize: '24px',
              fontWeight: 700
            }}>
              Simpelab
            </span>
          </div>

          {/* Date */}
          <div style={{
            color: '#666666',
            fontSize: '16px',
            fontWeight: 400
          }}>
            {currentDate}
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          textAlign: 'center',
          color: '#000000',
          fontSize: '32px',
          fontWeight: 700,
          marginBottom: '40px'
        }}>
          Struk Pengajuan
        </h1>

        {/* Receipt Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: 0,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Nomor Resi Section */}
          <div style={{
            background: '#F5F5F5',
            padding: '20px 24px',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              color: '#000000',
              fontSize: '16px',
              fontWeight: 400
            }}>
              Nomor Resi
            </span>
            <span style={{
              color: '#000000',
              fontSize: '16px',
              fontWeight: 700
            }}>
              {receiptData.nomorResi}
            </span>
          </div>

          {/* Details Section */}
          <div style={{
            padding: '24px'
          }}>
            {/* Kategori */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <span style={{
                color: '#666666',
                fontSize: '16px',
                fontWeight: 400
              }}>
                Kategori
              </span>
              <span style={{
                color: '#000000',
                fontSize: '16px',
                fontWeight: 400
              }}>
                {receiptData.kategori}
              </span>
            </div>

            {/* Identitas */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <span style={{
                color: '#666666',
                fontSize: '16px',
                fontWeight: 400
              }}>
                Identitas
              </span>
              <span style={{
                color: '#000000',
                fontSize: '16px',
                fontWeight: 400,
                textAlign: 'right',
                maxWidth: '60%'
              }}>
                {receiptData.identitas}
              </span>
            </div>

            {/* Barang */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <span style={{
                color: '#666666',
                fontSize: '16px',
                fontWeight: 400
              }}>
                Barang
              </span>
              <span style={{
                color: '#000000',
                fontSize: '16px',
                fontWeight: 400,
                textAlign: 'right',
                maxWidth: '60%'
              }}>
                {receiptData.barang}
              </span>
            </div>

            {/* Catatan Barang */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <span style={{
                color: '#666666',
                fontSize: '16px',
                fontWeight: 400
              }}>
                Catatan Barang
              </span>
              <span style={{
                color: '#000000',
                fontSize: '16px',
                fontWeight: 400
              }}>
                {receiptData.catatanBarang}
              </span>
            </div>

            {/* Tanggal Pinjam */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <span style={{
                color: '#666666',
                fontSize: '16px',
                fontWeight: 400
              }}>
                Tanggal Pinjam
              </span>
              <span style={{
                color: '#000000',
                fontSize: '16px',
                fontWeight: 400
              }}>
                {receiptData.tanggalPinjam}
              </span>
            </div>

            {/* Tanggal Kembali */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{
                color: '#666666',
                fontSize: '16px',
                fontWeight: 400
              }}>
                Tanggal Kembali
              </span>
              <span style={{
                color: '#000000',
                fontSize: '16px',
                fontWeight: 400
              }}>
                {receiptData.tanggalKembali}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
