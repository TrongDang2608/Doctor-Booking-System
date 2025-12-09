import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import userService from '../../../services/userService';
import Loading from '../../../components/common/Loading';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useFeatherIcons from '../../../hooks/useFeatherIcons';

const UserDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadUser();
  }, [id]);

  // Initialize Feather Icons safely using custom hook
  useFeatherIcons([user]);

  const loadUser = async () => {
    try {
      const allUsers = await userService.getAllUsers('');
      const foundUser = allUsers.find(u => u.id === parseInt(id));
      setUser(foundUser);
    } catch (err) {
      toast.error('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/users/${id}/edit`);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await userService.deleteUser(parseInt(id));
      toast.success('Xóa người dùng thành công!', { position: 'top-right', autoClose: 3000 });
      setTimeout(() => navigate('/admin/users'), 500);
    } catch (err) {
      console.error('Error deleting user:', err);
      
      let errorMsg = 'Không thể xóa người dùng';
      
      if (err.response?.data?.message) {
        const backendMsg = err.response.data.message;
        
        if (backendMsg.includes('foreign key constraint') || backendMsg.includes('Cannot delete or update')) {
          errorMsg = `Không thể xóa người dùng này vì đang có dữ liệu liên quan (lịch hẹn, bệnh án, v.v.). Vui lòng xóa các dữ liệu liên quan trước hoặc liên hệ quản trị viên.`;
        } else {
          errorMsg = backendMsg;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      toast.error(errorMsg, { position: 'top-right', autoClose: 6000 });
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Không tìm thấy thông tin người dùng</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Chi Tiết Người Dùng</h1>
          <button 
            onClick={() => navigate('/admin/users')} 
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
              <p className="text-lg text-gray-900">{user.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Tên đăng nhập</label>
              <p className="text-lg text-gray-900">{user.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p className="text-lg text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Vai trò</label>
              <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                user.role === 'DOCTOR' ? 'bg-blue-100 text-blue-700' :
                'bg-green-100 text-green-700'
              }`}>
                {user.role === 'ADMIN' ? 'Quản trị viên' : user.role === 'DOCTOR' ? 'Bác sĩ' : 'Bệnh nhân'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Trạng thái</label>
              <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                user.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {user.enabled ? 'Hoạt động' : 'Không hoạt động'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Ngày tạo</label>
              <p className="text-lg text-gray-900">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <i data-feather="edit-2" className="w-4 h-4"></i>
              Chỉnh sửa
            </button>
            <button
              onClick={handleDeleteClick}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <i data-feather="trash-2" className="w-4 h-4"></i>
              Xóa
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">Xác nhận xóa</h2>
            
            <p className="text-gray-600 text-sm mb-4 text-center">
              Hành động này không thể hoàn tác
            </p>
            
            <p className="text-gray-700 mb-6 text-center">
              Bạn có chắc chắn muốn xóa người dùng <strong className="text-red-600">{user.username}</strong>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </AdminLayout>
  );
};

export default UserDetail;
