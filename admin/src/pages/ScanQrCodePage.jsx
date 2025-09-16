import QrScannerHtml5 from "../components/QrScannerHtml5.jsx";
import { useState } from "react";

const ScanQrCodePage = () => {
  const [result, setResult] = useState(null);

  return (
    <div>
      <h1>Сканировать QR</h1>
      <QrScannerHtml5 onScanned={(data) => setResult(data)} />

      {result && (
        <div style={{ marginTop: "20px", fontWeight: "bold" }}>
          ✅ Считано: {result}
        </div>
      )}
    </div>
  );
};

export default ScanQrCodePage;
