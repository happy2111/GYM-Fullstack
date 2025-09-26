import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, X, Star, Clock, CreditCard, AlertCircle, ChevronLeft, ChevronRight, Tag, FileText, DollarSign, Calendar, Award } from 'lucide-react';
import tariffService from "../services/tariffService.js";
import {useTranslation} from "react-i18next";


const TariffsCRUD = () => {
  const { t, language } = useTranslation();
  const [tariffs, setTariffs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTariff, setCurrentTariff] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [tariffToDelete, setTariffToDelete] = useState(null);

  // Пагинация
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    price: '',
    duration_days: '',
    max_visits: '',
    features: '',
    is_best_offer: false
  });

  // Получение списка тарифов
  const getTariffs = async (page = 1, limit = 10) => {
    try {
      setIsLoading(true);
      const { tariffs: tariffsData, pagination: paginationData } = await tariffService.getAllTariffs({
        page,
        limit
      });
      setTariffs(tariffsData);
      setPagination(paginationData);
    } catch (error) {
      console.error('Error fetching tariffs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчики пагинации
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      getTariffs(newPage, pagination.limit);
    }
  };

  const handleLimitChange = (newLimit) => {
    getTariffs(1, newLimit);
  };

  useEffect(() => {
    getTariffs();
  }, []);

  // Локальная фильтрация для поиска и статуса
  const filteredTariffs = tariffs.filter(tariff => {
    const matchesSearch = !searchTerm || (
      tariff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tariff.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tariff.description && tariff.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'best' && tariff.is_best_offer) ||
      (statusFilter === 'regular' && !tariff.is_best_offer);

    return matchesSearch && matchesStatus;
  });

  // Модальное окно
  const openModal = (tariff = null) => {
    setCurrentTariff(tariff);
    setIsEditing(!!tariff);
    if (tariff) {
      setFormData({
        code: tariff.code || '',
        name: tariff.name || '',
        description: tariff.description || '',
        price: tariff.price?.toString() || '',
        duration_days: tariff.duration_days?.toString() || '',
        max_visits: tariff.max_visits?.toString() || '',
        features: tariff.features?.join('\n') || '',
        is_best_offer: tariff.is_best_offer || false
      });
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        price: '',
        duration_days: '',
        max_visits: '',
        features: '',
        is_best_offer: false
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTariff(null);
    setIsEditing(false);
  };

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        durationDays: parseInt(formData.duration_days),
        maxVisits: formData.max_visits ? parseInt(formData.max_visits) : null,
        features: formData.features ? formData.features.split('\n').filter(f => f.trim()) : []
      };

      if (isEditing) {
        await tariffService.updateTariff(currentTariff.id, submitData);
        setTariffs(tariffs.map(tariff =>
          tariff.id === currentTariff.id
            ? { ...tariff, ...submitData, updated_at: new Date().toISOString() }
            : tariff
        ));
      } else {
        const newTariff = await tariffService.createTariff(submitData);
        // Перезагружаем список после создания
        getTariffs(pagination.page, pagination.limit);
      }
      closeModal();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error saving tariff');
    }
  };

  // Удаление
  const handleDelete = (tariff) => {
    setTariffToDelete(tariff);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await tariffService.deleteTariff(tariffToDelete.id);
      setTariffs(tariffs.filter(tariff => tariff.id !== tariffToDelete.id));
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1,
        totalPages: Math.ceil((prev.total - 1) / prev.limit)
      }));
    } catch (error) {
      console.error('Error deleting tariff:', error);
      alert('Error deleting tariff');
    }
    setIsDeleteConfirmOpen(false);
    setTariffToDelete(null);
  };

  // Форматирование даты
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

  // Форматирование цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : 'en-US', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Компонент пагинации
  const PaginationControls = () => {
    const { page, totalPages, total, limit } = pagination;
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;

      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (page <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (page >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = page - 1; i <= page + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }

      return pages;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-dark-10)', borderColor: 'var(--color-dark-20)' }}>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-70">
            {t('showing')} {startItem}-{endItem} {t('of')} {total} {t('results')}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-70">{t('perPage')}:</span>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
              className="px-3 py-1 rounded border text-sm"
              style={{
                backgroundColor: 'var(--color-dark-12)',
                borderColor: 'var(--color-dark-20)',
                color: 'var(--color-gray-97)'
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isLoading}
            className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-50 transition-colors"
            style={{
              backgroundColor: 'var(--color-dark-12)',
              borderColor: 'var(--color-dark-20)'
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((pageNum, index) => (
              <React.Fragment key={index}>
                {pageNum === '...' ? (
                  <span className="px-3 py-2 text-gray-50">...</span>
                ) : (
                  <button
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isLoading}
                    className={`px-3 py-2 rounded border text-sm font-medium transition-colors ${
                      page === pageNum
                        ? 'text-white'
                        : 'hover:bg-opacity-50'
                    }`}
                    style={page === pageNum ? {
                      backgroundColor: 'var(--color-brown-60)',
                      borderColor: 'var(--color-brown-60)',
                      color: 'white'
                    } : {
                      backgroundColor: 'var(--color-dark-12)',
                      borderColor: 'var(--color-dark-20)'
                    }}
                  >
                    {pageNum}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || isLoading}
            className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-50 transition-colors"
            style={{
              backgroundColor: 'var(--color-dark-12)',
              borderColor: 'var(--color-dark-20)'
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen " style={{ backgroundColor: 'var(--color-dark-06)', color: 'var(--color-gray-97)' }}>
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('tariffsManagement')}</h1>
          <p className="text-gray-70">{t('manageAllTariffs')}</p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-50" />
            <input
              type="text"
              placeholder={t('searchAndFilters.searchPlaceholder')}
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

          <div className="flex gap-2 flex-wrap">
            <div className="relative max-md:grow-1">
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
                <option value="all">{t('searchAndFilters.allTypes')}</option>
                <option value="best">{t('searchAndFilters.bestOffers')}</option>
                <option value="regular">{t('searchAndFilters.regularTariffs')}</option>
              </select>
            </div>

            <button
              onClick={() => openModal()}
              className="flex max-md:grow-1 items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brown-60)', color: 'white' }}
            >
              <Plus className="w-4 h-4" />
              <span>{t('searchAndFilters.addTariff')}</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-brown-60)' }}></div>
          </div>
        )}

        {/* Desktop Table */}
        {!isLoading && (
          <div className="hidden lg:block overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--color-dark-20)' }}>
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-dark-12)' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.tariff')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.price')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.duration')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.visits')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.status')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.created')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.actions')}</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--color-dark-10)' }}>
                {filteredTariffs.map((tariff) => (
                  <tr
                    key={tariff.id}
                    className="border-t hover:bg-opacity-50"
                    style={{
                      borderColor: 'var(--color-dark-20)',
                      '--tw-bg-opacity': '0.5'
                    }}
                    onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = 'var(--color-dark-12)'}
                    onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = 'var(--color-dark-10)'}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brown-60 to-brown-70 flex items-center justify-center">
                          <Tag className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-97 flex items-center gap-2">
                            {tariff.name}
                            {tariff.is_best_offer && (
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            )}
                          </div>
                          <div className="text-xs text-gray-70">#{tariff.code}</div>
                          {tariff.description && (
                            <div className="text-xs text-gray-70 mt-1 max-w-xs truncate">
                              {tariff.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/*<DollarSign className="w-4 h-4 text-green-400" />*/}
                        <span className="text-sm font-medium text-green-400">
                          {formatPrice(tariff.price)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">{tariff.duration_days} {t('days')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-purple-400" />
                        <span className="text-sm">
                          {tariff.max_visits ? tariff.max_visits : t('unlimited')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {tariff.is_best_offer ? (
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-yellow-400">{t('bestOffers')}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-70">{t('regularTariffs')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-70">
                      {formatDate(tariff.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(tariff)}
                          className="p-2 rounded-lg transition-colors hover:bg-opacity-50"
                          style={{ backgroundColor: 'var(--color-dark-20)' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-brown-95)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-dark-20)'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tariff)}
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
        )}

        {/* Mobile Cards */}
        {!isLoading && (
          <div className="lg:hidden space-y-4">
            {filteredTariffs.map((tariff) => (
              <div
                key={tariff.id}
                className="p-4 rounded-lg border"
                style={{ backgroundColor: 'var(--color-dark-10)', borderColor: 'var(--color-dark-20)' }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brown-60 to-brown-70 flex items-center justify-center">
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-medium text-gray-97 flex items-center gap-2">
                      {tariff.name}
                      {tariff.is_best_offer && (
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      )}
                    </div>
                    <div className="text-sm text-gray-70">#{tariff.code}</div>
                    {tariff.description && (
                      <div className="text-sm text-gray-70 mt-1">{tariff.description}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      {formatPrice(tariff.price)}
                    </div>
                    {tariff.is_best_offer && (
                      <div className="text-xs text-yellow-400">{t('bestOffers')}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-xs text-gray-70">{t('duration')}</div>
                      <div className="text-sm">{tariff.duration_days} {t('days')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-xs text-gray-70">{t('visits')}</div>
                      <div className="text-sm">
                        {tariff.max_visits ? tariff.max_visits : t('unlimited')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                {tariff.features && tariff.features.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-70 mb-1">{t('features')}:</div>
                    <div className="flex flex-wrap gap-1">
                      {tariff.features.slice(0, 3).map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: 'var(--color-dark-20)', color: 'var(--color-gray-70)' }}
                        >
                          {feature}
                        </span>
                      ))}
                      {tariff.features.length > 3 && (
                        <span
                          className="px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: 'var(--color-dark-20)', color: 'var(--color-gray-70)' }}
                        >
                          +{tariff.features.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-70 mb-3">
                  {t('created')}: {formatDate(tariff.created_at)}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(tariff)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-colors"
                    style={{ borderColor: 'var(--color-brown-60)', color: 'var(--color-brown-60)' }}
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>{t('edit')}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(tariff)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-colors"
                    style={{ borderColor: 'var(--color-brown-60)', color: 'var(--color-brown-60)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t('delete')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && pagination.totalPages > 1 && <PaginationControls />}

        {/* Empty State */}
        {!isLoading && filteredTariffs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-dark-15)' }}>
              <Tag className="w-8 h-8 text-gray-50" />
            </div>
            <h3 className="text-lg font-medium mb-2">{t('noTariffsFound')}</h3>
            <p className="text-gray-70 mb-4">{t('tryAdjusting')}</p>
            <button
              onClick={() => openModal()}
              className="px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brown-60)', color: 'white' }}
            >
              {t('addFirstTariff')}
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
            onClick={closeModal}
          ></div>

          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg border"
            style={{ backgroundColor: 'var(--color-dark-10)', borderColor: 'var(--color-dark-20)' }}
          >
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-dark-20)' }}>
              <h2 className="text-xl font-bold">
                {isEditing ? t('editTariff') : t('createTariff')}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--color-dark-15)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('code')}</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                    style={{
                      backgroundColor: 'var(--color-dark-12)',
                      borderColor: 'var(--color-dark-20)',
                      color: 'var(--color-gray-97)'
                    }}
                    placeholder={t('form.enterCode')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('name')}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                    style={{
                      backgroundColor: 'var(--color-dark-12)',
                      borderColor: 'var(--color-dark-20)',
                      color: 'var(--color-gray-97)'
                    }}
                    placeholder={t('form.enterName')}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">{t('description')}</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="2"
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60 resize-none"
                    style={{
                      backgroundColor: 'var(--color-dark-12)',
                      borderColor: 'var(--color-dark-20)',
                      color: 'var(--color-gray-97)'
                    }}
                    placeholder={t('form.enterDescription')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('tariffDetails.priceAmount')}</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                    style={{
                      backgroundColor: 'var(--color-dark-12)',
                      borderColor: 'var(--color-dark-20)',
                      color: 'var(--color-gray-97)'
                    }}
                    placeholder={t('form.enterPrice')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('tariffDetails.durationDays')}</label>
                  <input
                    type="number"
                    required
                    value={formData.duration_days}
                    onChange={(e) => setFormData({...formData, duration_days: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                    style={{
                      backgroundColor: 'var(--color-dark-12)',
                      borderColor: 'var(--color-dark-20)',
                      color: 'var(--color-gray-97)'
                    }}
                    placeholder={t('form.enterDuration')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('tariffDetails.maxVisits')}</label>
                  <input
                    type="number"
                    value={formData.max_visits}
                    onChange={(e) => setFormData({...formData, max_visits: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                    style={{
                      backgroundColor: 'var(--color-dark-12)',
                      borderColor: 'var(--color-dark-20)',
                      color: 'var(--color-gray-97)'
                    }}
                    placeholder={t('form.enterMaxVisits')}
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_best_offer}
                      onChange={(e) => setFormData({...formData, is_best_offer: e.target.checked})}
                      className="w-4 h-4 rounded border focus:ring-2 focus:ring-brown-60"
                      style={{
                        backgroundColor: 'var(--color-dark-12)',
                        borderColor: 'var(--color-dark-20)'
                      }}
                    />
                    <span className="text-sm font-medium">{t('form.markAsBestOffer')}</span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">{t('tariffDetails.featuresLabel')}</label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData({...formData, features: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60 resize-none"
                    style={{
                      backgroundColor: 'var(--color-dark-12)',
                      borderColor: 'var(--color-dark-20)',
                      color: 'var(--color-gray-97)'
                    }}
                    placeholder={t('form.enterFeatures')}
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
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-brown-60)', color: 'white' }}
                >
                  {isEditing ? t('updateTariff') : t('createTariff')}
                </button>
              </div>
            </form>
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
                <h3 className="text-lg font-bold">{t('confirmDeletion')}</h3>
              </div>

              <p className="text-gray-70 mb-6">
                {t('deleteTariffConfirm')}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border font-medium transition-colors"
                  style={{ borderColor: 'var(--color-dark-30)', color: 'var(--color-gray-70)' }}
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-brown-60)', color: 'white' }}
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TariffsCRUD;