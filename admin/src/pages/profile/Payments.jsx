import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Calendar, Hash, User, Package } from 'lucide-react';
import authStore from "../../store/authStore.js";
import api from "../../http/index.js";
import toast from "react-hot-toast";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

const Payments = observer(() => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const { payments } = authStore;

  useEffect(() => {
    authStore.getPayments();
  }, []);

  const getPaymentMethodIcon = (method) => {
    const methodLower = method.toLowerCase();
    switch (methodLower) {
      case 'cash': return 'https://marifat.uz/storage/posts/1730719027i_(13)256.webp';
      case 'payme': return '💳';
      case 'click': return `https://click.uz/click/images/logo.svg`;
      case 'uzcard': return '🏦';
      case 'humo': return '💎';
      default: return '💰';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success': return { backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'rgb(34, 197, 94)', borderColor: 'rgba(34, 197, 94, 0.2)' };
      case 'pending': return { backgroundColor: 'rgba(234, 179, 8, 0.1)', color: 'rgb(234, 179, 8)', borderColor: 'rgba(234, 179, 8, 0.2)' };
      case 'failed':
      case 'error': return { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)', borderColor: 'rgba(239, 68, 68, 0.2)' };
      default: return { backgroundColor: 'var(--color-dark-25)', color: 'var(--color-gray-70)', borderColor: 'var(--color-dark-30)' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return t("just_now", "Just now");
  };

  const formatAmount = (amount) => new Intl.NumberFormat('uz-UZ').format(amount);

  const filteredPayments = payments.filter(payment => filter === 'all' || payment.status.toLowerCase() === filter);

  const getFilterCount = (filterType) => filterType === 'all' ? payments.length : payments.filter(p => p.status.toLowerCase() === filterType).length;

  const handleRefund = async (paymentId) => {
    setLoading(true);
    try {
      await api.post(`/payments/${paymentId}/refund`);
      toast.success(t("payments.refund_success"));
      authStore.getPayments();
    } catch {
      toast.error(t("payments.refund_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full p-8 bg-dark-10 rounded-2xl">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <CreditCard className="w-5 h-5 text-gray-400" />
          <h1 className="text-xl font-medium text-white">{t("payments.title")}</h1>
        </div>

        {/* Description & Filters */}
        <p className="text-gray-300 mb-6">{t("payments.description")}</p>
        <div className="flex flex-wrap gap-2 mb-8">
          {["all", "completed", "pending", "failed"].map(key => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === key ? "text-white" : "text-gray-400 hover:text-white hover:bg-dark-20"
              }`}
              style={{
                backgroundColor: filter === key ? "var(--color-brown-60)" : "var(--color-dark-15)",
                border: `1px solid ${filter === key ? "var(--color-brown-70)" : "var(--color-dark-30)"}`
              }}
            >
              {t(`payments.filters.${key}`)} ({getFilterCount(key)})
            </button>
          ))}
        </div>

        {/* Payments List */}
        <div className="space-y-4">
          {filteredPayments.map(payment => (
            <div key={payment.id} className="p-6 rounded-lg border hover:border-brown-70 transition-colors"
                 style={{ backgroundColor: "var(--color-dark-15)", borderColor: "var(--color-dark-30)" }}>
              <div className="flex max-sm:flex-col justify-between gap-4">
                <div className="p-2 h-15 w-15 flex items-center justify-center rounded-lg max-md:mx-auto bg-dark-25 text-2xl">
                  <img
                    src={getPaymentMethodIcon(payment.method)}
                    alt=""
                    width=""
                    height=""
                    loading="lazy"
                  /></div>

                <div className="flex gap-4 flex-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 max-sm:flex-col-reverse">
                      <h3 className="text-white font-medium text-lg">{formatAmount(payment.amount)} so'm</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1"
                            style={getStatusColor(payment.status)}>
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                      <div>
                        <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" />{t("payments.method")}: {payment.method.toUpperCase()}</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{t("payments.created")}: {formatDate(payment.created_at)}</div>
                        {payment.updated_at !== payment.created_at &&
                          <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{t("payments.updated")}: {formatDate(payment.updated_at)}</div>}
                      </div>
                      <div>
                        {payment.transaction_id && <div className="flex items-center gap-2"><Hash className="w-4 h-4" />{t("payments.transaction")}: {payment.transaction_id}</div>}
                        {payment.tariff_id && <div className="flex items-center gap-2"><Package className="w-4 h-4" />{t("payments.tariff")}: {payment.tariff_id}</div>}
                        {payment.membership_id && <div className="flex items-center gap-2"><User className="w-4 h-4" />{t("payments.membership")}: {payment.membership_id}</div>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {payment.status.toLowerCase() === "completed" && (
                    <button onClick={() => handleRefund(payment.id)} disabled={loading}
                            className="px-3 py-1 rounded-lg text-xs font-medium bg-dark-25 text-gray-70 border border-dark-30 disabled:opacity-50">
                      {t("payments.refund")}
                    </button>
                  )}
                  <button className="px-3 py-1 rounded-lg text-xs font-medium bg-brown-60 text-white">
                    {t("payments.details")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPayments.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="p-4 rounded-full inline-block mb-4 bg-dark-25">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {filter === "all" ? t("payments.empty_all") : t("payments.empty_filter", { status: t(`payments.filters.${filter}`) })}
            </h3>
            <p className="text-gray-400">
              {filter === "all" ? t("payments.empty_all_desc") : t("payments.empty_filter_desc", { status: t(`payments.filters.${filter}`) })}
            </p>
          </div>
        )}

        {/* Summary */}
        {payments.length > 0 && (
          <div className="mt-8 p-6 rounded-lg border-l-4" style={{ backgroundColor: "var(--color-dark-15)", borderLeftColor: "var(--color-brown-70)" }}>
            <h4 className="text-white font-medium mb-4">{t("payments.summary.title")}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div><p className="text-gray-400">{t("payments.summary.total")}</p><p className="text-white font-medium">{payments.length}</p></div>
              <div><p className="text-gray-400">{t("payments.summary.amount")}</p><p className="text-white font-medium">{formatAmount(payments.reduce((s, p) => s + parseFloat(p.amount), 0))} so'm</p></div>
              <div><p className="text-gray-400">{t("payments.summary.rate")}</p><p className="text-white font-medium">{Math.round((payments.filter(p => p.status.toLowerCase() === "completed").length / payments.length) * 100)}%</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default Payments;
