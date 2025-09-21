import React, { useState, useEffect } from 'react';
import api from '../../http/index.js';
import PaymentModal from '../../components/Modals/PaymentModal';
import authStore from "../../store/authStore.js";
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import PricingPackagesSkeletons from '../../components/Skeletons/PricingPackagesSkeleton.jsx';
import {useTranslation} from "react-i18next";



const PricingPackages = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [monthlyTariffs, setMonthlyTariffs] = useState([]);
  const [yearlyTariffs, setYearlyTariffs] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState(null);
  const { isAuthenticated } = authStore;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const {t} = useTranslation();



  const getAllTariffs = async ({ page = 1, limit = 20, sortBy = "created_at", sortOrder = "desc" } = {}) => {
    try {
      setLoading(true);
      const res = await api.get("/tariffs/all", {
        params: { page, limit, sortBy, sortOrder },
      });

      const monthly = [];
      const yearly = [];

      res.data.data.forEach((tariff) => {
        if (tariff.code.startsWith("fit30")) {
          monthly.push(tariff);
        } else if (tariff.code.startsWith("fit360")) {
          yearly.push(tariff);
        }
      });

      setMonthlyTariffs(monthly);
      setYearlyTariffs(yearly);
    } catch (e) {
      console.log(e);
    }finally {
      setTimeout(
        () => {
          setLoading(false);
        }, 400
      )
    }
  };



  useEffect(() => {
    getAllTariffs();
  }, []);


  if (loading) {
    return <PricingPackagesSkeletons />;
  }

  const getPeriodText = () => {
    return isYearly
      ? t("pricing.period.yearly")
      : t("pricing.period.monthly");
  };

  const handleRegisterClick = (tariff) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setSelectedTariff(tariff);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      const response = await api.post("/payment/create-payment", paymentData);
      console.log('Payment created:', response.data);

      toast.success("Payment successful: " + response.data.message);
      // alert(response.data.message);

      return response.data;
    } catch (error) {
      console.error('Payment creation failed:', error);
      alert("Ошибка при создании платежа. Попробуйте еще раз.");
      throw error;
    }
  };

  // Выбираем активные тарифы
  const activeTariffs = isYearly ? yearlyTariffs : monthlyTariffs;

  return (
    <>
      <div className="min-h-screen bg-dark-06 text-gray-99 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            {/* Subtitle */}
            <p className="text-brown-70 text-sm font-medium mb-4 tracking-wider uppercase">
              {t("pricing.header.subtitle")}
            </p>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-8">
              {t("pricing.header.title")}
            </h1>

            {/* Toggle Buttons */}
            <div className="inline-flex bg-dark-15 rounded-full p-1 mb-8">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  !isYearly
                    ? "bg-gray-99 text-dark-12"
                    : "text-gray-80 hover:text-gray-99"
                }`}
              >
                {t("pricing.toggle.monthly")}
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isYearly
                    ? "bg-gray-99 text-dark-12"
                    : "text-gray-80 hover:text-gray-99"
                }`}
              >
                {t("pricing.toggle.yearly")}
              </button>
            </div>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {activeTariffs.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                  pkg.is_best_offer
                    ? "bg-brown-60 transform lg:scale-110 lg:-mt-4"
                    : "bg-dark-15 hover:bg-dark-20"
                }`}
              >
                {/* Best Offer Badge */}
                {pkg.is_best_offer && (
                  <div className="absolute -top-3 -right-3 bg-dark-12 text-gray-99 px-3 py-1 rounded-full text-xs font-medium transform rotate-12">
                    {t("pricing.badge.best_offer")}
                  </div>
                )}

                {/* Package Name */}
                <h3
                  className={`text-lg font-medium mb-6 ${
                    pkg.is_best_offer ? "text-gray-99" : "text-brown-70"
                  }`}
                >
                  {pkg.name}
                </h3>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl md:text-5xl font-bold">
                      {parseInt(pkg.price, 10).toLocaleString()} so'm
                    </span>
                  </div>
                  <p
                    className={`text-sm mt-1 ${
                      pkg.is_best_offer ? "text-gray-90" : "text-gray-70"
                    }`}
                  >
                    {getPeriodText()}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {pkg.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-center space-x-3"
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          pkg.is_best_offer ? "bg-gray-99" : "bg-brown-60"
                        }`}
                      >
                        <svg
                          className={`w-3 h-3 ${
                            pkg.is_best_offer ? "text-brown-60" : "text-gray-99"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span
                        className={`text-sm ${
                          pkg.is_best_offer ? "text-gray-99" : "text-gray-80"
                        }`}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Register Button */}
                <button
                  onClick={() => handleRegisterClick(pkg)}
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                    pkg.is_best_offer
                      ? "bg-dark-12 text-gray-99 hover:bg-dark-20"
                      : "bg-brown-60 text-gray-99 hover:bg-brown-65"
                  }`}
                >
                  {t('pricing.button.buy_now')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        tariff={selectedTariff}
        onPaymentSubmit={handlePaymentSubmit}
      />
    </>
  );
};

export default PricingPackages;