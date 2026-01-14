import styles from './AnalyticsPage.module.scss';
import { useRegistrationsQuery } from './api/useRegistrationsQuery';
import { useUsersByRoleQuery } from './api/useUsersByRoleQuery';
import { RegistrationsChart } from './charts/RegistrationsChart';
import { UsersByRoleChart } from './charts/UsersByRoleChart';

export const AnalyticsPage = () => {
  const registrations = useRegistrationsQuery();
  const usersByRole = useUsersByRoleQuery();
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Analytics</h1>
          <div className={styles.subtle}>Overview of registrations and user roles.</div>
        </div>
      </header>

      <section className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardTitle}>Student registrations</div>
              <div className={styles.cardSubtle}>Last 12 months</div>
            </div>
          </div>
          <div className={styles.cardBody}>
            <RegistrationsChart
              data={registrations.data ?? []}
              isLoading={registrations.isLoading}
              isError={registrations.isError}
            />
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardTitle}>Users by role</div>
              <div className={styles.cardSubtle}>Current distribution</div>
            </div>
          </div>
          <div className={styles.cardBody}>
            <UsersByRoleChart
              data={usersByRole.data ?? []}
              isLoading={usersByRole.isLoading}
              isError={usersByRole.isError}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
