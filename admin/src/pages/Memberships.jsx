import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, X, Clock, Calendar, User, CheckCircle, XCircle, Pause, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import membershipService from "../services/membershipService.js";
import AddMembershipModal from "../components/Modals/AddMembershipModal.jsx";

const MembershipsCRUD = () => {
  const { t } = useTranslation();
  const [memberships, setMemberships] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMembership, setCurrentMembership] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [membershipToDelete, setMembershipToDelete] = useState(null);
  const [addMembershipModalOpen, setAddMembershipModalOpen] = useState(false);
  // Получение списка абонементов
  const getMemberships = async (page = 1, limit = 10, filters = {}) => {
    try {
      setIsLoading(true);
      const response = await membershipService.getMemberships({ page, limit, status: statusFilter !== 'all' ? statusFilter : undefined, user_name: searchTerm || undefined });
      setMemberships(response.data || []);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      });
    } catch (error) {
      console.error('Error fetching memberships:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    getMemberships();
  }, [statusFilter, searchTerm]);

  // Обработчики пагинации
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      getMemberships(newPage, pagination.limit);
    }
  };

  const handleLimitChange = (newLimit) => {
    getMemberships(1, newLimit);
  };

  // Открытие модального окна
  const openModal = (membership = null) => {
    setCurrentMembership(membership);
    setIsEditing(!!membership);
    setIsModalOpen(true);
  };

  // Закрытие модального окна
  const closeModal = () => {
    setAddMembershipModalOpen(false)
    setIsModalOpen(false);
    setCurrentMembership(null);
    setIsEditing(false);
  };

  // Обработчик удаления
  const handleDelete = (membership) => {
    setMembershipToDelete(membership);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await membershipService.deleteMembership(membershipToDelete.id);
      setMemberships(memberships.filter(m => m.id !== membershipToDelete.id));
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1,
        totalPages: Math.ceil((prev.total - 1) / prev.limit)
      }));
      setIsDeleteConfirmOpen(false);
      setMembershipToDelete(null);
    } catch (error) {
      console.error('Error deleting membership:', error);
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Иконка статуса
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'expired': return <Clock className="w-4 h-4 text-orange-400" />;
      case 'frozen': return <Pause className="w-4 h-4 text-blue-400" />;
      default: return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  // Пагинация
  const PaginationControls = () => {
    const { page, totalPages, total, limit } = pagination;
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        if (page <= 3) {
          pages.push(...[1, 2, 3, 4, '...', totalPages]);
        } else if (page >= totalPages - 2) {
          pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
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
              style={{ backgroundColor: 'var(--color-dark-12)', borderColor: 'var(--color-dark-20)', color: 'var(--color-gray-97)' }}
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
            style={{ backgroundColor: 'var(--color-dark-12)', borderColor: 'var(--color-dark-20)' }}
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
                    className={`px-3 py-2 rounded border text-sm font-medium transition-colors ${page === pageNum ? 'text-white' : 'hover:bg-opacity-50'}`}
                    style={page === pageNum ? { backgroundColor: 'var(--color-brown-60)', borderColor: 'var(--color-brown-60)', color: 'white' } : { backgroundColor: 'var(--color-dark-12)', borderColor: 'var(--color-dark-20)' }}
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
            style={{ backgroundColor: 'var(--color-dark-12)', borderColor: 'var(--color-dark-20)' }}
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
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('memberships.membershipsManagement')}</h1>
          <p className="text-gray-70">{t('memberships.manageAllMemberships')}</p>
        </div>

        {/* Фильтры и поиск */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-50" />
            <input
              type="text"
              placeholder={t('searchAndFilters.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60 transition-colors"
              style={{ backgroundColor: 'var(--color-dark-12)', borderColor: 'var(--color-dark-20)', color: 'var(--color-gray-97)' }}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-50" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60 appearance-none min-w-[140px]"
                style={{ backgroundColor: 'var(--color-dark-12)', borderColor: 'var(--color-dark-20)', color: 'var(--color-gray-97)' }}
              >
                <option value="all">{t('searchAndFilters.allStatuses')}</option>
                <option value="active">{t('statuses.active')}</option>
                <option value="expired">{t('statuses.expired')}</option>
                <option value="frozen">{t('statuses.frozen')}</option>
              </select>
            </div>
            <button
              onClick={() =>  setAddMembershipModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brown-60)', color: 'white' }}
            >
              <Plus className="w-4 h-4" />
              <span>{t('searchAndFilters.addMembership')}</span>
            </button>
          </div>
        </div>

        {/* Таблица для десктопа */}
        {!isLoading && (
          <div className="hidden lg:block overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--color-dark-20)' }}>
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-dark-12)' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.user')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.tariff')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.status')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.dates')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.visits')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.actions')}</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--color-dark-10)' }}>
                {memberships.map((membership) => (
                  <tr
                    key={membership.id}
                    className="border-t hover:bg-opacity-50"
                    style={{ borderColor: 'var(--color-dark-20)' }}
                    onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = 'var(--color-dark-12)'}
                    onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = 'var(--color-dark-10)'}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-97">{membership?.user_name || 'N/A'}</div>
                          <div className="text-xs text-gray-70">ID: {membership.user_id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-97">{membership?.tariff_code || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(membership.status)}
                        <span className="text-sm">{t(`statuses.${membership.status}`)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-70">
                      {formatDate(membership.start_date)} - {formatDate(membership.end_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-70">
                      {membership.used_visits}/{membership.max_visits || '∞'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(membership)}
                          className="p-2 rounded-lg transition-colors hover:bg-opacity-50"
                          style={{ backgroundColor: 'var(--color-dark-20)' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-brown-95)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-dark-20)'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(membership)}
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

        {/* Мобильные карточки */}
        {!isLoading && (
          <div className="lg:hidden space-y-4">
            {memberships.map((membership) => (
              <div
                key={membership.id}
                className="p-4 rounded-lg border"
                style={{ backgroundColor: 'var(--color-dark-10)', borderColor: 'var(--color-dark-20)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-medium text-gray-97">{membership?.user_name || 'N/A'}</div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(membership.status)}
                      <span className="text-sm">{t(`statuses.${membership.status}`)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="text-sm">Тариф: {membership?.tariff_code || 'N/A'}</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-50" />
                    <span className="text-sm">{formatDate(membership.start_date)} - {formatDate(membership.end_date)}</span>
                  </div>
                  <div className="text-sm">Посещения: {membership.used_visits}/{membership.max_visits || '∞'}</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => openModal(membership)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-colors"
                    style={{ borderColor: 'var(--color-brown-60)', color: 'var(--color-brown-60)' }}
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>{t('edit')}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(membership)}
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

        {/* Пагинация */}
        {!isLoading && pagination.totalPages > 1 && <PaginationControls />}

        {/* Пустое состояние */}
        {!isLoading && memberships.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-dark-15)' }}>
              <User className="w-8 h-8 text-gray-50" />
            </div>
            <h3 className="text-lg font-medium mb-2">{t('noMembershipsFound')}</h3>
            <p className="text-gray-70 mb-4">{t('tryAdjusting')}</p>
            <button
              onClick={() => openModal()}
              className="px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brown-60)', color: 'white' }}
            >
              {t('addFirstMembership')}
            </button>
          </div>
        )}

        {/* Модальное окно */}

        <AddMembershipModal isOpen={addMembershipModalOpen} onClose={closeModal}/>


        {/*{isModalOpen && (*/}
        {/*  <AddMembershipModal*/}
        {/*    isOpen={isModalOpen}*/}
        {/*    onClose={closeModal}*/}
        {/*    membership={currentMembership}*/}
        {/*    isEditing={isEditing}*/}
        {/*    onSubmit={async (data) => {*/}
        {/*      try {*/}
        {/*        if (isEditing) {*/}
        {/*          await membershipService.updateMembership(currentMembership.id, data);*/}
        {/*          setMemberships(memberships.map(m => m.id === currentMembership.id ? { ...m, ...data } : m));*/}
        {/*        } else {*/}
        {/*          await membershipService.createMembership(data);*/}
        {/*          getMemberships(pagination.page, pagination.limit);*/}
        {/*        }*/}
        {/*        closeModal();*/}
        {/*      } catch (error) {*/}
        {/*        console.error('Error submitting form:', error);*/}
        {/*      }*/}
        {/*    }}*/}
        {/*  />*/}
        {/*)}*/}

        {/* Подтверждение удаления */}
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }} onClick={() => setIsDeleteConfirmOpen(false)}></div>
            <div className="relative w-full max-w-md rounded-lg border" style={{ backgroundColor: 'var(--color-dark-10)', borderColor: 'var(--color-dark-20)' }}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-brown-95)' }}>
                    <AlertCircle className="w-6 h-6" style={{ color: 'var(--color-brown-60)' }} />
                  </div>
                  <h3 className="text-lg font-bold">{t('deleteConfirmation.confirmDeletion')}</h3>
                </div>
                <p className="text-gray-70 mb-6">{t('deleteConfirmation.deleteMembershipConfirm')}</p>
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
    </div>
  );
};

export default MembershipsCRUD;