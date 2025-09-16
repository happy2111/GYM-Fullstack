import QrScannerHtml5 from "../components/QrScannerHtml5.jsx";
import { useState } from "react";
import { QrCode, CheckCircle } from "lucide-react";

const ScanQrCodePage = () => {
  const [result, setResult] = useState(null);

  return (
    <div className="min-h-screen bg-dark-06 flex items-center justify-center p-6">
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
        <div className="overflow-hidden rounded-2xl border border-dark-20 mb-6">
          <QrScannerHtml5 onScanned={(data) => setResult(data)} />
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
