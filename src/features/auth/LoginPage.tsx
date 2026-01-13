import { Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from './AuthContext';
import styles from './LoginPage.module.scss';

import type { AuthRole } from './types';

const ROLES: AuthRole[] = ['Admin', 'Teacher', 'Staff'];

const getHomeForRole = (role: AuthRole) => (role === 'Admin' ? '/directory' : '/insights');

export const LoginPage = () => {
  const { user, loginAs } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to={getHomeForRole(user.role)} replace />;
  }

  const handleLogin = (role: AuthRole) => {
    loginAs(role);
    void navigate(getHomeForRole(role), { replace: true });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card} role="region" aria-label="Login">
        <h1 className={styles.h1}>Sign in (mock)</h1>
        <p className={styles.p}>
          Choose a role. Directory is <strong>Admin-only</strong>.
        </p>

        <div className={styles.buttons}>
          {ROLES.map((r) => (
            <button key={r} type="button" className={styles.button} onClick={() => handleLogin(r)}>
              Continue as {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
