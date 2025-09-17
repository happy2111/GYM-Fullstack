import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QrScannerHtml5 = ({ onScanned }) => {
  const qrRegionId = "html5qr-region";
  const html5QrCodeRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCam, setSelectedCam] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initScanner = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const allCameras = await Html5Qrcode.getCameras();
        if (!mounted) return;

        setCameras(allCameras);
        if (allCameras.length > 0) {
          const backCam = allCameras.find(cam =>
            cam.label.toLowerCase().includes("back")
          );
          setSelectedCam(backCam ? backCam.id : allCameras[0].id);
        }
      } catch (err) {
        console.error("Ошибка доступа к камере:", err);
      }
    };

    initScanner();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!selectedCam) return;

    const html5QrCode = new Html5Qrcode(qrRegionId);
    html5QrCodeRef.current = html5QrCode;

    html5QrCode
      .start(
        selectedCam,
        {
          fps: 10,
          qrbox: (vw, vh) => {
            if (vw <= 0 || vh <= 0) return { width: 250, height: 250 };
            const minEdge = Math.min(vw, vh);
            const size = Math.max(150, Math.floor(minEdge * 0.7)); // минимум 150px
            return { width: size, height: size };
          }
        },
        decodedText => {
          console.log("✅ QR decoded:", decodedText);
          onScanned?.(decodedText);
        },
        () => {} // глушим ошибки "No MultiFormat Readers..." чтобы не спамило
      )
      .catch(err => console.error("Ошибка запуска сканера:", err));

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current
          .stop()
          .catch(err => console.warn("Stop warning:", err));
      }
    };
  }, [selectedCam, onScanned]);

  return (
    <div>
      {cameras.length > 1 && (
        <select
          className="mb-2 h-10 w-full bg-brown-60 text-white border border-brown-65 rounded p-2"
          value={selectedCam || ""}
          onChange={(e) => setSelectedCam(e.target.value)}
        >
          {cameras.map(cam => (
            <option key={cam.id} value={cam.id}>
              {cam.label || `Камера ${cam.id}`}
            </option>
          ))}
        </select>
      )}
      <div
        id={qrRegionId}
        style={{
          width: "100%",
          maxWidth: 640,
          margin: "0 auto",
          background: "#000", // добавил фон, чтобы не было "черного шума"
        }}
      />
    </div>
  );
};

export default QrScannerHtml5;
