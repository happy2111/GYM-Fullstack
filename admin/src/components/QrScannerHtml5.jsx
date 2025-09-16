import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QrScannerHtml5 = ({ onScanned }) => {
  const qrRegionId = "html5qr-region";
  const html5QrCodeRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCam, setSelectedCam] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // --- Получение списка камер ---
  useEffect(() => {
    let mounted = true;

    const initScanner = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const allCameras = await Html5Qrcode.getCameras();

        if (!mounted) return;

        setCameras(allCameras);
        if (allCameras.length > 0) {
          const backCam = allCameras.find((cam) =>
            cam.label.toLowerCase().includes("back")
          );
          setSelectedCam(backCam ? backCam.id : allCameras[0].id);
        }
      } catch (err) {
        console.error("Ошибка доступа к камере:", err);
      }
    };

    initScanner();
    return () => {
      mounted = false;
    };
  }, []);

  // --- Запуск сканера ---
  useEffect(() => {
    if (!selectedCam) return;

    const html5QrCode = new Html5Qrcode(qrRegionId);
    html5QrCodeRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        setIsRunning(true);
        await html5QrCode.start(
          selectedCam,
          {
            fps: 10,
            qrbox: (vw, vh) => {
              const minEdge = Math.min(vw, vh);
              const size = Math.max(50, minEdge * 0.7);
              return { width: size, height: size };
            },
          },
          (decodedText) => {
            console.log("✅ QR decoded:", decodedText);

            // авто-пауза после первого успешного сканирования
            if (isRunning && html5QrCodeRef.current) {
              html5QrCodeRef.current
                .stop()
                .then(() => setIsRunning(false))
                .catch((err) =>
                  console.log("Ошибка при остановке (игнор):", err)
                );
            }

            onScanned?.(decodedText);
          },
          (errorMessage) => {
            // только отладка, ошибок будет много
            console.debug("QR scan error:", errorMessage);
          }
        );
      } catch (err) {
        console.error("Ошибка запуска сканера:", err);
      }
    };

    startScanner();

    return () => {
      if (isRunning && html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .then(() => setIsRunning(false))
          .catch((err) =>
            console.log("Ошибка при остановке сканера (игнор):", err)
          );
      }
    };
  }, [selectedCam, onScanned]);

  return (
    <div>
      {cameras.length > 1 && (
        <select
          className="mb-2 h-10 my-2 mx-3 w-full bg-brown-60 text-white border rounded p-2"
          value={selectedCam || ""}
          onChange={(e) => setSelectedCam(e.target.value)}
        >
          {cameras.map((cam) => (
            <option key={cam.id} value={cam.id}>
              {cam.label || `Камера ${cam.id}`}
            </option>
          ))}
        </select>
      )}
      <div id={qrRegionId} style={{ width: "100%", maxWidth: 640 }} />
    </div>
  );
};

export default QrScannerHtml5;
