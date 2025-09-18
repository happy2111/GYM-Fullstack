import React, { useEffect, useRef, useState } from "react";
import QrScannerHtml5 from "../components/QrScannerHtml5.jsx";
import { QrCode, CheckCircle } from "lucide-react";
import visitService from "../services/visitService.js";
import toast from "react-hot-toast";

const ScanQrCodePage = () => {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false)
  const [showCheck, setShowCheck] = useState(false);
  const beepSound = new Audio("/sounds/applepay.mp3"); // положите звуковой файл в public/sounds

  useEffect(() => {
    const scanQrCode = async () => {
      try {
        setIsLoading(true);
        const res = await visitService.scanQR(result);
        beepSound.play().catch(err => console.error("Error playing sound:", err));
        setShowCheck(true);
        console.log("Scan result:", res);
        toast.success("Посещение зарегистрировано");
      }catch (err) {
        console.error("Error scanning QR:", err);
      }finally {
        setIsLoading(false);
        setTimeout(() => setShowCheck(false), 1500);
        setTimeout(() => setResult(null), 3000);
      }
    }

    if (result) {
      scanQrCode();
    }

  }, [result])

  return (
    <div className="min-h-screen !pb-30 bg-dark-06 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-dark-10 rounded-3xl shadow-2xl border border-dark-12 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-dark-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-brown-60" />
          </div>
          <h1 className="text-2xl font-bold text-gray-99">Сканировать QR</h1>
          <p className="text-gray-70 text-sm mt-1">
            Наведите камеру на QR-код, чтобы считать данные
          </p>
        </div>

        {/* QR Scanner */}
        <div className="overflow-hidden relative rounded-2xl border border-dark-20 mb-6">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-dark-12">
              <div className="w-16 h-16 border-t-4 border-brown-60 border-solid rounded-full animate-spin"></div>
            </div>
          ): (
            <>
              <QrScannerHtml5 onScanned={(data) => setResult(data)} />
              {showCheck && (
                <div className={'absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2'}>
                  <div style={{ width: "100%", maxWidth: 640, margin: "0 auto", background: "#000" }} />

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
              )}
            </>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className="bg-dark-12 border border-dark-20 rounded-2xl p-4 flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-brown-60 flex-shrink-0" />
            <div className="text-gray-99 font-semibold break-all">
              ✅ Считано: {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanQrCodePage;
