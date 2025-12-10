import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import AuthUnified from './pages/AuthUnified';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctors from './pages/Doctors';
import Specialties from './pages/Specialties';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Import Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorList from './pages/admin/doctors/DoctorList';
import DoctorForm from './pages/admin/doctors/DoctorForm';
import DoctorDetail from './pages/admin/doctors/DoctorDetail';
import PatientList from './pages/admin/patients/PatientList';
import PatientForm from './pages/admin/patients/PatientForm';
import PatientDetail from './pages/admin/patients/PatientDetail';
import UserList from './pages/admin/users/UserList';
import UserForm from './pages/admin/users/UserForm';
import UserDetail from './pages/admin/users/UserDetail';
import AppointmentList from './pages/admin/appointments/AppointmentList';
import AppointmentDetail from './pages/admin/appointments/AppointmentDetail';
import AppointmentForm from './pages/admin/appointments/AppointmentForm';
import FeedbackManagement from './pages/admin/FeedbackManagement';

// Import Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import TreatmentManagement from './pages/doctor/TreatmentManagement';
import PatientSearch from './pages/doctor/PatientSearch';

// Import Patient pages
import PatientPortal from './pages/patient/PatientPortal';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientProfile from './pages/patient/PatientProfile';
import NewBooking from './pages/patient/NewBooking';
import BookingHistory from './pages/patient/BookingHistory';
import DoctorSearch from './pages/patient/DoctorSearch';
import FeedbackForm from './pages/patient/FeedbackForm';
import TreatmentHistory from './pages/patient/TreatmentHistory';
import HealthAIPage from './pages/patient/HealthAIPage';
import HealthWalletPage from './pages/patient/HealthWalletPage';
import PaymentResultPage from './pages/patient/PaymentResultPage';
import AppointmentPaymentResult from './pages/patient/AppointmentPaymentResult';
import FamilyProfilePage from './pages/patient/FamilyProfilePage';
const Unauthorized = () => <div><h1>Unauthorized</h1><p>You don't have permission to access this page.</p></div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<AuthUnified />} />
          <Route path="/register" element={<AuthUnified />} />
          
          {/* Legacy routes - redirect to main login */}
          <Route path="/login/admin" element={<Login />} />
          <Route path="/login/doctor" element={<Login />} />
          <Route path="/login/patient" element={<Login />} />
          
          {/* Role-specific register routes */}
          <Route path="/register/admin" element={<Register />} />
          <Route path="/register/doctor" element={<Register />} />
          <Route path="/register/patient" element={<Register />} />
          
          {/* Public pages */}
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/specialties" element={<Specialties />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Protected routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<UserList />} />
                  <Route path="users/create" element={<UserForm />} />
                  <Route path="users/:id" element={<UserDetail />} />
                  <Route path="users/:id/edit" element={<UserForm />} />
                  <Route path="doctors" element={<DoctorList />} />
                  <Route path="doctors/create" element={<DoctorForm />} />
                  <Route path="doctors/:id" element={<DoctorDetail />} />
                  <Route path="doctors/:id/edit" element={<DoctorForm />} />
                  <Route path="patients" element={<PatientList />} />
                  <Route path="patients/create" element={<PatientForm />} />
                  <Route path="patients/:id" element={<PatientDetail />} />
                  <Route path="patients/:id/edit" element={<PatientForm />} />
                  <Route path="appointments" element={<AppointmentList />} />
                  <Route path="appointments/:id" element={<AppointmentDetail />} />
                  <Route path="appointments/:id/edit" element={<AppointmentForm />} />
                  <Route path="feedbacks" element={<FeedbackManagement />} />
                  <Route path="feedbacks/:id" element={<FeedbackManagement />} />
                  <Route path="feedbacks/:id/reply" element={<FeedbackManagement />} />
                  <Route path="feedbacks/:id/delete" element={<FeedbackManagement />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/doctor/*"
            element={
              <ProtectedRoute requiredRole="DOCTOR">
                <Routes>
                  <Route path="dashboard" element={<DoctorDashboard />} />
                  <Route path="profile" element={<DoctorProfile />} />
                  <Route path="appointments" element={<DoctorAppointments />} />
                  <Route path="treatments" element={<TreatmentManagement />} />
                  <Route path="patients" element={<PatientSearch />} />
                  <Route path="*" element={<Navigate to="/doctor/dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/patient"
            element={
              <ProtectedRoute requiredRole="PATIENT">
                <PatientPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/*"
            element={
              <ProtectedRoute requiredRole="PATIENT">
                <Routes>
                  <Route path="dashboard" element={<PatientDashboard />} />
                  <Route path="profile" element={<PatientProfile />} />
                  <Route path="booking" element={<NewBooking />} />
                  <Route path="history" element={<BookingHistory />} />
                  <Route path="doctors" element={<DoctorSearch />} />
                  <Route path="treatments" element={<TreatmentHistory />} />
                  <Route path="feedback" element={<FeedbackForm />} />
                  <Route path="family" element={<FamilyProfilePage />} />
                  <Route path="wallet" element={<HealthWalletPage />} />
                  <Route path="wallet/payment/result" element={<PaymentResultPage />} />
                  <Route path="appointment/payment/result" element={<AppointmentPaymentResult />} />
                  <Route path="healthlyai" element={<HealthAIPage />} />
                  <Route path="*" element={<Navigate to="/patient/dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Error pages */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/404" element={<NotFound />} />
          
          {/* Default redirect */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
