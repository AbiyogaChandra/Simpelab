'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import moment from 'moment';
import Image from 'next/image';

function StrukContent() {
  const searchParams = useSearchParams();

  // Ambil data dari query params atau gunakan data default
  const receiptData = {
    nomorResi: searchParams.get('nomorResi') || '21012026-001',
    kategori: searchParams.get('kategori') || 'Siswa',
    identitas: searchParams.get('identitas') || 'Adinda F - XII RPL B - 246151837063',
    barang: searchParams.get('barang') || '2 Flashdisk, 1 Raspberry',
    catatanBarang: searchParams.get('catatanBarang') || '-',
    tanggalPinjam: searchParams.get('tanggalPinjam') || moment().format('DD MMMM YYYY'),
    tanggalKembali: searchParams.get('tanggalKembali') || moment().format('DD MMMM YYYY'),
  };

  const currentDate = moment().format('DD MMMM YYYY');

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      padding: '40px 20px',
      fontFamily: 'Outfit, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header - Logo Only */}
        <div style={{
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Image src="/logo.webp" alt="Simpelab Logo" width={40} height={40} />
            <span style={{
              color: '#000000',
              fontSize: '24px',
              fontWeight: 700,
              fontFamily: 'Outfit, sans-serif'
            }}>
              Simpelab
            </span>
          </div>
        </div>

        {/* Receipt Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          {/* Title with Date */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '24px',
            paddingBottom: '0'
          }}>
            <h1 style={{
              color: '#000000',
              fontSize: '28px',
              fontWeight: 700,
              margin: 0,
              fontFamily: 'Outfit, sans-serif'
            }}>
              Struk Pengajuan
            </h1>
            <div style={{
              color: '#666666',
              fontSize: '14px',
              fontWeight: 400,
              fontFamily: 'Outfit, sans-serif'
            }}>
              {currentDate}
            </div>
          </div>

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
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '24px'
          }}>
            <iconify-icon
              icon="fluent:warning-24-filled"
              height="20"
            />
            Peminjaman barang membutuhkan jaminan berupa kartu pelajar, untuk Peminjam Guru diharapkan datang ke UPJ sesuai identitas
          </div>

          {/* Nomor Resi Section - Nested Box */}
          <div style={{
            background: '#F5F5F5',
            padding: '16px 20px',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <span style={{
              color: '#000000',
              fontSize: '15px',
              fontWeight: 500,
              fontFamily: 'Outfit, sans-serif'
            }}>
              Nomor Resi
            </span>
            <span style={{
              color: '#000000',
              fontSize: '15px',
              fontWeight: 700,
              fontFamily: 'Outfit, sans-serif'
            }}>
              {receiptData.nomorResi}
            </span>
          </div>

          {/* Details Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Kategori */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <span style={{
                color: '#666666',
                fontSize: '15px',
                fontWeight: 400,
                fontFamily: 'Outfit, sans-serif'
              }}>
                Kategori
              </span>
              <span style={{
                color: '#000000',
                fontSize: '15px',
                fontWeight: 400,
                fontFamily: 'Outfit, sans-serif',
                textAlign: 'right',
                flex: 1,
                marginLeft: '16px'
              }}>
                {receiptData.kategori}
              </span>
            </div>

            {/* Identitas */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <span style={{
                color: '#666666',
                fontSize: '15px',
                fontWeight: 400,
                fontFamily: 'Outfit, sans-serif'
              }}>
                Identitas
              </span>
              <span style={{
                color: '#000000',
                fontSize: '15px',
                fontWeight: 400,
                fontFamily: 'Outfit, sans-serif',
                textAlign: 'right',
                flex: 1,
                marginLeft: '16px',
                maxWidth: '65%'
              }}>
                {receiptData.identitas}
              </span>
            </div>

            {/* Barang */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <span style={{
                color: '#666666',
                fontSize: '15px',
                fontWeight: 400,
                fontFamily: 'Outfit, sans-serif'
              }}>
                Barang
              </span>
              <span style={{
                color: '#000000',
                fontSize: '15px',
                fontWeight: 400,
                fontFamily: 'Outfit, sans-serif',
                textAlign: 'right',
                flex: 1,
                marginLeft: '16px',
                maxWidth: '65%'
              }}>
                {receiptData.barang}
              </span>
            </div>

            {/* Catatan Barang */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <span style={{
                color: '#666666',
                fontSize: '15px',
                fontWeight: 400,
                fontFamily: 'Outfit, sans-serif'
              }}>
                Catatan Barang
              </span>
              <span style={{
                color: '#000000',
                fontSize: '15px',
                fontWeight: 400,
                fontFamily: 'Outfit, sans-serif',
                textAlign: 'right',
                flex: 1,
                marginLeft: '16px'
              }}>
                {receiptData.catatanBarang}
              </span>
            </div>

            {/* Tanggal Pinjam */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <span style={{
                color: '#666666',
                fontSize: '15px',
                fontWeight: 400,
                fontFamily: 'Outfit, sans-serif'
              }}>
                Tanggal Pinjam
              </span>
              <span style={{
                color: '#000000',
                fontSize: '15px',
                fontWeight: 400,
                fontFamily: 'Outfit, sans-serif',
                textAlign: 'right',
                flex: 1,
                marginLeft: '16px'
              }}>
                {receiptData.tanggalPinjam}
              </span>
            </div>

            {/* Tanggal Kembali */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <span style={{
                color: '#666666',
                fontSize: '15px',
                fontWeight: 400,
                fontFamily: 'Outfit, sans-serif'
              }}>
                Tanggal Kembali
              </span>
              <span style={{
                color: '#000000',
                fontSize: '15px',
                fontWeight: 400,
                fontFamily: 'Outfit, sans-serif',
                textAlign: 'right',
                flex: 1,
                marginLeft: '16px'
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

export default function StrukPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <div>Loading...</div>
      </div>
    }>
      <StrukContent />
    </Suspense>
  );
}
