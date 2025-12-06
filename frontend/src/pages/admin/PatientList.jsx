import { useEffect, useState, useMemo } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import DataTable from '../../components/common/DataTable';
import { formatDate } from '../../utils/formatDate';

const PatientList = () => {
  const [allPatients, setAllPatients] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Load all patients on mount
  useEffect(() => {
    loadAllPatients();
  }, []);

  // Filter patients when searchTerm changes - optimized with useMemo
  const filteredPatients = useMemo(() => {
    if (searchTerm.trim() === '') {
      return allPatients;
    }
    const term = searchTerm.toLowerCase();
    return allPatients.filter(patient => 
      patient.fullName?.toLowerCase().includes(term) ||
      patient.id?.toString().includes(searchTerm) ||
      patient.email?.toLowerCase().includes(term)
    );
  }, [searchTerm, allPatients]);

  useEffect(() => {
    setPatients(filteredPatients);
  }, [filteredPatients]);

  const loadAllPatients = async () => {
    try {
      setLoading(true);
      // Load all patients with empty search
      const data = await adminService.searchPatients('');
      setAllPatients(data);
      setPatients(data);
      setError('');
    } catch (err) {
      setError('Failed to load patients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const patient = await adminService.getPatientById(id);
      setSelectedPatient(patient);
    } catch (err) {
      setError('Failed to load patient details');
      console.error(err);
    }
  };

  if (loading && patients.length === 0) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản Lý Bệnh Nhân</h1>

        <ErrorMessage message={error} onClose={() => setError('')} />

        <div>
          <input
            type="text"
            placeholder="Tìm kiếm bệnh nhân theo tên, ID hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-2xl px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
          />
        </div>

        <DataTable
          columns={[
            { header: 'ID', accessor: 'id' },
            { header: 'Họ và Tên', accessor: 'fullName' },
            { header: 'Email', accessor: 'email' },
            { 
              header: 'Số Điện Thoại', 
              accessor: 'phone',
              render: (patient) => patient.phone || '-'
            },
            { 
              header: 'Ngày Sinh', 
              accessor: 'dateOfBirth',
              render: (patient) => patient.dateOfBirth ? formatDate(patient.dateOfBirth) : '-'
            },
            {
              header: 'Hành Động',
              align: 'center',
              render: (patient) => (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(patient.id);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
                >
                  Xem Chi Tiết
                </button>
              )
            }
          ]}
          data={patients}
          loading={loading && patients.length === 0}
          emptyMessage={searchTerm ? `Không tìm thấy bệnh nhân nào khớp với "${searchTerm}"` : 'Không có bệnh nhân'}
          onRowClick={(patient) => handleViewDetails(patient.id)}
        />

        {selectedPatient && (
          <PatientDetailModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
        )}
      </div>
    </AdminLayout>
  );
};

const PatientDetailModal = ({ patient, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Chi Tiết Bệnh Nhân</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none font-light"
          >
            ×
          </button>
        </div>

        {/* Patient Info */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm font-semibold text-gray-600">ID:</span>
              <p className="text-gray-900 mt-1">{patient.id}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm font-semibold text-gray-600">Họ và Tên:</span>
              <p className="text-gray-900 mt-1">{patient.fullName}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm font-semibold text-gray-600">Email:</span>
              <p className="text-gray-900 mt-1">{patient.email}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm font-semibold text-gray-600">Số Điện Thoại:</span>
              <p className="text-gray-900 mt-1">{patient.phone || '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm font-semibold text-gray-600">Ngày Sinh:</span>
              <p className="text-gray-900 mt-1">{patient.dateOfBirth ? formatDate(patient.dateOfBirth) : '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm font-semibold text-gray-600">Giới Tính:</span>
              <p className="text-gray-900 mt-1">{patient.gender || '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
              <span className="text-sm font-semibold text-gray-600">Địa Chỉ:</span>
              <p className="text-gray-900 mt-1">{patient.address || '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm font-semibold text-gray-600">Người Liên Hệ Khẩn Cấp:</span>
              <p className="text-gray-900 mt-1">{patient.emergencyContact || '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm font-semibold text-gray-600">SĐT Khẩn Cấp:</span>
              <p className="text-gray-900 mt-1">{patient.emergencyPhone || '-'}</p>
            </div>
          </div>

          {/* Treatment History */}
          {patient.treatments && patient.treatments.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Lịch Sử Điều Trị</h3>
              <div className="space-y-3">
                {patient.treatments.map((treatment) => (
                  <div key={treatment.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-sm font-semibold text-gray-600">Ngày:</span>
                        <p className="text-gray-900">{formatDate(treatment.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-600">Bác Sĩ:</span>
                        <p className="text-gray-900">{treatment.doctorName}</p>
                      </div>
                      {treatment.diagnosis && (
                        <div className="col-span-2">
                          <span className="text-sm font-semibold text-gray-600">Chẩn Đoán:</span>
                          <p className="text-gray-900">{treatment.diagnosis}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientList;

