import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Eye, X, Check, Clock, AlertCircle, User, Mail, Phone, Calendar, Users, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import UsersService from "../services/usersService.js"
import userStore from "@/store/userStore.js";

const userService = {
  verifyUser: (userId) => new Promise((resolve) => {
    setTimeout(() => {
      resolve({ message: 'User verified successfully' });
    }, 1000);
  })
};

const UsersCRUD = () => {
  const { t, language, setLanguage } = useTranslation();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    date_of_birth: '',
    gender: '',
    role: 'client',
    google_id: '',
    telegram_id: '',
    avatar_url: '',
    telegram_photo_url: ''
  });


  const getUsers = async (page = 1, limit = 10) => {
    try {
      setIsLoading(true);
      const { users, pagination: paginationData } = await UsersService.getAllUsers({ page, limit });
      setUsers(users);
      setPagination(paginationData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      getUsers(newPage, pagination.limit);
    }
  };

  const handleLimitChange = (newLimit) => {
    getUsers(1, newLimit);
  };

  const handleVerifyUser = async (user) => {
    try {
      setIsLoading(true);
      await userService.verifyUser(user.id);
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id ? { ...u, is_verified: true } : u
        )
      );
    } catch (error) {
      console.error('Error verifying user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const userRoles = [
    { value: 'admin', label: t('admin') },
    { value: 'client', label: t('client') },
    { value: 'trainer', label: t('trainer') }
  ];

  const genders = [
    { value: 'male', label: t('male') },
    { value: 'female', label: t('female') },
    { value: 'other', label: t('other') }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'verified' && user.is_verified) ||
      (statusFilter === 'unverified' && !user.is_verified);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const openModal = (user = null) => {
    setCurrentUser(user);
    setIsEditing(!!user);
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
        role: user.role || 'client',
        google_id: user.google_id || '',
        telegram_id: user.telegram_id ? user.telegram_id.toString() : '',
        avatar_url: user.avatar_url || '',
        telegram_photo_url: user.telegram_photo_url || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        date_of_birth: '',
        gender: '',
        role: 'client',
        google_id: '',
        telegram_id: '',
        avatar_url: '',
        telegram_photo_url: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
    setIsEditing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const now = new Date().toISOString();

    if (isEditing) {
      setUsers(users.map(user =>
        user.id === currentUser.id
          ? {
            ...user,
            ...formData,
            telegram_id: formData.telegram_id ? parseInt(formData.telegram_id) : null,
            updated_at: now
          }
          : user
      ));
    } else {
      const newUser = {
        id: crypto.randomUUID(),
        ...formData,
        telegram_id: formData.telegram_id ? parseInt(formData.telegram_id) : null,
        is_verified: false,
        created_at: now,
        updated_at: now
      };
      setUsers([...users, newUser]);
      // Обновить пагинацию после добавления
      setPagination(prev => ({
        ...prev,
        total: prev.total + 1,
        totalPages: Math.ceil((prev.total + 1) / prev.limit)
      }));
    }
    closeModal();
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    setUsers(users.filter(user => user.id !== userToDelete.id));
    // Обновить пагинацию после удаления
    setPagination(prev => ({
      ...prev,
      total: prev.total - 1,
      totalPages: Math.ceil((prev.total - 1) / prev.limit)
    }));
    setIsDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'uz' ? 'uz-UZ' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4 text-red-400" />;
      case 'manager': return <Users className="w-4 h-4 text-blue-400" />;
      default: return <User className="w-4 h-4 text-green-400" />;
    }
  };

  const getStatusIcon = (isVerified) => {
    return isVerified ?
      <Check className="w-4 h-4 text-green-400" /> :
      <Clock className="w-4 h-4 text-yellow-400" />;
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
        {/* Информация о записях */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-70">
            {t('showing')} {startItem}-{endItem} {t('of')} {total} {t('results')}
          </span>

          {/* Количество записей на странице */}
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

        {/* Навигация по страницам */}
        <div className="flex items-center gap-2">
          {/* Предыдущая страница */}
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

          {/* Номера страниц */}
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

          {/* Следующая страница */}
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
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('usersManagement')}</h1>
          <p className="text-gray-70">{t('manageAllUsers')}</p>
        </div>

        {/* Controls */}
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
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-10 pr-8 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60 appearance-none min-w-[140px]"
                style={{
                  backgroundColor: 'var(--color-dark-12)',
                  borderColor: 'var(--color-dark-20)',
                  color: 'var(--color-gray-97)'
                }}
              >
                <option value="all">{t('searchAndFilters.allRoles')}</option>
                {userRoles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>

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
                <option value="all">{t('searchAndFilters.allStatuses')}</option>
                <option value="verified">{t('statuses.verified')}</option>
                <option value="unverified">{t('statuses.unverified')}</option>
              </select>
            </div>

            <button
              onClick={() => openModal()}
              className="flex max-md:grow-1 items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brown-60)', color: 'white' }}
            >
              <Plus className="w-4 h-4" />
              <span className="">{t('searchAndFilters.addUser')}</span>
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
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.user')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.contact')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.role')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.status')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.joined')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-70 uppercase tracking-wider">{t('tableHeaders.actions')}</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--color-dark-10)' }}>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
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
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-97">{user.name}</div>
                          <div className="text-xs text-gray-70">ID: {user.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-97">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-70 mt-1">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="text-sm capitalize">{t(user.role)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(user.is_verified)}
                        <span className="text-sm">{user.is_verified ? t('verified') : t('unverified')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-70">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          disabled={user.is_verified}
                          onClick={() => handleVerifyUser(user)}
                          className={`p-2 rounded-lg hover:bg-opacity-50 hover:scale-104 active:scale-106 duration-150 transition-all ${user.is_verified ? 'opacity-50 cursor-not-allowed' : 'bg-opacity-0'}`}
                          style={{ backgroundColor: `${user.is_verified ? 'yellowgreen' : 'var(--color-dark-20)'}` }}
                        >
                          {isLoading ? <div className="w-4 h-4">...</div> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openModal(user)}
                          className="p-2 rounded-lg transition-colors hover:bg-opacity-50"
                          style={{ backgroundColor: 'var(--color-dark-20)' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-brown-95)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-dark-20)'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
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
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 rounded-lg border"
                style={{ backgroundColor: 'var(--color-dark-10)', borderColor: 'var(--color-dark-20)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-medium text-gray-97">{user.name}</div>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <span className="text-sm capitalize">{t(user.role)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(user.is_verified)}
                    <span className="text-sm">{user.is_verified ? t('verified') : t('unverified')}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-50" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-50" />
                      <span className="text-sm">{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-50" />
                    <span className="text-sm">{formatDate(user.created_at)}</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => openModal(user)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-colors"
                    style={{ borderColor: 'var(--color-brown-60)', color: 'var(--color-brown-60)' }}
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>{t('edit')}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-colors"
                    style={{ borderColor: 'var(--color-brown-60)', color: 'var(--color-brown-60)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t('delete')}</span>
                  </button>
                </div>
                <button
                  disabled={user.is_verified}
                  onClick={() => handleVerifyUser(user)}
                  className={`py-2 mt-2 flex items-center justify-center gap-2 rounded-lg hover:bg-opacity-50 min-w-full hover:scale-104 active:scale-106 duration-150 transition-all ${user.is_verified ? 'opacity-50 cursor-not-allowed' : 'bg-opacity-0'}`}
                  style={{ backgroundColor: `${user.is_verified ? 'yellowgreen' : 'var(--color-dark-20)'}` }}
                >
                  {isLoading ? <div className="w-4 h-4">...</div> : <Check className="w-4 h-4" />}
                  <span>{t('verify')}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && pagination.totalPages > 1 && <PaginationControls />}

        {/* Empty State */}
        {!isLoading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-dark-15)' }}>
              <Users className="w-8 h-8 text-gray-50" />
            </div>
            <h3 className="text-lg font-medium mb-2">{t('noUsersFound')}</h3>
            <p className="text-gray-70 mb-4">{t('tryAdjusting')}</p>
            <button
              onClick={() => openModal()}
              className="px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brown-60)', color: 'white' }}
            >
              {t('addFirstUser')}
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
                {isEditing ? t('editUser') : t('createUser')}
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
                    placeholder={t('enterName')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('email')}</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                    style={{
                      backgroundColor: 'var(--color-dark-12)',
                      borderColor: 'var(--color-dark-20)',
                      color: 'var(--color-gray-97)'
                    }}
                    placeholder={t('enterEmail')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('phone')}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                    style={{
                      backgroundColor: 'var(--color-dark-12)',
                      borderColor: 'var(--color-dark-20)',
                      color: 'var(--color-gray-97)'
                    }}
                    placeholder={t('enterPhone')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('password')}</label>
                  <input
                    type="password"
                    required={!isEditing}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                    style={{
                      backgroundColor: 'var(--color-dark-12)',
                      borderColor: 'var(--color-dark-20)',
                      color: 'var(--color-gray-97)'
                    }}
                    placeholder={t('enterPassword')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('dateOfBirth')}</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                    style={{
                      backgroundColor: 'var(--color-dark-12)',
                      borderColor: 'var(--color-dark-20)',
                      color: 'var(--color-gray-97)'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('gender')}</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                    style={{
                      backgroundColor: 'var(--color-dark-12)',
                      borderColor: 'var(--color-dark-20)',
                      color: 'var(--color-gray-97)'
                    }}
                  >
                    <option value="">{t('selectGender')}</option>
                    {genders.map(gender => (
                      <option key={gender.value} value={gender.value}>{gender.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('role')}</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                    style={{
                      backgroundColor: 'var(--color-dark-12)',
                      borderColor: 'var(--color-dark-20)',
                      color: 'var(--color-gray-97)'
                    }}
                  >
                    {userRoles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('telegramId')}</label>
                  <input
                    type="number"
                    value={formData.telegram_id}
                    onChange={(e) => setFormData({...formData, telegram_id: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                    style={{
                      backgroundColor: 'var(--color-dark-12)',
                      borderColor: 'var(--color-dark-20)',
                      color: 'var(--color-gray-97)'
                    }}
                    placeholder={t('enterTelegramId')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('avatarUrl')}</label>
                  <input
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                    style={{
                      backgroundColor: 'var(--color-dark-12)',
                      borderColor: 'var(--color-dark-20)',
                      color: 'var(--color-gray-97)'
                    }}
                    placeholder={t('enterAvatarUrl')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('telegramPhotoUrl')}</label>
                  <input
                    type="url"
                    value={formData.telegram_photo_url}
                    onChange={(e) => setFormData({...formData, telegram_photo_url: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                    style={{
                      backgroundColor: 'var(--color-dark-12)',
                      borderColor: 'var(--color-dark-20)',
                      color: 'var(--color-gray-97)'
                    }}
                    placeholder={t('enterTelegramPhoto')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('googleId')}</label>
                  <input
                    type="text"
                    value={formData.google_id}
                    onChange={(e) => setFormData({...formData, google_id: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brown-60 focus:border-brown-60"
                    style={{
                      backgroundColor: 'var(--color-dark-12)',
                      borderColor: 'var(--color-dark-20)',
                      color: 'var(--color-gray-97)'
                    }}
                    placeholder={t('enterGoogleId')}
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
                  {isEditing ? t('updateUser') : t('createUser')}
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
                {t('deleteUserConfirm')}
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

export default UsersCRUD;