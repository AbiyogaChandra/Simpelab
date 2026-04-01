"use client";

import { useRef } from "react";

export default function PhotoPickerModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelect(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-md bg-white rounded-t-2xl p-4 shadow-lg animate-slideUp">
        
        {/* Title */}
        <p className="text-sm text-gray-500 mb-3">
          Pop up pilih foto atau ambil foto
        </p>

        {/* Camera Box */}
        <div
          onClick={() => cameraRef.current?.click()}
          className="border rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer mb-3"
        >
          <div className="text-3xl mb-2">📷</div>
          <p className="text-sm text-gray-500">
            Ambil foto dengan kamera
          </p>
        </div>

        {/* File Button */}
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full bg-[#2f5568] text-white py-2 rounded-lg mb-2"
        >
          Ambil foto dari file
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full bg-gray-200 py-2 rounded-lg text-gray-700"
        >
          tutup
        </button>

        {/* Hidden Inputs */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraRef}
          onChange={handleChange}
          hidden
        />

        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          onChange={handleChange}
          hidden
        />
      </div>
    </div>
  );
}