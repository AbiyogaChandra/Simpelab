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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg animate-slideUp">

        {/* Camera Box */}
        <div
          onClick={() => cameraRef.current?.click()}
          className="p-6 flex flex-col items-center justify-center cursor-pointer mb-3"
          style={{
            backgroundColor: '#FBFBFA',
            border: '2px solid #2F516A',
            borderRadius: '8px'
          }}
        >
          <iconify-icon
            icon="material-symbols:camera"
            height="110"
            style={{ color: '#DBDBD3' }}
          />
          <p className="text-sm" style={{ color: '#979783' }}>
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
          Tutup
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