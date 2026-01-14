import styles from './UserDetailsPage.module.scss';

import type { ReactNode } from 'react';

export function UserField({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <div className={styles.label}>
        <span className={styles.icon}>{icon}</span>
        {label}
      </div>
      <div className={styles.value}>{value}</div>
    </div>
  );
}
