import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Calendar, Hash, User, Package } from 'lucide-react';
import authStore from "../../store/authStore.js";
import api from "../../http/index.js";
import toast from "react-hot-toast";
import {observer} from "mobx-react-lite";

const Payments = observer(() => {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, completed, failed
  const { payments } = authStore;
  const getPaymentMethodIcon = (method) => {
    const methodLower = method.toLowerCase();
    switch (methodLower) {
      case 'cash':
        return '💵';
      case 'payme':
        return '💳';
      case 'click':
        return '📱';
      case 'uzcard':
        return '🏦';
      case 'humo':
        return '💎';
      default:
        return '💰';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return {
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          color: 'rgb(34, 197, 94)',
          borderColor: 'rgba(34, 197, 94, 0.2)'
        };
      case 'pending':
        return {
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          color: 'rgb(234, 179, 8)',
          borderColor: 'rgba(234, 179, 8, 0.2)'
        };
      case 'failed':
      case 'error':
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('uz-UZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status.toLowerCase() === filter;
  });

  const getFilterCount = (filterType) => {
    if (filterType === 'all') return payments.length;
    return payments.filter(p => p.status.toLowerCase() === filterType).length;
  };

  const handleRefund = async (paymentId) => {
    setLoading(true);
    try {
      await api.post(`/payments/${paymentId}/refund`);
      toast.success("Refund request submitted successfully");
      fetchPayments(); // Refresh payments
    } catch (error) {
      console.error('Refund failed:', error);
      toast.error("Failed to process refund request");
    } finally {
      setLoading(false);
    }
  };

  if (loading && payments.length === 0) {
    return (
      <div className="flex-1 w-full p-8 bg-dark-10 rounded-2xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown-60"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full p-8 bg-dark-10 rounded-2xl">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <CreditCard className="w-5 h-5" style={{ color: 'var(--color-gray-70)' }} />
          <h1 className="text-xl font-medium text-white">Payment History</h1>
        </div>

        {/* Description & Filters */}
        <div className="mb-8">
          <p className="text-gray-300 mb-6">
            View and manage all your gym membership payments and transactions.
          </p>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Payments' },
              { key: 'completed', label: 'Completed' },
              { key: 'pending', label: 'Pending' },
              { key: 'failed', label: 'Failed' }
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

        {/* Payments List */}
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="p-6 rounded-lg border transition-colors hover:border-brown-70"
              style={{
                backgroundColor: 'var(--color-dark-15)',
                borderColor: 'var(--color-dark-30)'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Payment Method Icon */}
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-dark-25)' }}>
                    <span className="text-2xl">{getPaymentMethodIcon(payment.method)}</span>
                  </div>

                  {/* Payment Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-white font-medium text-lg">
                        {formatAmount(payment.amount)} so'm
                      </h3>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1"
                        style={getStatusColor(payment.status)}
                      >
                        {getStatusIcon(payment.status)}
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <DollarSign className="w-4 h-4" />
                          <span>Method: {payment.method.toUpperCase()}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>Created: {formatDate(payment.created_at)}</span>
                        </div>

                        {payment.updated_at !== payment.created_at && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>Updated: {formatDate(payment.updated_at)}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {payment.transaction_id && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Hash className="w-4 h-4" />
                            <span className="truncate">Transaction: {payment.transaction_id}</span>
                          </div>
                        )}

                        {payment.tariff_id && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Package className="w-4 h-4" />
                            <span>Tariff ID: {payment.tariff_id.slice(0, 8)}...</span>
                          </div>
                        )}

                        {payment.membership_id && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <User className="w-4 h-4" />
                            <span>Membership: {payment.membership_id.slice(0, 8)}...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {payment.status.toLowerCase() === 'completed' && (
                    <button
                      onClick={() => handleRefund(payment.id)}
                      disabled={loading}
                      className="px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: 'var(--color-dark-25)',
                        color: 'var(--color-gray-70)',
                        border: `1px solid var(--color-dark-30)`
                      }}
                      title="Request refund"
                    >
                      Refund
                    </button>
                  )}

                  <button
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: 'var(--color-brown-60)',
                      color: 'white'
                    }}
                    title="View details"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPayments.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="p-4 rounded-full inline-block mb-4" style={{ backgroundColor: 'var(--color-dark-25)' }}>
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {filter === 'all' ? 'No payments found' : `No ${filter} payments`}
            </h3>
            <p className="text-gray-400">
              {filter === 'all'
                ? "You haven't made any payments yet."
                : `You don't have any ${filter} payments.`
              }
            </p>
          </div>
        )}

        {/* Summary Card */}
        {payments.length > 0 && (
          <div
            className="mt-8 p-6 rounded-lg border-l-4"
            style={{
              backgroundColor: 'var(--color-dark-15)',
              borderLeftColor: 'var(--color-brown-70)'
            }}
          >
            <h4 className="text-white font-medium mb-4">Payment Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Total Payments</p>
                <p className="text-white font-medium">{payments.length}</p>
              </div>
              <div>
                <p className="text-gray-400">Total Amount</p>
                <p className="text-white font-medium">
                  {formatAmount(payments.reduce((sum, p) => sum + parseFloat(p.amount), 0))} so'm
                </p>
              </div>
              <div>
                <p className="text-gray-400">Success Rate</p>
                <p className="text-white font-medium">
                  {payments.length > 0
                    ? Math.round((payments.filter(p => p.status.toLowerCase() === 'completed').length / payments.length) * 100)
                    : 0
                  }%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default Payments;