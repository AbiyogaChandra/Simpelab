"use client";

import { useRef, useState, useCallback } from "react";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cameraMode, setCameraMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSelect(file);
  };

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      setCameraMode(true);
      // Attach stream after state update so the video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 50);
    } catch {
      // Fallback to native file picker with capture if getUserMedia is unavailable (e.g. HTTP)
      cameraRef.current?.click();
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraMode(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `foto-${Date.now()}.jpg`, { type: "image/jpeg" });
      stopCamera();
      onSelect(file);
    }, "image/jpeg", 0.92);
  }, [onSelect, stopCamera]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg"
        style={{ animation: "slideUp 0.2s ease" }}
        onClick={(e) => e.stopPropagation()}
      >

        {cameraMode ? (
          /* --- Live Camera View --- */
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                borderRadius: "10px",
                marginBottom: "12px",
                background: "#000",
                maxHeight: "320px",
                objectFit: "cover",
              }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            <button
              onClick={capturePhoto}
              style={{
                width: "100%",
                padding: "14px",
                background: "#2F516A",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontFamily: "inherit",
              }}
            >
              <iconify-icon icon="material-symbols:camera" height="22" />
              Ambil Foto
            </button>

            <button
              onClick={stopCamera}
              style={{
                width: "100%",
                padding: "10px",
                background: "#F3F4F6",
                color: "#374151",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Batal
            </button>
          </>
        ) : (
          /* --- Default Picker View --- */
          <>
            {/* Camera Box */}
            <div
              onClick={startCamera}
              className="p-6 flex flex-col items-center justify-center cursor-pointer mb-3"
              style={{
                backgroundColor: "#FBFBFA",
                border: "2px solid #2F516A",
                borderRadius: "8px",
              }}
            >
              <iconify-icon
                icon="material-symbols:camera"
                height="110"
                style={{ color: "#DBDBD3" }}
              />
              <p className="text-sm" style={{ color: "#979783" }}>
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
              onClick={handleClose}
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
          </>
        )}
      </div>
    </div>
  );
}