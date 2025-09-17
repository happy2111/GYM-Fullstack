import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QrScannerHtml5 = ({ onScanned }) => {
  const qrRegionId = "html5qr-region";
  const html5QrCodeRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCam, setSelectedCam] = useState(null);
  const [showCheck, setShowCheck] = useState(false);

  const beepSound = useRef(new Audio("/sounds/beep.mp3")).current;

  useEffect(() => {
    let mounted = true;
    const initScanner = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const allCameras = await Html5Qrcode.getCameras();
        if (!mounted) return;

        setCameras(allCameras);
        if (allCameras.length > 0) {
          const backCam = allCameras.find(cam => cam.label.toLowerCase().includes("back"));
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
            const minEdge = Math.min(vw || 250, vh || 250);
            return { width: Math.max(150, Math.floor(minEdge * 0.7)), height: Math.max(150, Math.floor(minEdge * 0.7)) };
          }
        },
        decodedText => {
          beepSound.play();
          setShowCheck(true);
          onScanned?.(decodedText);
          setTimeout(() => setShowCheck(false), 1500);
        },
        () => {}
      )
      .catch(err => console.error("Ошибка запуска сканера:", err));

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(err => console.warn("Stop warning:", err));
      }
    };
  }, [selectedCam, onScanned, beepSound]);

  return (
    <div style={{ position: "relative" }}>
      {cameras.length > 1 && (
        <select
          className="mb-2 h-10 my-2 mx-3 w-full bg-gray-800 text-white border rounded p-2"
          value={selectedCam || ""}
          onChange={(e) => setSelectedCam(e.target.value)}
        >
          {cameras.map(cam => <option key={cam.id} value={cam.id}>{cam.label || `Камера ${cam.id}`}</option>)}
        </select>
      )}
      <div
        id={qrRegionId}
        style={{ width: "100%", maxWidth: 640, margin: "0 auto", background: "#000" }}
      />
      {showCheck && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          animation: "fadeInOut 1.5s ease",
        }}>
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
      )}
    </div>
  );
};


export default QrScannerHtml5;
