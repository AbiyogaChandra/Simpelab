'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginAdminPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh(); 
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err: any) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-6 font-outfit relative">
      {/* Logo - Top Left */}
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <Image
          src="/logo.webp"
          alt="Simpelab Logo"
          width={40}
          height={40}
        />
        <span className="text-[#333333] text-2xl font-bold">
          Simpelab
        </span>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-10 w-full max-w-[420px]">
        <h1 className="text-[#333333] text-[28px] font-bold text-center mb-8">
          Login Admin
        </h1>
        
        {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Username */}
          <div>
            <label className="block text-[#333333] text-sm font-medium mb-2">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username anda"
                required
                disabled={loading}
                className="w-full pl-11 pr-4 py-3.5 border border-[#F1F1F1] bg-[#F9FAFB] rounded-xl text-sm text-[#333333] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2F516A] transition-colors"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                 {/* User Icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21C20 19.3431 18.6569 18 17 18H7C5.34315 18 4 19.3431 4 21" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[#333333] text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password anda"
                required
                disabled={loading}
                className="w-full pl-11 pr-4 py-3.5 border border-[#F1F1F1] bg-[#F9FAFB] rounded-xl text-sm text-[#333333] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2F516A] transition-colors"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                 {/* Lock Icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <rect x="3" y="11" width="18" height="11" rx="2" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                   <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 bg-[#2F516A] text-white rounded-xl text-base font-semibold transition-colors mt-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#254054]'}`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
