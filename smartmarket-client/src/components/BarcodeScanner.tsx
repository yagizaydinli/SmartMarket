import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, type Html5QrcodeCameraScanConfig } from 'html5-qrcode';

interface Props {
  onScan: (barcode: string) => void;
}

export const BarcodeScanner = ({ onScan }: Props) => {
  const [isActive, setIsActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<{ value: string; time: number }>({ value: '', time: 0 });

  // Başarılı okumada POS cihazı bip sesi çıkartır
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz klasik bip
      oscillator.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1); // 100ms sonra sus
    } catch (e) {
      console.warn("Ses çalınamadı", e);
    }
  };

  const handleScan = (decodedText: string) => {
    const now = Date.now();
    
    // Aynı barkodu 3 saniye içinde okursa YARI YOLDA KES
    if (decodedText === lastScanRef.current.value && (now - lastScanRef.current.time < 3000)) {
      return;
    }

    // Yeni veya süresi geçmiş barkodsa kabul et
    lastScanRef.current = { value: decodedText, time: now };
    playBeep(); // Ses ver!
    onScan(decodedText); // App.tsx'e gönder
  };

  const startScanner = async () => {
    const scanner = new Html5Qrcode("reader-container");
    scannerRef.current = scanner;

    const qrConfig: Html5QrcodeCameraScanConfig = {
      fps: 15,
      qrbox: { width: 250, height: 150 },
      // @ts-ignore
      formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.CODE_128]
    };

    try {
      await scanner.start({ facingMode: "environment" }, qrConfig, handleScan, () => {});
      setIsActive(true);
    } catch (err) {
      console.error("Kamera başlatılamadı:", err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      try { await scannerRef.current.stop(); } catch (err) {}
      scannerRef.current.clear();
    }
    setIsActive(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-2">
      <button 
        onClick={() => isActive ? stopScanner() : startScanner()}
        className={`w-full py-3 rounded-xl font-bold transition-all ${
          isActive 
            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isActive ? "Kamerayı Kapat (Arka planda çalışıyor...)" : "Barkod Okuyucuyu Başlat"}
      </button>

      {/* DOM Akışını Bozmayan Görünmez Kamera Alanı */}
      <div 
        style={{ 
          position: 'fixed', 
          top: '-2000px', 
          left: '-2000px', 
          width: '300px', 
          height: '300px',
          opacity: 0,
          pointerEvents: 'none'
        }}
      >
        <div id="reader-container" style={{ width: '100%', height: '100%' }}></div>
      </div>
    </div>
  );
};