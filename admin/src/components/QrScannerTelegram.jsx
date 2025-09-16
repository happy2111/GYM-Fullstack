import {useEffect} from "react";


const QrScannerTelegram = () => {
  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.showScanQrPopup({
      text: "Поднесите QR код",
      // optional options...
      onResult: (result) => {
        console.log(result);
        // result.code — распознанный текст
        // api.post("/visits/scan", { qrCode: result.code }).then(...);
      }
    }, []);

  }, []);
  return (
    <div>
      Telegram
    </div>
  );
};

export default QrScannerTelegram;