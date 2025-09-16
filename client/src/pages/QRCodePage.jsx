import { QrCode as QrIcon, RefreshCw, Clock, CreditCard, Calendar, Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import visitService from '../services/visitService';
import QRCode from "react-qr-code";

const QRCodePage = () => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    generateQR();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && qrData) {
      setError('QR-код истек');
    }
  }, [timeLeft, qrData]);

  const generateQR = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await visitService.generateQR();
      setQrData(data);
      setTimeLeft(data.expiresIn);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка генерации QR-кода');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await generateQR();
    setRefreshing(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMembershipTypeLabel = (type) => {
    const labels = {
      single: 'Разовое посещение',
      monthly: 'Месячный абонемент',
      yearly: 'Годовой абонемент'
    };
    return labels[type] || type;
  };

  const getStatusColor = () => {
    if (timeLeft > 60) return 'text-brown-60 bg-brown-99 border-brown-90';
    if (timeLeft > 30) return 'text-gray-70 bg-gray-97 border-gray-90';
    return 'text-brown-65 bg-brown-97 border-brown-95';
  };

  if (loading && !qrData) {
    return (
      <div className="min-h-screen bg-dark-06 p-4 pt-25 pb-30">
        <div className="max-w-md mx-auto">
          <div className="bg-dark-10 rounded-3xl shadow-2xl border border-dark-12 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-dark-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <QrIcon className="w-8 h-8 text-brown-60 animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-gray-99 mb-2">Генерация QR-кода</h1>
              <p className="text-gray-70 mb-8">Подготавливаем ваш пропуск...</p>

              <div className="space-y-4">
                <div className="h-4 bg-dark-20 rounded-full overflow-hidden">
                  <div className="h-full bg-brown-65 rounded-full animate-pulse w-2/3"></div>
                </div>
                <div className="flex justify-center">
                  <RefreshCw className="w-6 h-6 text-brown-60 animate-spin" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-06 p-4 pt-25 pb-30">
        <div className="max-w-md mx-auto">
          <div className="bg-dark-10 rounded-3xl shadow-2xl border border-dark-12 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-brown-97 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-brown-60" />
              </div>
              <h1 className="text-2xl font-bold text-gray-99 mb-2">Ошибка</h1>
              <p className="text-brown-65 mb-8">{error}</p>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full bg-brown-65 text-gray-99 py-4 rounded-2xl font-semibold hover:bg-brown-60 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {refreshing ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                    Обновление...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Попробовать снова
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-06 px-4 pt-25 pb-30">
      <div className="max-w-md mx-auto">
        <div className="bg-dark-10 rounded-3xl shadow-2xl border border-dark-12 overflow-hidden">
          {/* Header */}
          <div className="bg-brown-65 text-gray-99 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <QrIcon className="w-8 h-8 text-gray-99" />
              </div>
              <h1 className="text-2xl font-bold mb-1">Ваш QR-пропуск</h1>
              <p className="text-gray-90">Покажите код на входе</p>
            </div>
          </div>

          <div className="p-6">
            {/* QR Code Display */}
            <div className="bg-dark-06 border-4 border-dark-20 rounded-2xl p-6 mb-6 text-center">
              <QRCode
                size={256}
                level="L"   // самый лёгкий → код получается более простым
                value={qrData?.qrCode}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />

              <p className="text-xs text-gray-70 mt-4 break-all font-mono bg-dark-15 p-2 rounded">
                {qrData?.qrCode}
              </p>
            </div>

            {/* Timer */}
            <div className={`rounded-2xl border-2 p-4 mb-6 ${getStatusColor()}`}>
              <div className="flex items-center justify-center">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-semibold">
                  Действует: {formatTime(timeLeft)}
                </span>
              </div>
              {timeLeft <= 30 && (
                <div className="flex items-center justify-center mt-2 text-sm">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span>QR-код скоро истечет</span>
                </div>
              )}
            </div>

            {/* Membership Info */}
            <div className="bg-dark-12 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-99 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-brown-60" />
                Информация об абонементе
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-70">Тип:</span>
                  <span className="font-semibold text-gray-99">
                    {getMembershipTypeLabel(qrData?.membership?.type)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-70 flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Осталось посещений:
                  </span>
                  <span className="font-semibold text-brown-60">
                    {qrData?.membership?.remainingVisits ?? 'Безлимит'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-70 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Действует до:
                  </span>
                  <span className="font-semibold text-gray-99">
                    {new Date(qrData?.membership?.endDate).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing || timeLeft > 240}
              className="w-full bg-brown-65 text-gray-99 py-4 rounded-2xl font-semibold hover:bg-brown-60 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {refreshing ? (
                <div className="flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                  Обновление...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 mr-2" />
                  {timeLeft > 240 ? `Обновить через ${formatTime(timeLeft - 240)}` : 'Обновить QR-код'}
                </div>
              )}
            </button>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-dark-15 rounded-2xl">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-brown-60 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-99 mb-1">Как использовать:</h4>
                  <ul className="text-sm text-gray-70 space-y-1">
                    <li>• Покажите QR-код администратору на входе</li>
                    <li>• QR-код действует 5 минут</li>
                    <li>• После сканирования посещение будет записано автоматически</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodePage;