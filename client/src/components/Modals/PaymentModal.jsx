import React, { useEffect, useState } from "react";
import api from "../../http/index.js";
import authStore from "../../store/authStore.js";

const PaymentModal = ({ isOpen, onClose, tariff, onPaymentSubmit }) => {
  const [selectedMethod, setSelectedMethod] = useState("cash");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = authStore;

  const paymentMethods = [
    { id: "cash", name: "Наличные", icon: "💵" },
    { id: "payme", name: "Payme", icon: "💳" },
    { id: "click", name: "Click", icon: "📱" },
    { id: "uzcard", name: "UzCard", icon: "🏦" },
    { id: "humo", name: "Humo", icon: "💎" }
  ];

  const handlePayment = async () => {
    if (!tariff) return;

    setIsLoading(true);
    try {
      const paymentData = {
        userId: user.id, // Здесь должен быть реальный userId
        amount: parseInt(tariff.price, 10),
        method: selectedMethod,
        tariffId: tariff.id
      };

      console.log('Payment data:', paymentData);

      await onPaymentSubmit(paymentData);
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !tariff) return null;

  return (
    <div className="fixed inset-0 bg-dark-06/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-15 rounded-2xl max-w-md w-full p-6 relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-70 hover:text-gray-99 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-99 mb-2">Оплата тарифа</h2>
          <p className="text-brown-70 font-medium">{tariff.name}</p>
          <p className="text-3xl font-bold text-gray-99 mt-2">
            {parseInt(tariff.price, 10).toLocaleString()} so'm
          </p>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-99 mb-4">Способ оплаты</h3>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedMethod === method.id
                    ? "bg-brown-60 border-brown-70"
                    : "bg-dark-20 hover:bg-dark-25 border-dark-30"
                } border`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="sr-only"
                />
                <span className="text-2xl mr-3">{method.icon}</span>
                <span className={`font-medium ${
                  selectedMethod === method.id ? "text-gray-99" : "text-gray-80"
                }`}>
                  {method.name}
                </span>
                {selectedMethod === method.id && (
                  <div className="ml-auto">
                    <svg className="w-5 h-5 text-gray-99" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-dark-25 text-gray-80 rounded-lg font-medium hover:bg-dark-30 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handlePayment}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-brown-60 text-gray-99 rounded-lg font-medium hover:bg-brown-65 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-99" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Обработка...
              </>
            ) : (
              "Оплатить"
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};


export default PaymentModal;