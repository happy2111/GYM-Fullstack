import React, { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import api from "../http/index.js";

const QrScannerZxing = ({ onScanned }) => {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    const start = async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        const deviceId = devices.length ? devices[0].deviceId : undefined;

        codeReader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
          if (result) {
            console.log("ZXing result:", result.getText());
            codeReader.reset(); // остановить
            handleDecoded(result.getText());
          }
        });
      } catch (e) {
        console.error("ZXing error:", e);
      }
    };

    start();

    return () => {
      try {
        codeReader.reset();
      } catch (e) {}
    };
  }, []);

  const handleDecoded = async (text) => {
    try {
      const res = await api.post("/visits/scan", { qrCode: text });
      onScanned && onScanned(res.data);
      // можно перезапустить через таймаут
      setTimeout(() => codeReaderRef.current?.decodeFromVideoDevice(undefined, videoRef.current, () => {}), 1500);
    } catch (err) {
      console.error(err);
      setTimeout(() => codeReaderRef.current?.decodeFromVideoDevice(undefined, videoRef.current, () => {}), 1500);
    }
  };

  return (
    <div>
      <video ref={videoRef} style={{ width: "100%", maxWidth: 640 }} />
    </div>
  );
};

export default QrScannerZxing;
