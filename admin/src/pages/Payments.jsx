import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Eye, X, Check, Clock, AlertCircle } from 'lucide-react';
import paymentService from "../services/paymentService.js";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const PaymentsCRUD = () => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getPayments = async () => {
    try {
      const response = await paymentService.getAllPayments();
      setPayments(response.payments);
    } catch (error) {
      console.error(t('messages.errorFetchingPayments'), error);
    }
  };

  const handleConfirmPayment = async (payment) => {
    try {
      setIsLoading(true);
      const response = await paymentService.confirmPayment(payment.id);
      console.log(t('messages.paymentConfirmed'), response);
      setPayments(prevPayments =>
        prevPayments.map(p =>
          p.id === payment.id ? { ...p, status: 'completed' } : p
        )
      );
      toast.success(t('messages.paymentConfirmed'));
    } catch (error) {
      console.error(t('messages.errorConfirmingPayment'), error);
      toast.error(t('messages.errorConfirmingPayment'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPayments();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  const [formData, setFormData] = useState({
    user_id: '',
    membership_id: '',
    amount: '',
    method: 'cash',
    status: 'pending',
    transaction_id: '',
    tariff_id: ''
  });

  const paymentMethods = [
    { value: 'cash', label: t('paymentMethods.cash') },
    { value: 'click', label: t('paymentMethods.click') },
  ];

  const paymentStatuses = [
    { value: 'pending', label: t('payments.filters.pending'), icon: Clock, color: 'text-yellow-400' },
    { value: 'completed', label: t('payments.filters.completed'), icon: Check, color: 'text-green-400' },
    { value: 'failed', label: t('payments.filters.failed'), icon: AlertCircle, color: 'text-red-400' }
  ];

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.amount.toString().includes(searchTerm) ||
      payment.method.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openModal = (payment = null) => {
    setCurrentPayment(payment);
    setIsEditing(!!payment);
    if (payment) {
      setFormData({
        user_id: payment.user_id,
        membership_id: payment.membership_id,
        amount: payment.amount.toString(),
        method: payment.method,
        status: payment.status,
        transaction_id: payment?.transaction_id || '',
        tariff_id: payment.tariff_id
      });
    } else {
      setFormData({
        user_id: '',
        membership_id: '',
        amount: '',
        method: 'cash',
        status: 'pending',
        transaction_id: '',
        tariff_id: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPayment(null);
    setIsEditing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const now = new Date().toISOString();

    if (isEditing) {
      setPayments(payments.map(payment =>
        payment.id === currentPayment.id
          ? { ...payment, ...formData, amount: parseFloat(formData.amount), updated_at: now }
          : payment
      ));
      toast.success(t('messages.paymentUpdated'));
    } else {
      const newPayment = {
        id: crypto.randomUUID(),
        ...formData,
        amount: parseFloat(formData.amount),
        created_at: now,
        updated_at: now
      };
      setPayments([...payments, newPayment]);
      toast.success(t('messages.paymentCreated'));
    }
    closeModal();
  };

  const handleDelete = (payment) => {
    setPaymentToDelete(payment);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await paymentService.deletePayment(paymentToDelete.id);
      if (res) {
        toast.success(t('messages.paymentDeleted'));
        setPayments(payments.filter(payment => payment.id !== paymentToDelete.id));
      } else {
        toast.error(t('messages.paymentDeleteFailed'));
      }
    } catch (error) {
      toast.error(t('messages.paymentDeleteFailed'));
    }
    setIsDeleteConfirmOpen(false);
    setPaymentToDelete(null);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    const statusConfig = paymentStatuses.find(s => s.value === status);
    if (statusConfig) {
      const IconComponent = statusConfig.icon;
      return <IconComponent className={`w-4 h-4 ${statusConfig.color}`} />;
    }
    return null;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-dark-06)', color: 'var(--color-gray-97)' }}>
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('payments.title')}</h1>
          <p className="text-gray-70">{t('payments.description')}</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-50" />
            <input
              type="text"
              placeholder={t('searchAndFilters.searchPaymentsPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60 transition-colors"
              style={{
                backgroundColor: 'var(--color-dark-12)',
                borderColor: 'var(--color-dark-20)',
                color: 'var(--color-gray-97)'
              }}
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-50" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60 appearance-none min-w-[140px]"
                style={{
                  backgroundColor: 'var(--color-dark-12)',
                  borderColor: 'var(--color-dark-20)',
                  color: 'var(--color-gray-97)'
                }}
              >
                <option value="all">{t('searchAndFilters.allStatuses')}</option>
                {paymentStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brown-60)', color: 'white' }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('common.add_payment')}</span>
            </button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--color-dark-20)' }}>
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--color-dark-12)' }}>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.transaction')}</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.price')}</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.method')}</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.status')}</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.date')}</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.actions')}</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'var(--color-dark-10)' }}>
              {filteredPayments.map((payment, index) => (
                <tr
                  key={payment.id}
                  className="border-t hover:bg-opacity-50"
                  style={{
                    borderColor: 'var(--color-dark-20)',
                    '--tw-bg-opacity': '0.5'
                  }}
                  onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = 'var(--color-dark-12)'}
                  onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = 'var(--color-dark-10)'}
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-97">{payment?.transaction_id || t('paymentMethods.unknown')}</div>
                      <div className="text-xs text-gray-70">ID: {payment.id.substring(0, 8)}...</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold" style={{ color: 'var(--color-brown-70)' }}>
                      {formatAmount(payment.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-97 capitalize">
                      {t(`paymentMethods.${payment.method}`) || payment.method.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(payment.status)}
                      <span className="text-sm capitalize">{t(`payments.filters.${payment.status}`)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-70">
                    {formatDate(payment.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        disabled={payment.status === 'completed'}
                        onClick={() => handleConfirmPayment(payment)}
                        className={`p-2 rounded-lg hover:bg-opacity-50 hover:scale-104 active:scale-106 duration-150 transition-all ${payment.status === 'completed' ? 'opacity-50 cursor-not-allowed' : 'bg-opacity-0'}`}
                        style={{ backgroundColor: `${payment.status === 'completed' ? 'yellowgreen' : 'var(--color-dark-20)'}` }}
                      >
                        {isLoading ? <p className="w-4 h-4">{t('paymentModal.processing')}</p> : <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openModal(payment)}
                        className="p-2 rounded-lg transition-colors hover:bg-opacity-50"
                        style={{ backgroundColor: 'var(--color-dark-20)' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-brown-95)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-dark-20)'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(payment)}
                        className="p-2 rounded-lg transition-colors hover:bg-opacity-50"
                        style={{ backgroundColor: 'var(--color-dark-20)' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-brown-60)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-dark-20)'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="p-4 rounded-lg border"
              style={{ backgroundColor: 'var(--color-dark-10)', borderColor: 'var(--color-dark-20)' }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(payment.status)}
                  <span className="text-sm font-medium capitalize">{t(`payments.filters.${payment.status}`)}</span>
                </div>
                <div className="text-lg font-bold" style={{ color: 'var(--color-brown-70)' }}>
                  {formatAmount(payment.amount)}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-70">{t('tableHeaders.transaction')}</span>
                  <span className="text-sm font-mono">{payment?.transaction_id || t('paymentMethods.unknown')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-70">{t('tableHeaders.method')}</span>
                  <span className="text-sm capitalize">{t(`paymentMethods.${payment.method}`) || payment.method.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-70">{t('tableHeaders.date')}</span>
                  <span className="text-sm">{formatDate(payment.created_at)}</span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => openModal(payment)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-colors"
                  style={{ borderColor: 'var(--color-brown-60)', color: 'var(--color-brown-60)' }}
                >
                  <Edit2 className="w-4 h-4" />
                  <span>{t('actions.edit')}</span>
                </button>
                <button
                  onClick={() => handleDelete(payment)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-colors"
                  style={{ borderColor: 'var(--color-brown-60)', color: 'var(--color-brown-60)' }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t('actions.delete')}</span>
                </button>
              </div>
              <button
                disabled={payment.status === 'completed'}
                onClick={() => handleConfirmPayment(payment)}
                className={`py-2 mt-2 flex items-center justify-center gap-2 rounded-lg hover:bg-opacity-50 min-w-full hover:scale-104 active:scale-106 duration-150 transition-all ${payment.status === 'completed' ? 'opacity-50 cursor-not-allowed' : 'bg-opacity-0'}`}
                style={{ backgroundColor: `${payment.status === 'completed' ? 'yellowgreen' : 'var(--color-dark-20)'}` }}
              >
                {isLoading ? <p className="w-4 h-4">{t('paymentModal.processing')}</p> : <Check className="w-4 h-4" />}
                <span>{t('common.confirm')}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-dark-15)' }}>
              <Search className="w-8 h-8 text-gray-50" />
            </div>
            <h3 className="text-lg font-medium mb-2">{t('payments.empty_all')}</h3>
            <p className="text-gray-70 mb-4">{t('payments.empty_all_desc')}</p>
            <button
              onClick={() => openModal()}
              className="px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brown-60)', color: 'white' }}
            >
              {t('common.add_first_payment')}
            </button>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
              onClick={closeModal}
            ></div>

            <div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border"
              style={{ backgroundColor: 'var(--color-dark-10)', borderColor: 'var(--color-dark-20)' }}
            >
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-dark-20)' }}>
                <h2 className="text-xl font-bold">
                  {isEditing ? t('modal.editPayment') : t('modal.createPayment')}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg transition-colors"
                  style={{ backgroundColor: 'var(--color-dark-15)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('formFields.userId')}</label>
                    <input
                      type="text"
                      required
                      value={formData.user_id}
                      onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                      style={{
                        backgroundColor: 'var(--color-dark-12)',
                        borderColor: 'var(--color-dark-20)',
                        color: 'var(--color-gray-97)'
                      }}
                      placeholder={t('formPlaceholders.enterUserUUID')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('formFields.membershipId')}</label>
                    <input
                      type="text"
                      required
                      value={formData.membership_id}
                      onChange={(e) => setFormData({...formData, membership_id: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                      style={{
                        backgroundColor: 'var(--color-dark-12)',
                        borderColor: 'var(--color-dark-20)',
                        color: 'var(--color-gray-97)'
                      }}
                      placeholder={t('formPlaceholders.enterMembershipUUID')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('formFields.amount')}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                      style={{
                        backgroundColor: 'var(--color-dark-12)',
                        borderColor: 'var(--color-dark-20)',
                        color: 'var(--color-gray-97)'
                      }}
                      placeholder={t('formPlaceholders.enterAmount')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('paymentMethod')}</label>
                    <select
                      value={formData.method}
                      onChange={(e) => setFormData({...formData, method: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                      style={{
                        backgroundColor: 'var(--color-dark-12)',
                        borderColor: 'var(--color-dark-20)',
                        color: 'var(--color-gray-97)'
                      }}
                    >
                      {paymentMethods.map(method => (
                        <option key={method.value} value={method.value}>{method.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('tableHeaders.status')}</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                      style={{
                        backgroundColor: 'var(--color-dark-12)',
                        borderColor: 'var(--color-dark-20)',
                        color: 'var(--color-gray-97)'
                      }}
                    >
                      {paymentStatuses.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('payments.transaction')}</label>
                    <input
                      type="text"
                      required
                      value={formData.transaction_id}
                      onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                      style={{
                        backgroundColor: 'var(--color-dark-12)',
                        borderColor: 'var(--color-dark-20)',
                        color: 'var(--color-gray-97)'
                      }}
                      placeholder={t('formPlaceholders.enterTransactionId')}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-2">{t('payments.tariff')}</label>
                    <input
                      type="text"
                      value={formData.tariff_id}
                      onChange={(e) => setFormData({...formData, tariff_id: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                      style={{
                        backgroundColor: 'var(--color-dark-12)',
                        borderColor: 'var(--color-dark-20)',
                        color: 'var(--color-gray-97)'
                      }}
                      placeholder={t('formPlaceholders.enterTariffUUID')}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t" style={{ borderColor: 'var(--color-dark-20)' }}>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 rounded-lg border font-medium transition-colors"
                    style={{ borderColor: 'var(--color-dark-30)', color: 'var(--color-gray-70)' }}
                  >
                    {t('buttons.cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
                    style={{ backgroundColor: 'var(--color-brown-60)', color: 'white' }}
                  >
                    {isEditing ? t('buttons.update') : t('buttons.create')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
              onClick={() => setIsDeleteConfirmOpen(false)}
            ></div>

            <div
              className="relative w-full max-w-md rounded-lg border"
              style={{ backgroundColor: 'var(--color-dark-10)', borderColor: 'var(--color-dark-20)' }}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-brown-95)' }}>
                    <AlertCircle className="w-6 h-6" style={{ color: 'var(--color-brown-60)' }} />
                  </div>
                  <h3 className="text-lg font-bold">{t('deleteConfirmation.confirmDeletion')}</h3>
                </div>

                <p className="text-gray-70 mb-6">
                  {t('deleteConfirmation.deletePaymentConfirm')}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="flex-1 px-4 py-2 rounded-lg border font-medium transition-colors"
                    style={{ borderColor: 'var(--color-dark-30)', color: 'var(--color-gray-70)' }}
                  >
                    {t('buttons.cancel')}
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
                    style={{ backgroundColor: 'var(--color-brown-60)', color: 'white' }}
                  >
                    {t('actions.delete')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsCRUD;