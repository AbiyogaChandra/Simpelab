'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginAdminPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: panggil API login admin
    router.push('/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(173, 216, 230, 0.3) 0%, #FFFFFF 50%, rgba(255, 182, 193, 0.3) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Outfit, sans-serif',
      }}
    >
      {/* Logo - Top Left */}
      <div
        style={{
          position: 'absolute',
          top: '32px',
          left: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Image
          src="/logo.webp"
          alt="Simpelab Logo"
          width={40}
          height={40}
        />
        <span
          style={{
            color: '#333333',
            fontSize: '24px',
            fontWeight: 700,
          }}
        >
          Simpelab
        </span>
      </div>

      {/* Login Card */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
        }}
      >
        <h1
          style={{
            color: '#333333',
            fontSize: '28px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '32px',
            margin: 0,
          }}
        >
          Login Admin
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Username */}
          <div>
            <label
              style={{
                display: 'block',
                color: '#333333',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
              }}
            >
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username anda"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: username ? '#333333' : '#9CA3AF',
                  background: '#FFFFFF',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" stroke="#666666" strokeWidth="1.5" />
                  <path d="M2 14C2 11.7909 4.68629 10 8 10C11.3137 10 14 11.7909 14 14" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              style={{
                display: 'block',
                color: '#333333',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password anda"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: password ? '#333333' : '#9CA3AF',
                  background: '#FFFFFF',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="7" width="12" height="7" rx="1" stroke="#666666" strokeWidth="1.5" />
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              background: '#2F516A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginTop: '8px',
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
