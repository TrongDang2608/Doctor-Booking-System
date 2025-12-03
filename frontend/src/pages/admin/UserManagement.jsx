import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import userService from '../../services/userService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import feather from 'feather-icons';

const UserManagement = () => {
  const navigate = useNavigate();
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
  }, [users, showForm]);

  // Load user data when editing from URL
  useEffect(() => {
    if (id && allUsers.length > 0) {
      const user = allUsers.find(u => u.id === parseInt(id));
      if (user) {
        setEditingUser(user);
        setFormData({
          username: user.username,
          email: user.email,
          password: '',
          role: user.role,
          enabled: user.enabled
        });
        setFormErrors({});
        setShowForm(true);
      }
    } else if (!id) {
      setShowForm(false);
      setEditingUser(null);
    }
  }, [id, allUsers]);

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
    // Replace Feather Icons after users update
    if (window.feather) {
      setTimeout(() => window.feather.replace(), 100);
    }
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
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'PATIENT',
      enabled: true
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleEdit = (user) => {
    navigate(`/admin/users/edit/${user.id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await userService.deleteUser(id);
      toast.success('User deleted successfully!', { position: 'top-right', autoClose: 3000 });
      loadAllUsers();
      setError('');
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : 'Failed to delete user';
      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right', autoClose: 4000 });
      console.error(err);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await userService.toggleUserStatus(id);
      toast.success('User status updated successfully!', { position: 'top-right', autoClose: 2500 });
      loadAllUsers();
      setError('');
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : 'Failed to toggle user status';
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
      toast.error('Password must be at least 6 characters', { position: 'top-right', autoClose: 4000 });
      return;
    }

    try {
      await userService.changeUserPassword(passwordChangeId, newPassword);
      setShowPasswordModal(false);
      setPasswordChangeId(null);
      setNewPassword('');
      setError('');
      toast.success('Password changed successfully!', { position: 'top-right', autoClose: 3000 });
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : 'Failed to change password';
      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right', autoClose: 4000 });
      console.error(err);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!editingUser && !formData.password) {
      errors.password = 'Password is required';
    } else if (!editingUser && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) {
      errors.role = 'Role is required';
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
        toast.success('User updated successfully!', { position: 'top-right', autoClose: 3000 });
      } else {
        // Create new user
        await userService.createUser(formData);
        toast.success('User created successfully!', { position: 'top-right', autoClose: 3000 });
      }

      setShowForm(false);
      navigate('/admin/users');
      loadAllUsers();
      setError('');
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : `Failed to ${editingUser ? 'update' : 'create'} user`;
      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right', autoClose: 4000 });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };



  if (loading && users.length === 0 && !id) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  // If showing form, render form layout
  if (showForm) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h1>
              <p className="text-gray-600 mt-1">Update user information</p>
            </div>
            <button 
              onClick={() => navigate('/admin/users')} 
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <i data-feather="arrow-left" className="w-5 h-5"></i>
              Back to List
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
                    Username *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      formErrors.username ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter username"
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
                    placeholder="Enter email"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Password (only for create) */}
                {!editingUser && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formErrors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter password (min 6 characters)"
                    />
                    {formErrors.password && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                    )}
                  </div>
                )}

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      formErrors.role ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="PATIENT">Patient</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  {formErrors.role && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.role}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.enabled ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.value === 'active' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/admin/users')}
                  disabled={submitting}
                  style={{ borderRadius: '0.5rem', minHeight: '44px', height: '44px', margin: 0 }}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  Cancel
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
                  {submitting ? (editingUser ? 'Updating...' : 'Creating...') : (editingUser ? 'Update User' : 'Create User')}
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
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">{users.length} total users</p>
          </div>
          <button 
            onClick={handleCreate} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <i data-feather="user-plus" className="w-5 h-5"></i>
            Add New User
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
                placeholder="Search by username, email..."
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
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="DOCTOR">Doctor</option>
                <option value="PATIENT">Patient</option>
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
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <i data-feather="chevron-down" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none"></i>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || filterRole !== 'ALL' || filterStatus !== 'ALL') && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="hover:text-blue-900">
                    <i data-feather="x" className="w-3 h-3"></i>
                  </button>
                </span>
              )}
              {filterRole !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                  Role: {filterRole}
                  <button onClick={() => setFilterRole('ALL')} className="hover:text-purple-900">
                    <i data-feather="x" className="w-3 h-3"></i>
                  </button>
                </span>
              )}
              {filterStatus !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                  Status: {filterStatus}
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
                Clear all
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No users found
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
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.enabled ? 'Active' : 'Inactive'}
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
                            onClick={() => handleDelete(user.id)}
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
