import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '../../features/auth/AuthContext';

import styles from './AppShell.module.scss';

interface NavItem {
  to: string;
  label: string;
}

const NAV: NavItem[] = [
  { to: '/directory', label: 'Directory' },
  { to: '/analytics', label: 'Analytics' },
];

export const AppShell = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    void navigate('/login', { replace: true });
  };

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.logo} aria-hidden="true" />
          <span className={styles.title}>School Portal</span>
        </div>

        <div className={styles.topbarRight}>
          {user ? (
            <>
              <div className={styles.userPill} aria-label="Current user">
                <span className={styles.userDot} aria-hidden="true" />
                <span className={styles.userName}>
                  {user.name} · {user.role}
                </span>
              </div>

              <button type="button" className={styles.logout} onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <span className={styles.userName}>Signed out</span>
          )}
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar} aria-label="Primary navigation">
          <nav className={styles.nav}>
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className={styles.main} aria-label="Page content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
