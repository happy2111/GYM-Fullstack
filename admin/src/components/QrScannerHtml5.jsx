import React, { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QrScannerHtml5 = ({ onScanned }) => {
  const qrRegionId = "html5qr-region";
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      try {
        // проверяем доступ к камере
        await navigator.mediaDevices.getUserMedia({ video: true });

        const html5QrCode = new Html5Qrcode(qrRegionId);
        html5QrCodeRef.current = html5QrCode;

        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || !cameras.length) {
          console.error("Нет доступных камер");
          return;
        }

        await html5QrCode.start(
          cameras[0].id,
          { fps: 10, qrbox: 250 },
          decodedText => {
            console.log("QR decoded:", decodedText);
            html5QrCode.pause();
            if (onScanned) onScanned(decodedText);
            setTimeout(() => html5QrCode.resume(), 1500);
          }
        );
      } catch (err) {
        console.error("QR scanner start error:", err);
      }
    };

    if (mounted) startScanner();

    return () => {
      mounted = false;
      const instance = html5QrCodeRef.current;
      if (instance) {
        const state = instance.getState?.();
        if (state === 2 || state === 3) {
          instance.stop().catch(() => {});
        }
      }
    };
  }, [onScanned]);

  return <div id={qrRegionId} style={{ width: "100%", maxWidth: 640 }} />;
};

export default QrScannerHtml5;
