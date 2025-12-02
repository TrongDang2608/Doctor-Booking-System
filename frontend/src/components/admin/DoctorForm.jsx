import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import ErrorMessage from '../common/ErrorMessage';

const DoctorForm = ({ doctor, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    specialization: '',
    qualification: '',
    experience: 0,
    phone: '',
    address: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (doctor) {
      setFormData({
        username: doctor.username || '',
        password: '', // Don't pre-fill password
        email: doctor.email || '',
        fullName: doctor.fullName || '',
        specialization: doctor.specialization || '',
        qualification: doctor.qualification || '',
        experience: doctor.experience || 0,
        phone: doctor.phone || '',
        address: doctor.address || '',
        bio: doctor.bio || '',
      });
    }
  }, [doctor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'experience' ? parseInt(value) || 0 : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (doctor) {
        await adminService.updateDoctor(doctor.id, formData);
      } else {
        await adminService.createDoctor(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">{doctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none font-light"
          >
            ×
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <span className="text-lg">⚠️</span>
            <span className="flex-1">{error}</span>
            <button 
              onClick={() => setError('')} 
              className="text-red-800 hover:text-red-900 font-bold text-xl leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                placeholder="Dr. John Doe" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                placeholder="johndoe" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                placeholder="john.doe@hospital.com" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password {doctor ? <span className="text-gray-500 font-normal">(leave blank to keep current)</span> : <span className="text-red-500">*</span>}
              </label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required={!doctor} 
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                placeholder="••••••••" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="specialization" 
                value={formData.specialization} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                placeholder="Cardiology" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Qualification</label>
              <input 
                type="text" 
                name="qualification" 
                value={formData.qualification} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                placeholder="MBBS, MD" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Experience (years)</label>
              <input 
                type="number" 
                name="experience" 
                value={formData.experience} 
                onChange={handleChange} 
                min="0" 
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                placeholder="5" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                placeholder="+1 234 567 8900" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
            <input 
              type="text" 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
              placeholder="123 Hospital St, City" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
            <textarea 
              name="bio" 
              value={formData.bio} 
              onChange={handleChange} 
              rows="4" 
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 resize-none" 
              placeholder="Brief description about the doctor..." 
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : doctor ? 'Update Doctor' : 'Create Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorForm;

