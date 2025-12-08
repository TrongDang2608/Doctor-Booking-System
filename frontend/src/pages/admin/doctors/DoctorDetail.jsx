import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import { adminService } from '../../../services/adminService';
import Loading from '../../../components/common/Loading';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useFeatherIcons from '../../../hooks/useFeatherIcons';

const DoctorDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDoctor();
  }, [id]);

  useFeatherIcons([doctor]);

  const loadDoctor = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDoctorById(id);
      setDoctor(data);
      setError('');
    } catch (err) {
      setError('Không thể tải thông tin bác sĩ');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/doctors/${id}/edit`);
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  if (error || !doctor) {
    return (
      <AdminLayout>
        <div className="text-center text-red-600 py-8">{error || 'Không tìm thấy bác sĩ'}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Chi Tiết Bác Sĩ</h1>
          <button 
            onClick={() => navigate('/admin/doctors')} 
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
              <p className="text-lg text-gray-900">{doctor.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Họ và Tên</label>
              <p className="text-lg text-gray-900">{doctor.fullName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p className="text-lg text-gray-900">{doctor.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Số điện thoại</label>
              <p className="text-lg text-gray-900">{doctor.phone || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Chuyên khoa</label>
              <p className="text-lg text-gray-900">{doctor.specialization || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Bằng cấp</label>
              <p className="text-lg text-gray-900">{doctor.qualification || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Kinh nghiệm</label>
              <p className="text-lg text-gray-900">{doctor.experience ? `${doctor.experience} năm` : '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Trạng thái</label>
              <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                doctor.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {doctor.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
              </span>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">Địa chỉ</label>
              <p className="text-lg text-gray-900">{doctor.address || '-'}</p>
            </div>
            {doctor.bio && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Tiểu sử</label>
                <p className="text-lg text-gray-900">{doctor.bio}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <i data-feather="edit-2" className="w-4 h-4"></i>
              Chỉnh sửa
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </AdminLayout>
  );
};

export default DoctorDetail;
