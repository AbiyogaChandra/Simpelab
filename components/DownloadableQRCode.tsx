import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'react-qr-code';

interface DownloadableQRCodeProps {
  value: string;
  size?: number;
  displaySize?: number;
  fgColor?: string;
}

export default function DownloadableQRCode({ value, size = 1024, displaySize = 120, fgColor = "#000000" }: DownloadableQRCodeProps) {
  const svgRef = useRef<HTMLDivElement>(null);
  const [imgSrc, setImgSrc] = useState<string>('');

  useEffect(() => {
    if (svgRef.current) {
      const svg = svgRef.current.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const img = new window.Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, size, size);
            ctx.drawImage(img, 0, 0, size, size);
            setImgSrc(canvas.toDataURL('image/png'));
          }
          URL.revokeObjectURL(url);
        };
        img.src = url;
      }
    }
  }, [value, size, fgColor]);

  return (
    <>
      <div ref={svgRef} style={{ display: 'none' }}>
        <QRCode value={value} size={size} fgColor={fgColor} viewBox={`0 0 256 256`} />
      </div>
      {imgSrc ? (
        <img 
          src={imgSrc} 
          alt="QR Code" 
          style={{ width: '100%', maxWidth: displaySize, height: 'auto', display: 'block' }} 
          title="Klik kanan untuk menyimpan gambar"
        />
      ) : (
        <div style={{ width: '100%', maxWidth: displaySize, aspectRatio: '1/1', background: '#f5f5f5' }} />
      )}
    </>
  );
}
