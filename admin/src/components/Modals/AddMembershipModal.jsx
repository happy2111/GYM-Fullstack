import React, { useState, useEffect } from 'react';
import { X, Search, User, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import usersService from "../../services/usersService.js";
import membershipService from "../../services/membershipService.js";
import tariffService from "@/services/tariffService.js";
import { useTranslation } from 'react-i18next';

const AddMembershipModal = ({ isOpen, onClose, onSuccess }) => {
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tariffs, setTariffs] = useState([]);
  const [selectedTariff, setSelectedTariff] = useState(null);
  const [method, setMethod] = useState('cash');
  const [status, setStatus] = useState('completed');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTariffs, setIsLoadingTariffs] = useState(false);

  // Search users with debounce
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const result = await usersService.getAllUsers({ search: searchQuery, limit: 10 });
        setSearchResults(result.users);
      } catch (error) {
        console.error(t('searchError'), error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, t]);

  // Fetch tariffs when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const fetchTariffs = async () => {
      setIsLoadingTariffs(true);
      try {
        const result = await tariffService.getAllTariffs({ limit: 100 });
        setTariffs(result.tariffs);
      } catch (error) {
        console.error(t('tariffError'), error);
        setTariffs([]);
      } finally {
        setIsLoadingTariffs(false);
      }
    };
    fetchTariffs();
  }, [isOpen, t]);

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchQuery(`${user.name} (${user.email})`);
    setSearchResults([]);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedUser || !selectedTariff) {
      alert(t('pleaseSelectUserAndTariff'));
      return;
    }
    setIsSubmitting(true);
    try {
      await membershipService.createMembershipByAdmin({
        userId: selectedUser.id,
        tariffId: selectedTariff.id,
        method,
        status,
      });
      alert(t('membershipCreatedSuccessfully'));
      if (onSuccess) onSuccess();
      closeModal();
    } catch (error) {
      console.error(t('errorCreatingMembership'), error);
      alert(t('errorCreatingMembership'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal and reset state
  const closeModal = () => {
    if (onClose) onClose();
    setSelectedUser(null);
    setSelectedTariff(null);
    setSearchQuery('');
    setMethod('cash');
    setStatus('completed');
  };

  // Clear user selection
  const clearUserSelection = () => {
    setSelectedUser(null);
    setSearchQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }} onClick={closeModal} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg border" style={{ backgroundColor: 'var(--color-dark-10)', borderColor: 'var(--color-dark-20)' }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-dark-20)' }}>
          <h2 className="text-xl font-bold">{t('modal.createMembership')}</h2>
          <button onClick={closeModal} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--color-dark-15)' }} aria-label={t('cancel')}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* User search */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('userSearch.searchUser')}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                style={{ backgroundColor: 'var(--color-dark-12)', borderColor: 'var(--color-dark-20)', color: 'var(--color-gray-97)' }}
                placeholder={t('searchAndFilters.searchPlaceholder')}
                disabled={selectedUser}
              />
              {selectedUser && (
                <button
                  type="button"
                  onClick={clearUserSelection}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-gray-600"
                  aria-label={t('clearSelection')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* Search results */}
            {searchResults.length > 0 && !selectedUser && (
              <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto" style={{ backgroundColor: 'var(--color-dark-12)', borderColor: 'var(--color-dark-20)' }}>
                {searchResults.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleUserSelect(user)}
                    className="w-full p-3 text-left hover:bg-opacity-50 hover:bg-gray-600 border-b last:border-b-0"
                    style={{ borderColor: 'var(--color-dark-20)' }}
                  >
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email} • {user.phone}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {isLoading && (
              <div className="mt-2 p-3 text-center text-gray-400">{t('searching')}</div>
            )}
          </div>
          {/* Selected user info */}
          {selectedUser && (
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-dark-15)', borderColor: 'var(--color-dark-20)' }}>
              <h3 className="font-medium mb-2">{t('userSearch.selectedUser')}</h3>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-sm text-gray-400">{selectedUser.email} • {selectedUser.phone}</div>
                </div>
              </div>
            </div>
          )}
          {/* Tariff selection */}
          {selectedUser && (
            <div>
              <h3 className="font-medium mb-3">{t('tariffs.selectTariff')}</h3>
              {isLoadingTariffs ? (
                <div className="p-4 text-center text-gray-400">{t('tariffs.loadingTariffs')}</div>
              ) : tariffs.length === 0 ? (
                <div className="p-4 rounded-lg border flex items-center space-x-2" style={{ backgroundColor: 'var(--color-dark-12)', borderColor: 'var(--color-red-30)' }}>
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400">{t('tariffs.noTariffs')}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {tariffs.map((tariff) => (
                    <div
                      key={tariff.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedTariff?.id === tariff.id ? 'ring-2 ring-brown-60' : 'hover:bg-opacity-50 hover:bg-gray-600'
                      }`}
                      style={{ backgroundColor: 'var(--color-dark-12)', borderColor: selectedTariff?.id === tariff.id ? 'var(--color-brown-60)' : 'var(--color-dark-25)' }}
                      onClick={() => setSelectedTariff(tariff)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <CreditCard className="w-4 h-4 text-blue-400" />
                            <span className="font-medium">{tariff.name || `Tariff #${tariff.id.substring(0, 8)}`}</span>
                            {selectedTariff?.id === tariff.id && (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-400 mb-1">{t('tariffs.code')}:</div>
                              <span>{tariff.code}</span>
                            </div>
                            <div>
                              <div className="text-gray-400 mb-1">{t('tariffs.price')}:</div>
                              <span>{tariff.price} so'm</span>
                            </div>
                            <div>
                              <div className="text-gray-400 mb-1">{t('tariffs.durationDay')}:</div>
                              <span>{tariff.duration_days || t('tariffs.unknown')}</span>
                            </div>
                            <div>
                              <div className="text-gray-400 mb-1">{t('tariffs.maxVisits')}:</div>
                              <span>{tariff.max_visits || "∞"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Payment method and status */}
          {selectedUser && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('memberships.paymentMethod')}</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                  style={{ backgroundColor: 'var(--color-dark-12)', borderColor: 'var(--color-dark-20)', color: 'var(--color-gray-97)' }}
                >
                  <option value="cash">{t('memberships.cash')}</option>
                  <option value="click">{t('memberships.click')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('memberships.status')}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                  style={{ backgroundColor: 'var(--color-dark-12)', borderColor: 'var(--color-dark-20)', color: 'var(--color-gray-97)' }}
                >
                  <option value="completed">{t('memberships.completed')}</option>
                  <option value="pending">{t('memberships.pending')}</option>
                  <option value="cancelled">{t('memberships.cancelled')}</option>
                </select>
              </div>
            </div>
          )}
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t" style={{ borderColor: 'var(--color-dark-20)' }}>
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-6 py-3 rounded-lg border font-medium transition-colors"
              style={{ borderColor: 'var(--color-dark-30)', color: 'var(--color-gray-70)' }}
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedUser || !selectedTariff || isSubmitting}
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--color-brown-60)', color: 'white' }}
            >
              {isSubmitting ? t('creating') : t('createMembership')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMembershipModal;