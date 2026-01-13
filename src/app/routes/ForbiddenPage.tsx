import { useNavigate } from 'react-router-dom';

import { Button } from '../../shared/components/Button';
import { useAuth } from '../../features/auth/AuthContext';

import styles from './ForbiddenPage.module.scss';

export const ForbiddenPage = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleSwitchRole = () => {
    logout();
    void navigate('/login', { replace: true });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Access denied</h1>

      <p className={styles.text}>
        You are signed in as <strong>{user?.role}</strong>, which does not have permission to access
        this page.
      </p>

      <div className={styles.actions}>
        <Button onClick={() => void navigate(-1)}>Go back</Button>
        <Button variant="primary" onClick={handleSwitchRole}>
          Switch role
        </Button>
      </div>
    </div>
  );
};
