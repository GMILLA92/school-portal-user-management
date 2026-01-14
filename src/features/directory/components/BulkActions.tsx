import * as React from 'react';

import { Button } from '../../../shared/components/Button';
import { Select } from '../../../shared/components/Select/Select';

import styles from './BulkActions.module.scss';

import type { UserRole, UserStatus } from '../../users/model';

const ROLE_OPTIONS: UserRole[] = ['Student', 'Teacher', 'Guardian', 'Staff', 'Admin'];
const STATUS_OPTIONS: UserStatus[] = ['Active', 'Invited', 'Suspended', 'Archived'];

interface Props {
  selectedCount: number;
  isAdmin: boolean;
  isPending: boolean;

  onClear: () => void;

  onSetRole: (role: UserRole) => void;
  onSetStatus: (status: UserStatus) => void;
}

export function BulkActions({
  selectedCount,
  isAdmin,
  isPending,
  onClear,
  onSetRole,
  onSetStatus,
}: Props) {
  const [role, setRole] = React.useState<UserRole>('Staff');
  const [status, setStatus] = React.useState<UserStatus>('Active');

  return (
    <div className={styles.bar} role="region" aria-label="Bulk actions">
      <div className={styles.left}>
        <div className={styles.count}>{selectedCount.toLocaleString()} selected</div>
        <Button variant="warning" onClick={onClear} disabled={isPending}>
          Clear
        </Button>
      </div>

      <div className={styles.right}>
        <div className={styles.group}>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            aria-label="Bulk role"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                Set role: {r}
              </option>
            ))}
          </Select>

          <Button variant="soft" disabled={!isAdmin || isPending} onClick={() => onSetRole(role)}>
            Apply
          </Button>
        </div>

        <div className={styles.group}>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as UserStatus)}
            aria-label="Bulk status"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                Set status: {s}
              </option>
            ))}
          </Select>

          <Button
            variant="soft"
            disabled={!isAdmin || isPending}
            onClick={() => onSetStatus(status)}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
