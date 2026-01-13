import { NavLink, Outlet } from 'react-router-dom';

import styles from './AppShell.module.scss';

interface NavItem {
  to: string;
  label: string;
}

const NAV: NavItem[] = [
  { to: '/directory', label: 'Directory' },
  { to: '/insights', label: 'Insights' },
];

export const AppShell = () => {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.logo} aria-hidden="true" />
          <span className={styles.title}>School Portal</span>
        </div>

        <div className={styles.topbarRight}>
          <div className={styles.userPill} aria-label="Current user">
            <span className={styles.userDot} aria-hidden="true" />
            <span className={styles.userName}>Admin (mock)</span>
          </div>
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
