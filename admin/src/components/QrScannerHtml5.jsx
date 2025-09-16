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
        setCameras(allCameras);
        if (allCameras.length > 0) {
          // выбираем заднюю камеру если найдена
          const backCam = allCameras.find(cam =>
            cam.label.toLowerCase().includes("back")
          );
          setSelectedCam(backCam ? backCam.id : allCameras[0].id);
        }
      } catch (err) {
        console.error("Ошибка доступа к камере:", err);
      }
    };

    if (mounted) initScanner();
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
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            return { width: minEdge * 0.7, height: minEdge * 0.7 }; // динамический квадрат
          }
        },
        decodedText => {
          console.log("✅ QR decoded:", decodedText);
          alert(JSON.stringify(decodedText, null, 2))
          onScanned?.(decodedText);
        },
        errorMessage => {
          // будет спамить часто — лучше в debug
          console.debug("QR scan error:", errorMessage);
          // alert(JSON.stringify(errorMessage, null, 2))
        }
      )
      .catch(err => console.error("Ошибка запуска сканера:", err));

    return () => {
      html5QrCode.stop().catch(() => {});
    };
  }, [selectedCam, onScanned]);

  return (
    <div>
      {cameras.length > 1 && (
        <select
          className="mb-2 border rounded p-2"
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
      <div id={qrRegionId} style={{ width: "100%", maxWidth: 640 }} />
    </div>
  );
};

export default QrScannerHtml5;
