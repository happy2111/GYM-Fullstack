import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AddMembershipModal = ({ isOpen, onClose, membership, isEditing, onSubmit }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    userId: membership?.user_id || '',
    tariffId: membership?.tariff_id || '',
    startDate: membership?.start_date ? membership.start_date.split('T')[0] : '',
    endDate: membership?.end_date ? membership.end_date.split('T')[0] : '',
    status: membership?.status || 'active',
    maxVisits: membership?.max_visits || '',
    paymentId: membership?.payment_id || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }} onClick={onClose}></div>
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg border" style={{ backgroundColor: 'var(--color-dark-10)', borderColor: 'var(--color-dark-20)' }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-dark-20)' }}>
          <h2 className="text-xl font-bold">{isEditing ? t('editMembership') : t('createMembership')}</h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--color-dark-15)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t('userId')}</label>
              <input
                type="text"
                required
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                style={{ backgroundColor: 'var(--color-dark-12)', borderColor: 'var(--color-dark-20)', color: 'var(--color-gray-97)' }}
                placeholder={t('enterUserId')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('tariffId')}</label>
              <input
                type="text"
                required
                value={formData.tariffId}
                onChange={(e) => setFormData({ ...formData, tariffId: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                style={{ backgroundColor: 'var(--color-dark-12)', borderColor: 'var(--color-dark-20)', color: 'var(--color-gray-97)' }}
                placeholder={t('enterTariffId')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('startDate')}</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                style={{ backgroundColor: 'var(--color-dark-12)', borderColor: 'var(--color-dark-20)', color: 'var(--color-gray-97)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('endDate')}</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                style={{ backgroundColor: 'var(--color-dark-12)', borderColor: 'var(--color-dark-20)', color: 'var(--color-gray-97)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('status')}</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                style={{ backgroundColor: 'var(--color-dark-12)', borderColor: 'var(--color-dark-20)', color: 'var(--color-gray-97)' }}
              >
                <option value="active">{t('statuses.active')}</option>
                <option value="expired">{t('statuses.expired')}</option>
                <option value="frozen">{t('statuses.frozen')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('maxVisits')}</label>
              <input
                type="number"
                value={formData.maxVisits}
                onChange={(e) => setFormData({ ...formData, maxVisits: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                style={{ backgroundColor: 'var(--color-dark-12)', borderColor: 'var(--color-dark-20)', color: 'var(--color-gray-97)' }}
                placeholder={t('enterMaxVisits')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('paymentId')}</label>
              <input
                type="text"
                value={formData.paymentId}
                onChange={(e) => setFormData({ ...formData, paymentId: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                style={{ backgroundColor: 'var(--color-dark-12)', borderColor: 'var(--color-dark-20)', color: 'var(--color-gray-97)' }}
                placeholder={t('enterPaymentId')}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t" style={{ borderColor: 'var(--color-dark-20)' }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border font-medium transition-colors"
              style={{ borderColor: 'var(--color-dark-30)', color: 'var(--color-gray-70)' }}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brown-60)', color: 'white' }}
            >
              {isEditing ? t('updateMembership') : t('createMembership')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMembershipModal;