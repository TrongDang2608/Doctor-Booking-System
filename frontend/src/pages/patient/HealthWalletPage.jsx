import { useEffect } from 'react';
import HealthWallet from '../../components/patient/HealthWallet';
import PatientLayout from '../../components/patient/PatientLayout';
import './HealthWalletPage.css';

const HealthWalletPage = () => {
  useEffect(() => {
    // Initialize Feather Icons
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  return (
    <PatientLayout>
      <div className="health-wallet-page">
        <HealthWallet />
      </div>
    </PatientLayout>
  );
};
export default HealthWalletPage;

