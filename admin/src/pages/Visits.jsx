import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  X,
  Clock,
  Calendar,
  User,
  CreditCard,
  QrCode,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  MapPin,
  FileText,
  TicketSlash
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import visitService from "../services/visitService.js";
import AddVisitModal from "../components/Modals/AddVisitModal.jsx";

const VisitsCRUD = () => {
  const { t, language } = useTranslation();
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVisit, setCurrentVisit] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [checkinMethodFilter, setCheckinMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState(null);
  const [isAddingVisit, setIsAddingVisit] = useState(false);

  // Пагинация
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Фильтры
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    userId: '',
    membershipId: '',
    userName: '',
    today: false
  });

  const [formData, setFormData] = useState({
    userId: '',
    membershipId: '',
    notes: ''
  });

  // Получение списка посещений
  const getVisits = async (page = 1, limit = 10, additionalFilters = {}) => {
    try {
      setIsLoading(true);
      const { visits: visitsData, pagination: paginationData } = await visitService.getVisits({
        page,
        limit,
        ...filters,
        ...additionalFilters
      });
      setVisits(visitsData);
      setPagination(paginationData);
    } catch (error) {
      console.error('Error fetching visits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчики пагинации
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      getVisits(newPage, pagination.limit);
    }
  };

  const handleLimitChange = (newLimit) => {
    getVisits(1, newLimit);
  };

  // Применение фильтров
  const applyFilters = () => {
    getVisits(1, pagination.limit, filters);
  };

  // Сброс фильтров
  const resetFilters = () => {
    const resetFilters = {
      dateFrom: '',
      dateTo: '',
      userId: '',
      membershipId: '',
      userName: '',
      today: false
    };
    setFilters(resetFilters);
    setSearchTerm('');
    setCheckinMethodFilter('all');
    setDateFilter('all');
    getVisits(1, pagination.limit, resetFilters);
  };

  useEffect(() => {
    getVisits();
  }, []);

  // Опции для фильтров
  const checkinMethods = [
    { value: 'qr', label: t('visits.checkinMethods.qr') },
    { value: 'manual', label: t('visits.checkinMethods.manual') },
    { value: 'admin', label: t('visits.checkinMethods.admin') }
  ];

  const dateFilterOptions = [
    { value: 'today', label: t('visits.dateFilters.today') },
    { value: 'week', label: t('visits.dateFilters.thisWeek') },
    { value: 'month', label: t('visits.dateFilters.thisMonth') },
    { value: 'custom', label: t('visits.dateFilters.custom') }
  ];

  // Локальная фильтрация для поиска
  const filteredVisits = visits.filter(visit => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      visit.user?.name?.toLowerCase().includes(searchLower) ||
      visit.user?.email?.toLowerCase().includes(searchLower) ||
      visit.notes?.toLowerCase().includes(searchLower) ||
      visit.id.toLowerCase().includes(searchLower)
    );
  }).filter(visit => {
    if (checkinMethodFilter === 'all') return true;
    return visit.checkin_method === checkinMethodFilter;
  });

  const openAddVisitModal = () => {
    setCurrentVisit(null);
    setIsEditing(false);
    setFormData({
      userId: '',
      membershipId: '',
      notes: ''
    });
    setIsAddingVisit(true);
  }

  // Модальное окно
  const openModal = (visit = null) => {
    setCurrentVisit(visit);
    setIsEditing(!!visit);
    if (visit) {
      setFormData({
        userId: visit.user_id || '',
        membershipId: visit.membership_id || '',
        notes: visit.notes || ''
      });
    } else {
      setFormData({
        userId: '',
        membershipId: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentVisit(null);
    setIsEditing(false);
  };

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await visitService.updateVisit(currentVisit.id, formData);
        // Обновляем локальное состояние
        setVisits(visits.map(visit =>
          visit.id === currentVisit.id
            ? { ...visit, ...formData, updated_at: new Date().toISOString() }
            : visit
        ));
      } else {
        await visitService.createManualVisit(formData);
        // Перезагружаем список
        getVisits(pagination.page, pagination.limit);
      }
      closeModal();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Удаление
  const handleDelete = (visit) => {
    setVisitToDelete(visit);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await visitService.deleteVisit(visitToDelete.id);
      setVisits(visits.filter(visit => visit.id !== visitToDelete.id));
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1,
        totalPages: Math.ceil((prev.total - 1) / prev.limit)
      }));
    } catch (error) {
      console.error('Error deleting visit:', error);
    }
    setIsDeleteConfirmOpen(false);
    setVisitToDelete(null);
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'uz' ? 'uz-UZ' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Иконка для способа входа
  const getCheckinIcon = (method) => {
    switch (method) {
      case 'qr': return <QrCode className="w-4 h-4 text-green-400" />;
      case 'manual': return <User className="w-4 h-4 text-blue-400" />;
      case 'admin': return <Users className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
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
            {t('pagination.showing')} {startItem}-{endItem} {t('pagination.of')} {total} {t('pagination.results')}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-70">{t('pagination.perPage')}:</span>
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-dark-06)', color: 'var(--color-gray-97)' }}>
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('visits.management')}</h1>
          <p className="text-gray-70">{t('visits.manageAllVisits')}</p>
        </div>

        {/* Advanced Filters */}
        <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-dark-10)', borderColor: 'var(--color-dark-20)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('visits.filters.dateFrom')}</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: 'var(--color-dark-12)',
                  borderColor: 'var(--color-dark-20)',
                  color: 'var(--color-gray-97)'
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('visits.filters.dateTo')}</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: 'var(--color-dark-12)',
                  borderColor: 'var(--color-dark-20)',
                  color: 'var(--color-gray-97)'
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('visits.filters.userName')}</label>
              <input
                type="text"
                placeholder={t('visits.filters.userNamePlaceholder')}
                value={filters.userName}
                onChange={(e) => setFilters({...filters, userName: e.target.value})}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: 'var(--color-dark-12)',
                  borderColor: 'var(--color-dark-20)',
                  color: 'var(--color-gray-97)'
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('visits.filters.membershipId')}</label>
              <input
                type="text"
                placeholder={t('visits.filters.membershipIdPlaceholder')}
                value={filters.membershipId}
                onChange={(e) => setFilters({...filters, membershipId: e.target.value})}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: 'var(--color-dark-12)',
                  borderColor: 'var(--color-dark-20)',
                  color: 'var(--color-gray-97)'
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilters({...filters, today: !filters.today})}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                filters.today ? 'text-white' : ''
              }`}
              style={filters.today ? {
                backgroundColor: 'var(--color-brown-60)',
                color: 'white'
              } : {
                backgroundColor: 'var(--color-dark-12)',
                borderColor: 'var(--color-dark-20)'
              }}
            >
              {t('visits.filters.todayOnly')}
            </button>

            <button
              onClick={applyFilters}
              className="px-4 py-2 rounded text-sm font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brown-60)', color: 'white' }}
            >
              {t('visits.filters.apply')}
            </button>

            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded border text-sm font-medium transition-colors"
              style={{ borderColor: 'var(--color-dark-30)', color: 'var(--color-gray-70)' }}
            >
              {t('visits.filters.reset')}
            </button>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-50" />
            <input
              type="text"
              placeholder={t('visits.searchPlaceholder')}
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
                value={checkinMethodFilter}
                onChange={(e) => setCheckinMethodFilter(e.target.value)}
                className="pl-10 pr-8 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60 appearance-none min-w-[140px]"
                style={{
                  backgroundColor: 'var(--color-dark-12)',
                  borderColor: 'var(--color-dark-20)',
                  color: 'var(--color-gray-97)'
                }}
              >
                <option value="all">{t('visits.filters.allMethods')}</option>
                {checkinMethods.map(method => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => openAddVisitModal()}
              className="flex max-md:grow-1 items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brown-60)', color: 'white' }}
            >
              <Plus className="w-4 h-4" />
              <span>{t('visits.addManualVisit')}</span>
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
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('visits.tableHeaders.user')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('visits.tableHeaders.membership')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('visits.tableHeaders.tariffCode')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('visits.tableHeaders.checkinMethod')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('visits.tableHeaders.checkinTime')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('visits.tableHeaders.notes')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('visits.tableHeaders.actions')}</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--color-dark-10)' }}>
                {filteredVisits.map((visit) => (
                  <tr
                    key={visit.id}
                    className="border-t hover:bg-opacity-50"
                    style={{
                      borderColor: 'var(--color-dark-20)',
                      '--tw-bg-opacity': '0.5'
                    }}
                    onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = 'var(--color-dark-12)'}
                    onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = 'var(--color-dark-10)'}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                          {visit.user?.avatar_url ? (
                            <img src={visit.user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-97">{visit?.user_name || t('visits.unknownUser')}</div>
                          <div className="text-xs text-gray-70">{visit.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-50" />
                        <span className="text-sm">{visit?.membership_id || t('visits.noMembership')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TicketSlash className="w-4 h-4 text-gray-50" />
                        <span className="text-sm">{visit?.tariff_code || t('visits.noTarifCode')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getCheckinIcon(visit.checkin_method)}
                        <span className="text-sm capitalize">{t(`visits.checkinMethods.${visit.checkin_method}`)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-70">
                      {formatDate(visit.visited_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-70">{visit.notes || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(visit)}
                          className="p-2 rounded-lg transition-colors hover:bg-opacity-50"
                          style={{ backgroundColor: 'var(--color-dark-20)' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-brown-95)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-dark-20)'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(visit)}
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
            {filteredVisits.map((visit) => (
              <div
                key={visit.id}
                className="p-4 rounded-lg border"
                style={{ backgroundColor: 'var(--color-dark-10)', borderColor: 'var(--color-dark-20)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                    {visit.user?.avatar_url ? (
                      <img src={visit.user.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-medium text-gray-97">{visit?.user_name || t('visits.unknownUser')}</div>
                    <div className="text-sm text-gray-70">{visit?.user_email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getCheckinIcon(visit.checkin_method)}
                    <span className="text-sm capitalize">{t(`visits.checkinMethods.${visit.checkin_method}`)}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <TicketSlash  className="w-4 h-4 text-gray-50" />
                    <span className="text-sm">{visit?.tariff_code || t('visits.noTarrifCode')}</span>
                    <span className={""}>({visit?.membership_status})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-50" />
                    <span className="text-sm">{visit?.membership_id || t('visits.noMembership')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-50" />
                    <span className="text-sm">{formatDate(visit.visited_at)}</span>
                  </div>
                  {visit.notes && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-50" />
                      <span className="text-sm">{visit.notes}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => openModal(visit)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-colors"
                    style={{ borderColor: 'var(--color-brown-60)', color: 'var(--color-brown-60)' }}
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>{t('common.edit')}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(visit)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-colors"
                    style={{ borderColor: 'var(--color-brown-60)', color: 'var(--color-brown-60)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t('common.delete')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && pagination.totalPages > 1 && <PaginationControls />}

        {/* Empty State */}
        {!isLoading && filteredVisits.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-dark-15)' }}>
              <MapPin className="w-8 h-8 text-gray-50" />
            </div>
            <h3 className="text-lg font-medium mb-2">{t('visits.noVisitsFound')}</h3>
            <p className="text-gray-70 mb-4">{t('visits.tryAdjusting')}</p>
            <button
              onClick={() => openModal()}
              className="px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brown-60)', color: 'white' }}
            >
              {t('visits.addFirstVisit')}
            </button>
          </div>
        )}
      </div>

      <AddVisitModal isOpen={isAddingVisit} onClose={() => setIsAddingVisit(false)} onSuccess={resetFilters} />

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
                {isEditing ? t('visits.editVisit') : t('visits.createManualVisit')}
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
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('visits.form.userId')}</label>
                  <input
                    type="text"
                    required
                    value={formData.userId}
                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                    style={{
                      backgroundColor: 'var(--color-dark-12)',
                      borderColor: 'var(--color-dark-20)',
                      color: 'var(--color-gray-97)'
                    }}
                    placeholder={t('visits.form.userIdPlaceholder')}
                  />
                  <p className="text-xs text-gray-70 mt-1">{t('visits.form.userIdHint')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('visits.form.membershipId')}</label>
                  <input
                    type="text"
                    value={formData.membershipId}
                    onChange={(e) => setFormData({...formData, membershipId: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                    style={{
                      backgroundColor: 'var(--color-dark-12)',
                      borderColor: 'var(--color-dark-20)',
                      color: 'var(--color-gray-97)'
                    }}
                    placeholder={t('visits.form.membershipIdPlaceholder')}
                  />
                  <p className="text-xs text-gray-70 mt-1">{t('visits.form.membershipIdHint')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('visits.form.notes')}</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t" style={{ borderColor: 'var(--color-dark-20)' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 rounded-lg border font-medium transition-colors"
                  style={{ borderColor: 'var(--color-dark-30)', color: 'var(--color-gray-70)' }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-brown-60)', color: 'white' }}
                >
                  {isEditing ? t('visits.updateVisit') : t('visits.createVisit')}
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
                <h3 className="text-lg font-bold">{t('visits.confirmDeletion')}</h3>
              </div>

              <p className="text-gray-70 mb-6">
                {t('visits.deleteVisitConfirm')}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border font-medium transition-colors"
                  style={{ borderColor: 'var(--color-dark-30)', color: 'var(--color-gray-70)' }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-brown-60)', color: 'white' }}
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitsCRUD;