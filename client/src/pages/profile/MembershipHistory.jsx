import React, { useState, useEffect } from 'react';
import { Calendar, Package, Clock, CheckCircle, XCircle, AlertCircle, Star, RefreshCw, Target, CreditCard } from 'lucide-react';
import authStore from "../../store/authStore.js";
import api from "../../http/index.js";
import toast from "react-hot-toast";
import membershipStore from "../../store/membershipStore.js";
import {observer} from "mobx-react-lite";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";

const MembershipHistory = observer(() => {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [tariffDetails, setTariffDetails] = useState({});
  const [paymentDetails, setPaymentDetails] = useState({});
  const { user } = authStore;
  const { memberships, isLoading } = membershipStore;

  useEffect(() => {
    if (memberships.length > 0) {
      // fetchTariffDetails();
      // fetchPaymentDetails();
    }
  }, [memberships]);

  const fetchTariffDetails = async () => {
    try {
      const tariffIds = [...new Set(memberships.map(m => m.tariff_id))];
      const tariffPromises = tariffIds.map(id =>
        api.get(`/tariffs/${id}`).catch(err => ({ data: null, tariffId: id }))
      );

      const tariffResponses = await Promise.all(tariffPromises);
      const tariffMap = {};

      tariffResponses.forEach((response, index) => {
        if (response.data) {
          tariffMap[tariffIds[index]] = response.data;
        } else {
          // Fallback data if tariff not found
          tariffMap[tariffIds[index]] = {
            name: 'Unknown Tariff',
            price: '0',
            features: ['Basic gym access']
          };
        }
      });

      setTariffDetails(tariffMap);
    } catch (error) {
      console.error('Failed to fetch tariff details:', error);
    }
  };

  const fetchPaymentDetails = async () => {
    try {
      const paymentIds = [...new Set(memberships.map(m => m.payment_id))];
      const paymentPromises = paymentIds.map(id =>
        api.get(`/payments/${id}`).catch(err => ({ data: null, paymentId: id }))
      );

      const paymentResponses = await Promise.all(paymentPromises);
      const paymentMap = {};

      paymentResponses.forEach((response, index) => {
        if (response.data) {
          paymentMap[paymentIds[index]] = response.data;
        } else {
          // Fallback data if payment not found
          paymentMap[paymentIds[index]] = {
            method: 'unknown',
            amount: '0',
            status: 'completed'
          };
        }
      });

      setPaymentDetails(paymentMap);
    } catch (error) {
      console.error('Failed to fetch payment details:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'expired':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return {
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          color: 'rgb(34, 197, 94)',
          borderColor: 'rgba(34, 197, 94, 0.2)'
        };
      case 'expired':
        return {
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          color: 'rgb(249, 115, 22)',
          borderColor: 'rgba(249, 115, 22, 0.2)'
        };
      case 'cancelled':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: 'rgb(239, 68, 68)',
          borderColor: 'rgba(239, 68, 68, 0.2)'
        };
      default:
        return {
          backgroundColor: 'var(--color-dark-25)',
          color: 'var(--color-gray-70)',
          borderColor: 'var(--color-dark-30)'
        };
    }
  };

  const getPaymentMethodIcon = (method) => {
    if (!method) return '💰';
    switch (method.toLowerCase()) {
      case 'cash':
        return 'https://marifat.uz/storage/posts/1730719027i_(13)256.webp';
      case 'payme':
        return '💳';
      case 'click':
        return 'https://click.uz/click/images/logo.svg';
      case 'uzcard':
        return '🏦';
      case 'humo':
        return '💎';
      default:
        return '💰';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('uz-UZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateRemainingDays = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const calculateTotalDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getProgressPercentage = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    const totalTime = end - start;
    const usedTime = now - start;

    if (totalTime <= 0) return 0;
    return Math.max(0, Math.min(100, (usedTime / totalTime) * 100));
  };

  const getMembershipStatus = (membership) => {
    const now = new Date();
    const endDate = new Date(membership.end_date);

    if (membership.status === 'cancelled') return 'cancelled';
    if (endDate < now) return 'expired';
    return membership.status;
  };

  const filteredMemberships = memberships.filter(membership => {
    if (filter === 'all') return true;
    const actualStatus = getMembershipStatus(membership);
    return actualStatus.toLowerCase() === filter;
  });

  const getFilterCount = (filterType) => {
    if (filterType === 'all') return memberships.length;
    return memberships.filter(m => getMembershipStatus(m).toLowerCase() === filterType).length;
  };

  const handleRenewMembership = async (membershipId) => {
    try {
      toast.success("Redirecting to renewal...");
      // Здесь можно добавить логику для перенаправления на страницу покупки
    } catch (error) {
      toast.error("Failed to renew membership");
    }
  };

  const fetchMemberships = async () => {
    setLoading(true);
    try {
      await membershipStore.getAllMemberships();
    } catch (error) {
      console.error("Failed to fetch memberships:", error);
      toast.error("Failed to refresh memberships");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading && memberships.length === 0) {
    return (
      <div className="flex-1 w-full p-8 bg-dark-10 rounded-2xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown-60"></div>
        </div>
      </div>
    );
  }

  const {t}  = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex-1 w-full p-8 bg-dark-10 rounded-2xl">
      <div className="max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" style={{ color: 'var(--color-gray-70)' }} />
            <h1 className="text-xl font-medium text-white">{t("profile.myMemberships")}</h1>
          </div>
          <button
            onClick={fetchMemberships}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-brown-60)',
              color: 'white'
            }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t("refresh")}
          </button>
        </div>

        {/* Description & Filters */}
        <div className="mb-8">
          <p className="text-gray-300 mb-6">
            {t("profile.description")}
          </p>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: t("profile.allMemberships") },
              { key: 'active', label: t("profile.active") },
              { key: 'expired', label: t("profile.expired") },
              { key: 'cancelled', label: t("profile.cancelled") }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-dark-20'
                }`}
                style={{
                  backgroundColor: filter === key ? 'var(--color-brown-60)' : 'var(--color-dark-15)',
                  border: `1px solid ${filter === key ? 'var(--color-brown-70)' : 'var(--color-dark-30)'}`
                }}
              >
                {label} ({getFilterCount(key)})
              </button>
            ))}
          </div>
        </div>

        {/* Memberships Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMemberships.map((membership) => {
            const actualStatus = getMembershipStatus(membership);
            const remainingDays = calculateRemainingDays(membership.end_date);
            const totalDays = calculateTotalDays(membership.start_date, membership.end_date);

            return (
              <div
                key={membership.id}
                className={`p-6 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                  actualStatus === 'active' ? 'ring-2 ring-green-500/20' : ''
                }`}
                style={{
                  backgroundColor: 'var(--color-dark-15)',
                  borderColor: actualStatus === 'active' ? 'rgba(34, 197, 94, 0.3)' : 'var(--color-dark-30)'
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold text-lg">
                        {membership?.tariff?.name || t("loading")}
                      </h3>
                      {actualStatus === 'active' && <Star className="w-4 h-4 text-yellow-500" />}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {t("profile.code")}: #{membership?.tariff?.code}
                    </p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1"
                    style={getStatusColor(actualStatus)}
                  >
                    {getStatusIcon(actualStatus)}
                    {t(`status.${actualStatus}`)}
                  </span>
                </div>

                {/* Progress Bar */}
                {actualStatus === 'active' && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">{t("profile.daysRemaining")}</span>
                      <span className="text-sm font-medium text-white">
                {remainingDays} / {totalDays} {t("profile.days")}
              </span>
                    </div>
                    <div className="w-full bg-dark-25 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${getProgressPercentage(membership.start_date, membership.end_date)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Visit Counter */}
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-dark-25)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-brown-60" />
                      <span className="text-sm text-gray-400">{t("profile.visitsUsed")}</span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {membership.used_visits || 0}
                      {membership.max_visits ? ` / ${membership.max_visits}` : ` (${t("profile.unlimited")})`}
                    </span>
                  </div>

                  {membership.max_visits ? (
                    <div className="w-full bg-dark-30 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (membership.used_visits / membership.max_visits) >= 0.9
                            ? 'bg-red-500'
                            : (membership.used_visits / membership.max_visits) >= 0.7
                              ? 'bg-yellow-500'
                              : 'bg-brown-60'
                        }`}
                        style={{
                          width: `${Math.min(100, (membership.used_visits / membership.max_visits) * 100)}%`
                        }}
                      ></div>
                    </div>
                  ) : (
                    <div className="w-full bg-dark-30 rounded-full h-2">
                      <div className="bg-gradient-to-r from-brown-60 via-yellow-500 to-brown-60 h-2 rounded-full animate-pulse"></div>
                    </div>
                  )}

                  <div className="mt-2 text-xs text-gray-500">
                    {membership.max_visits ? (
                      membership.max_visits - (membership.used_visits || 0) > 0 ? (
                        <span className="text-green-400">
                  {membership.max_visits - (membership.used_visits || 0)} {t("profile.visitsRemaining")}
                </span>
                      ) : (
                        <span className="text-red-400">{t("profile.noVisitsRemaining")}</span>
                      )
                    ) : (
                      <span className="text-brown-60">{t("profile.unlimitedAccess")}</span>
                    )}
                  </div>
                </div>

                {/* Membership Dates */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{t("profile.startDate")}</span>
                    </div>
                    <p className="text-white font-medium">{formatDate(membership.start_date)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <Clock className="w-4 h-4" />
                      <span>{t("profile.endDate")}</span>
                    </div>
                    <p className="text-white font-medium">{formatDate(membership.end_date)}</p>
                  </div>
                </div>



                {/* Payment Info */}
                <div className="flex items-center justify-between mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-dark-25)' }}>
                  <div>
                    <p className="text-gray-400 text-sm">{t("profile.totalPaid")}</p>
                    <p className="text-white font-bold text-lg">{formatAmount(membership?.amount || '0')} so'm</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl"><img
                      className={"h-13"}
                      src={getPaymentMethodIcon(membership?.method)}
                      alt=""
                      width=""
                      height=""
                      loading="lazy"
                    /></span>
                    <span className="text-sm text-gray-400 capitalize">{membership?.method == "cash" && membership?.method}</span>


                  </div>
                </div>

                {/* Features */}
                {membership?.tariff?.features && (
                  <div className="mb-4">
                    <p className="text-gray-400 text-sm mb-2">{t("profile.includedFeatures")}</p>
                    <div className="space-y-1">
                      {membership?.tariff?.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-brown-60 rounded-full"></div>
                          <span className="text-sm text-gray-300">{feature}</span>
                        </div>
                      ))}
                      {membership?.tariff?.features.length > 3 && (
                        <p className="text-xs text-gray-500 ml-3.5">
                          +{membership?.tariff?.features.length - 3} {t("profile.moreFeatures")}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Purchase Date */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CreditCard className="w-3 h-3" />
                    <span>{t("purchasedOn")} {formatDate(membership.created_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap items-strech">
                  {actualStatus === 'expired' && (
                    <button
                      onClick={() => handleRenewMembership(membership.id)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: 'var(--color-brown-60)',
                        color: 'white'
                      }}
                    >
                      {t("renewMembership")}
                    </button>
                  )}

                  {actualStatus === 'active' && (
                    <button
                      className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: 'var(--color-dark-25)',
                        color: 'var(--color-gray-70)',
                        border: `1px solid var(--color-dark-30)`
                      }}
                    >
                      {t("manage")}
                    </button>
                  )}

                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: 'var(--color-dark-25)',
                      color: 'var(--color-gray-70)',
                      border: `1px solid var(--color-dark-30)`
                    }}
                  >
                    {t("details")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredMemberships.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="p-4 rounded-full inline-block mb-4" style={{ backgroundColor: 'var(--color-dark-25)' }}>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {filter === 'all'
                ? t('profile.noMembershipsFound')
                : t('profile.noMembershipsFoundFilter', { filter })}
            </h3>
            <p className="text-gray-400 mb-4">
              {filter === 'all'
                ? t('profile.noMembershipsText')
                : t('profile.noMembershipsFilterText', { filter })}
            </p>
            <button
              onClick={() => navigate("/packages")}
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: 'var(--color-brown-60)',
                color: 'white'
              }}
            >
              {t('profile.browseMemberships')}
            </button>
          </div>
        )}


        {/* Summary Card */}
        {memberships.length > 0 && (
          <div
            className="mt-8 p-6 rounded-lg border-l-4"
            style={{
              backgroundColor: 'var(--color-dark-15)',
              borderLeftColor: 'var(--color-brown-70)'
            }}
          >
            <h4 className="text-white font-medium mb-4">{t("membershipSummary")}</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">{t("totalMemberships")}</p>
                <p className="text-white font-medium">{memberships.length}</p>
              </div>
              <div>
                <p className="text-gray-400">{t("totalVisits")}</p>
                <p className="text-green-400 font-medium">
                  {memberships.filter(m => getMembershipStatus(m) === 'active').length}
                </p>
              </div>
              <div>
                <p className="text-gray-400">{t("membershipSummary")}</p>
                <p className="text-white font-medium">
                  {memberships.reduce((sum, m) => sum + (m.used_visits || 0), 0)}
                </p>
              </div>
              <div>
                <p className="text-gray-400">{t("membershipSummary")}</p>
                <p className="text-white font-medium">
                  {memberships.filter(m => {
                    const created = new Date(m.created_at);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default MembershipHistory;