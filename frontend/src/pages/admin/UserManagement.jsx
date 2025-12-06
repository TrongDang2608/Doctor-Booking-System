import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import userService from '../../services/userService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import feather from 'feather-icons';

const UserManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'detail', 'delete'
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'PATIENT',
    enabled: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordChangeId, setPasswordChangeId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadAllUsers();
  }, []);

  // Initialize Feather Icons
  useEffect(() => {
    feather.replace();
  }, [users, showForm, viewMode]);

  // Determine view mode based on URL
  useEffect(() => {
    const path = location.pathname;
    
    if (path.endsWith('/create')) {
      setViewMode('create');
      setShowForm(true);
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'PATIENT',
        enabled: true
      });
      setFormErrors({});
    } else if (path.includes('/delete')) {
      setViewMode('delete');
      setShowForm(false);
    } else if (path.includes('/edit')) {
      setViewMode('edit');
      setShowForm(true);
    } else if (id && !path.includes('/edit') && !path.includes('/delete')) {
      setViewMode('detail');
      setShowForm(false);
    } else {
      setViewMode('list');
      setShowForm(false);
      setEditingUser(null);
    }
  }, [id, location.pathname]);

  // Load user data when viewing/editing from URL
  useEffect(() => {
    if (id && allUsers.length > 0 && (viewMode === 'edit' || viewMode === 'detail' || viewMode === 'delete')) {
      const user = allUsers.find(u => u.id === parseInt(id));
      if (user) {
        setEditingUser(user);
        if (viewMode === 'edit') {
          setFormData({
            username: user.username,
            email: user.email,
            password: '',
            role: user.role,
            enabled: user.enabled
          });
          setFormErrors({});
        }
      }
    }
  }, [id, allUsers, viewMode]);

  const filteredUsers = useMemo(() => {
    let filtered = allUsers;

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.role?.toLowerCase().includes(term)
      );
    }

    // Filter by role
    if (filterRole !== 'ALL') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Filter by status
    if (filterStatus !== 'ALL') {
      const isActive = filterStatus === 'ACTIVE';
      filtered = filtered.filter(user => user.enabled === isActive);
    }

    return filtered;
  }, [searchTerm, filterRole, filterStatus, allUsers]);

  useEffect(() => {
    setUsers(filteredUsers);

  }, [filteredUsers]);

  const loadAllUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers('');
      setAllUsers(data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/admin/users/create');
  };

  const handleView = (user) => {
    navigate(`/admin/users/${user.id}`);
  };

  const handleEdit = (user) => {
    navigate(`/admin/users/${user.id}/edit`);
  };

  const handleDeleteClick = (user) => {
    navigate(`/admin/users/${user.id}/delete`);
  };

  const handleDeleteConfirm = async () => {
    if (!editingUser) return;

    try {
      await userService.deleteUser(editingUser.id);
      toast.success('Xóa người dùng thành công!', { position: 'top-right', autoClose: 3000 });
      setViewMode('list');
      setEditingUser(null);
      setShowForm(false);
      loadAllUsers();
      setError('');
      navigate('/admin/users');
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : 'Không thể xóa người dùng';
      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right', autoClose: 4000 });
      console.error(err);
    }
  };

  const handleDeleteCancel = () => {
    setViewMode('list');
    setEditingUser(null);
    setShowForm(false);
    navigate('/admin/users');
  };

  const handleToggleStatus = async (id) => {
    try {
      await userService.toggleUserStatus(id);
      toast.success('Cập nhật trạng thái thành công!', { position: 'top-right', autoClose: 2500 });
      loadAllUsers();
      setError('');
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : 'Không thể cập nhật trạng thái';
      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right', autoClose: 4000 });
      console.error(err);
    }
  };

  const handlePasswordChange = (id) => {
    setPasswordChangeId(id);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async () => {
    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự', { position: 'top-right', autoClose: 4000 });
      return;
    }

    try {
      await userService.changeUserPassword(passwordChangeId, newPassword);
      setShowPasswordModal(false);
      setPasswordChangeId(null);
      setNewPassword('');
      setError('');
      toast.success('Đổi mật khẩu thành công!', { position: 'top-right', autoClose: 3000 });
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : 'Không thể đổi mật khẩu';
      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right', autoClose: 4000 });
      console.error(err);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'Tên đăng nhập không được để trống';
    } else if (formData.username.length < 3) {
      errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Định dạng email không hợp lệ';
    }

    if (!editingUser && !formData.password) {
      errors.password = 'Mật khẩu không được để trống';
    } else if (!editingUser && formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.role) {
      errors.role = 'Vai trò không được để trống';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      if (editingUser) {
        // Update user (without password)
        await userService.updateUser(editingUser.id, {
          username: formData.username,
          email: formData.email,
          role: formData.role,
          enabled: formData.enabled
        });
        toast.success('Cập nhật người dùng thành công!', { position: 'top-right', autoClose: 3000 });
      } else {
        // Create new user
        await userService.createUser(formData);
        toast.success('Tạo người dùng thành công!', { position: 'top-right', autoClose: 3000 });
      }

      setShowForm(false);
      navigate('/admin/users');
      loadAllUsers();
      setError('');
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : `Không thể ${editingUser ? 'cập nhật' : 'tạo'} người dùng`;
      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right', autoClose: 4000 });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Confirmation Modal Component
  const DeleteConfirmModal = () => {
    if (viewMode !== 'delete' || !editingUser) return null;

    return (
      <AdminLayout>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <i data-feather="alert-triangle" className="w-6 h-6 text-red-600"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Xác Nhận Xóa</h2>
                <p className="text-sm text-gray-600">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 mb-2">
                Bạn có chắc chắn muốn xóa người dùng này?
              </p>
              <div className="space-y-1 text-sm">
                <p><strong>ID:</strong> {editingUser.id}</p>
                <p><strong>Tên đăng nhập:</strong> {editingUser.username}</p>
                <p><strong>Email:</strong> {editingUser.email}</p>
                <p><strong>Vai trò:</strong> {editingUser.role === 'ADMIN' ? 'Quản trị viên' : editingUser.role === 'DOCTOR' ? 'Bác sĩ' : 'Bệnh nhân'}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
        <ToastContainer />
      </AdminLayout>
    );
  };

  // Detail View Modal Component
  const UserDetailModal = () => {
    if (viewMode !== 'detail' || !editingUser) return null;

    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Chi Tiết Người Dùng</h1>
            <button 
              onClick={() => {
                setViewMode('list');
                setEditingUser(null);
                navigate('/admin/users');
              }} 
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <i data-feather="arrow-left" className="w-5 h-5"></i>
              Quay lại danh sách
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ID</label>
                <p className="text-lg text-gray-900">{editingUser.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Tên đăng nhập</label>
                <p className="text-lg text-gray-900">{editingUser.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-lg text-gray-900">{editingUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Vai trò</label>
                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                  editingUser.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                  editingUser.role === 'DOCTOR' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {editingUser.role === 'ADMIN' ? 'Quản trị viên' : editingUser.role === 'DOCTOR' ? 'Bác sĩ' : 'Bệnh nhân'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Trạng thái</label>
                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                  editingUser.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {editingUser.enabled ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Ngày tạo</label>
                <p className="text-lg text-gray-900">{new Date(editingUser.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t">
              <button
                onClick={() => handleEdit(editingUser)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <i data-feather="edit-2" className="w-4 h-4"></i>
                Chỉnh sửa
              </button>
              <button
                onClick={() => handleDeleteClick(editingUser)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <i data-feather="trash-2" className="w-4 h-4"></i>
                Xóa
              </button>
            </div>
          </div>
        </div>
        <ToastContainer />
      </AdminLayout>
    );
  };

  if (viewMode === 'delete') {
    return <DeleteConfirmModal />;
  }

  if (viewMode === 'detail') {
    return <UserDetailModal />;
  }

  if (loading && users.length === 0 && !id) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  // If showing form, render form layout
  if (showForm || viewMode === 'create' || viewMode === 'edit') {
    return (
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {viewMode === 'edit' || editingUser ? 'Chỉnh Sửa Người Dùng' : 'Tạo Người Dùng Mới'}
            </h1>
            <p className="text-gray-600 mt-1">Cập nhật thông tin người dùng</p>
            </div>
            <button 
              onClick={() => navigate('/admin/users')} 
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <i data-feather="arrow-left" className="w-5 h-5"></i>
              Quay lại danh sách
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <ErrorMessage 
              message={error} 
              onClose={() => setError('')} 
            />
          )}

          {/* User Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên đăng nhập *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      formErrors.username ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập tên đăng nhập"
                  />
                  {formErrors.username && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập email"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Password (only for create) */}
                {!editingUser && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formErrors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    />
                    {formErrors.password && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                    )}
                  </div>
                )}

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vai trò *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      formErrors.role ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="PATIENT">Bệnh nhân</option>
                    <option value="DOCTOR">Bác sĩ</option>
                    <option value="ADMIN">Quản trị viên</option>
                  </select>
                  {formErrors.role && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.role}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={formData.enabled ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.value === 'active' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUser(null);
                    setViewMode('list');
                    navigate('/admin/users');
                  }}
                  disabled={submitting}
                  style={{ borderRadius: '0.5rem', minHeight: '44px', height: '44px', margin: 0 }}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', color: '#ffffff', borderWidth: '2px', borderRadius: '0.5rem', minHeight: '44px', height: '44px', margin: 0 }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = '#15803d'; e.target.style.borderColor = '#15803d'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = '#16a34a'; e.target.style.borderColor = '#16a34a'; }}
                  className="flex-1 px-4 py-2.5 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {submitting ? (editingUser ? 'Đang cập nhật...' : 'Đang tạo...') : (editingUser ? 'Cập nhật' : 'Tạo mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
        <ToastContainer />
      </AdminLayout>
    );
  }

  // Otherwise render list view
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Người Dùng</h1>
            <p className="text-gray-600 mt-1">Tổng số {users.length} người dùng</p>
          </div>
          <button 
            onClick={handleCreate} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <i data-feather="user-plus" className="w-5 h-5"></i>
            Thêm người dùng
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <ErrorMessage 
            message={error} 
            onClose={() => setError('')} 
          />
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div className="relative md:col-span-1">
              <i data-feather="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></i>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="ADMIN">Quản trị viên</option>
                <option value="DOCTOR">Bác sĩ</option>
                <option value="PATIENT">Bệnh nhân</option>
              </select>
              <i data-feather="chevron-down" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none"></i>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Không hoạt động</option>
              </select>
              <i data-feather="chevron-down" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none"></i>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || filterRole !== 'ALL' || filterStatus !== 'ALL') && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Bộ lọc đang hoạt động:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  Tìm kiếm: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="hover:text-blue-900">
                    <i data-feather="x" className="w-3 h-3"></i>
                  </button>
                </span>
              )}
              {filterRole !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                  Vai trò: {filterRole === 'ADMIN' ? 'Quản trị viên' : filterRole === 'DOCTOR' ? 'Bác sĩ' : 'Bệnh nhân'}
                  <button onClick={() => setFilterRole('ALL')} className="hover:text-purple-900">
                    <i data-feather="x" className="w-3 h-3"></i>
                  </button>
                </span>
              )}
              {filterStatus !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                  Trạng thái: {filterStatus === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                  <button onClick={() => setFilterStatus('ALL')} className="hover:text-green-900">
                    <i data-feather="x" className="w-3 h-3"></i>
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('ALL');
                  setFilterStatus('ALL');
                }}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Xóa tất cả
              </button>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đăng nhập</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tầo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      Không tìm thấy người dùng
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'DOCTOR' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {user.role === 'ADMIN' ? 'Quản trị viên' : user.role === 'DOCTOR' ? 'Bác sĩ' : 'Bệnh nhân'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.enabled ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <i data-feather="edit-2" className="w-4 h-4"></i>
                          </button>
                          <button
                            onClick={() => handlePasswordChange(user.id)}
                            className="text-yellow-600 hover:text-yellow-800 transition-colors"
                            title="Change Password"
                          >
                            <i data-feather="key" className="w-4 h-4"></i>
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className="text-orange-600 hover:text-orange-800 transition-colors"
                            title={user.enabled ? 'Deactivate' : 'Activate'}
                          >
                            <i data-feather={user.enabled ? 'user-x' : 'user-check'} className="w-4 h-4"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                          >
                            <i data-feather="trash-2" className="w-4 h-4"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ToastContainer />
    </AdminLayout>
  );
};

export default UserManagement;
