import React, { useState, useEffect } from 'react';
import { X, Search, User, Clock, CreditCard, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import usersService from "../../services/usersService.js";
import membershipService from "../../services/membershipService.js";
import visitService from "../../services/visitService.js";
import { useTranslation } from 'react-i18next';

// Mock i18n hook - заменить на реальный useTranslation

const AddVisitModal = ({ isOpen, onClose, onSuccess }) => {
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeMemberships, setActiveMemberships] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMemberships, setIsLoadingMemberships] = useState(false);

  // Поиск пользователей с задержкой
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

  // Получение активных абонементов при выборе пользователя
  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setSearchQuery(`${user.name} (${user.email})`);
    setSearchResults([]);
    setSelectedMembership(null);
    setIsLoadingMemberships(true);

    try {
      const membershipResponse = await membershipService.getActiveMembership(user.id);
      const memberships = membershipResponse.membership || membershipResponse || [];

      setActiveMemberships(Array.isArray(memberships) ? memberships : []);

      if (memberships.length === 1) {
        setSelectedMembership(memberships[0]);
      }
    } catch (error) {
      console.error(t('membershipError'), error);
      setActiveMemberships([]);
    } finally {
      setIsLoadingMemberships(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser || !selectedMembership) {
      alert(t('pleaseSelectUserAndMembership'));
      return;
    }

    setIsSubmitting(true);
    try {
      await visitService.createManualVisit({
        userId: selectedUser.id,
        membershipId: selectedMembership.id,
        notes: notes
      });

      alert(t('visitCreatedSuccessfully'));
      if (onSuccess) onSuccess();
      closeModal();
    } catch (error) {
      console.error(t('errorCreatingVisit'), error);
      alert(t('errorCreatingVisit'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    if (onClose) onClose();
    setSelectedUser(null);
    setActiveMemberships([]);
    setSelectedMembership(null);
    setSearchQuery('');
    setNotes('');
  };

  const clearUserSelection = () => {
    setSelectedUser(null);
    setActiveMemberships([]);
    setSelectedMembership(null);
    setSearchQuery('');
  };

  const formatDate = (dateString) => {
    const localeMap = {
      en: 'en-US',
      ru: 'ru-RU',
      uz: 'uz-UZ'
    };

    return new Date(dateString).toLocaleDateString(localeMap[language] || 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMembershipProgress = (membership) => {
    if (!membership.max_visits) return null;
    const progressPercent = (membership.used_visits / membership.max_visits) * 100;
    return Math.min(progressPercent, 100);
  };

  const getMembershipStatusColor = (membership) => {
    if (!membership.max_visits) return 'text-blue-400';

    const remainingVisits = membership.max_visits - membership.used_visits;
    if (remainingVisits === 0) return 'text-red-400';
    if (remainingVisits <= 3) return 'text-yellow-400';
    return 'text-green-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
        onClick={closeModal}
      />

      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg border"
        style={{ backgroundColor: 'var(--color-dark-10)', borderColor: 'var(--color-dark-20)' }}
      >
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-dark-20)' }}>
          <h2 className="text-xl font-bold">{t('createVisit')}</h2>
          <button
            onClick={closeModal}
            className="p-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--color-dark-15)' }}
            aria-label={t('cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Поиск пользователя */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('userSearch.searchUser')}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                style={{
                  backgroundColor: 'var(--color-dark-12)',
                  borderColor: 'var(--color-dark-20)',
                  color: 'var(--color-gray-97)'
                }}
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

            {/* Результаты поиска */}
            {searchResults.length > 0 && !selectedUser && (
              <div
                className="mt-2 border rounded-lg max-h-48 overflow-y-auto"
                style={{ backgroundColor: 'var(--color-dark-12)', borderColor: 'var(--color-dark-20)' }}
              >
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
                        <div className="text-sm text-gray-400">
                          {user.email} • {user.phone}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="mt-2 p-3 text-center text-gray-400">
                {t('searching')}
              </div>
            )}
          </div>

          {/* Информация о выбранном пользователе */}
          {selectedUser && (
            <div
              className="p-4 rounded-lg border"
              style={{ backgroundColor: 'var(--color-dark-15)', borderColor: 'var(--color-dark-20)' }}
            >
              <h3 className="font-medium mb-2">{t('userSearch.selectedUser')}</h3>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-sm text-gray-400">
                    {selectedUser.email} • {selectedUser.phone}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Выбор абонемента */}
          {selectedUser && (
            <div>
              <h3 className="font-medium mb-3">{t('memberships.selectMembership')}</h3>

              {isLoadingMemberships ? (
                <div className="p-4 text-center text-gray-400">
                  {t('memberships.loadingMemberships')}
                </div>
              ) : activeMemberships.length === 0 ? (
                <div
                  className="p-4 rounded-lg border flex items-center space-x-2"
                  style={{ backgroundColor: 'var(--color-dark-12)', borderColor: 'var(--color-red-30)' }}
                >
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400">{t('memberships.noActiveMemberships')}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeMemberships.map((membership) => (
                    <div
                      key={membership.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedMembership?.id === membership.id
                          ? 'ring-2 ring-brown-60'
                          : 'hover:bg-opacity-50 hover:bg-gray-600'
                      }`}
                      style={{
                        backgroundColor: 'var(--color-dark-12)',
                        borderColor: selectedMembership?.id === membership.id
                          ? 'var(--color-brown-60)'
                          : 'var(--color-dark-25)'
                      }}
                      onClick={() => setSelectedMembership(membership)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <CreditCard className="w-4 h-4 text-blue-400" />
                            <span className="font-medium">
                              {t('memberships.membership')} #{membership.id.substring(0, 8)}
                            </span>
                            {selectedMembership?.id === membership.id && (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-400 mb-1">{t('memberships.validityPeriod')}:</div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span>
                                  {formatDate(membership.start_date)} - {formatDate(membership.end_date)}
                                </span>
                              </div>
                            </div>

                            <div>
                              <div className="text-gray-400 mb-1">{t('memberships.visits')}:</div>
                              <div className={`font-medium ${getMembershipStatusColor(membership)}`}>
                                {membership.max_visits
                                  ? `${membership.used_visits} / ${membership.max_visits}`
                                  : `${membership.used_visits} / ${t('memberships.unlimited')}`}
                              </div>
                            </div>
                          </div>

                          {/* Прогресс-бар для абонементов с ограничением */}
                          {membership.max_visits && (
                            <div className="mt-3">
                              <div className="w-full bg-gray-600 rounded-full h-2">
                                <div
                                  className="bg-brown-60 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${getMembershipProgress(membership)}%`,
                                    backgroundColor: membership.used_visits >= membership.max_visits
                                      ? 'var(--color-red-50)'
                                      : 'var(--color-brown-60)'
                                  }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>{t('memberships.used')}: {membership.used_visits}</span>
                                <span>{t('memberships.remaining')}: {membership.max_visits - membership.used_visits}</span>
                              </div>
                            </div>
                          )}

                          {/* Предупреждение если абонемент исчерпан */}
                          {membership.max_visits && membership.used_visits >= membership.max_visits && (
                            <div className="mt-2 flex items-center space-x-1 text-red-400 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              <span>{t('memberships.membershipExhausted')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Заметки */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('visits.form.notes')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60 resize-none"
              style={{
                backgroundColor: 'var(--color-dark-12)',
                borderColor: 'var(--color-dark-20)',
                color: 'var(--color-gray-97)'
              }}
              placeholder={t('visits.form.notesPlaceholder')}
            />
          </div>

          {/* Кнопки */}
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
              disabled={!selectedUser || !selectedMembership || isSubmitting}
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--color-brown-60)', color: 'white' }}
            >
              {isSubmitting ? t('creating') : t('createVisit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVisitModal;