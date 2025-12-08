import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import { adminService } from '../../../services/adminService';
import Loading from '../../../components/common/Loading';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useFeatherIcons from '../../../hooks/useFeatherIcons';

const PatientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatient();
  }, [id]);

  // Initialize Feather Icons safely using custom hook
  useFeatherIcons([patient]);

  const loadPatient = async () => {
    try {
      const data = await adminService.getPatientById(id);
      setPatient(data);
    } catch (err) {
      toast.error('Không thể tải thông tin bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/patients/${id}/edit`);
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  if (!patient) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Không tìm thấy thông tin bệnh nhân</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Chi Tiết Bệnh Nhân</h1>
          <button 
            onClick={() => navigate('/admin/patients')} 
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
              <p className="text-lg text-gray-900">{patient.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Họ và Tên</label>
              <p className="text-lg text-gray-900">{patient.fullName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p className="text-lg text-gray-900">{patient.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Số điện thoại</label>
              <p className="text-lg text-gray-900">{patient.phone || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Ngày sinh</label>
              <p className="text-lg text-gray-900">{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('vi-VN') : '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Giới tính</label>
              <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                patient.gender === 'MALE' ? 'bg-blue-100 text-blue-700' :
                patient.gender === 'FEMALE' ? 'bg-pink-100 text-pink-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {patient.gender === 'MALE' ? 'Nam' : patient.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
              </span>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">Địa chỉ</label>
              <p className="text-lg text-gray-900">{patient.address || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Người liên hệ khẩn cấp</label>
              <p className="text-lg text-gray-900">{patient.emergencyContact || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">SĐT khẩn cấp</label>
              <p className="text-lg text-gray-900">{patient.emergencyPhone || '-'}</p>
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
          </div>
        </div>
      </div>
      <ToastContainer />
    </AdminLayout>
  );
};

export default PatientDetail;
