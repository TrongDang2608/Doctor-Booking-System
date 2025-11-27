import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/patient/PatientLayout';
import HealthAIChat from '../../components/patient/HealthAIChat';

const HealthAIPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  const handleClose = () => {
    navigate('/patient/dashboard');
  };

  return (
    <PatientLayout>
      <HealthAIChat onClose={handleClose} isFullPage={true} />
    </PatientLayout>
  );
};

export default HealthAIPage;

