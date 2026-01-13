import { RotateCcw } from 'lucide-react';

import { Button } from '../../../shared/components/Button';
import { Select } from '../../../shared/components/Select';

import styles from './DirectoryToolbar.module.scss';

const ROLE_OPTIONS = ['All', 'Student', 'Teacher', 'Guardian', 'Staff', 'Admin'] as const;
export type RoleOption = (typeof ROLE_OPTIONS)[number];

const STATUS_OPTIONS = ['All', 'Active', 'Invited', 'Suspended', 'Archived'] as const;
export type StatusOption = (typeof STATUS_OPTIONS)[number];

interface Props {
  q: string;
  onQChange: (value: string) => void;

  role: RoleOption;
  onRoleChange: (value: RoleOption) => void;

  status: StatusOption;
  onStatusChange: (value: StatusOption) => void;

  pageSize: number;
  onPageSizeChange: (value: number) => void;

  onReset: () => void;
  canReset: boolean;
}

export function DirectoryToolbar({
  q,
  onQChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  pageSize,
  onPageSizeChange,
  onReset,
  canReset,
}: Props) {
  return (
    <div className={styles.controls} aria-label="Directory controls">
      <input
        className={styles.search}
        value={q}
        onChange={(e) => onQChange(e.target.value)}
        placeholder="Search name or email…"
        aria-label="Search users"
      />

      <Select
        aria-label="Filter by role"
        value={role}
        onChange={(e) => onRoleChange(e.target.value as RoleOption)}
      >
        {ROLE_OPTIONS.map((r) => (
          <option key={r} value={r}>
            {r === 'All' ? 'All roles' : r}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as StatusOption)}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s === 'All' ? 'All statuses' : s}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Page size"
        value={String(pageSize)}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
      >
        {[10, 25, 50, 100].map((n) => (
          <option key={n} value={String(n)}>
            {n} / page
          </option>
        ))}
      </Select>

      <Button
        variant="ghostDanger"
        onClick={onReset}
        disabled={!canReset}
        aria-label="Reset filters"
      >
        <RotateCcw size={16} strokeWidth={2} />
        <span>Reset</span>
      </Button>
    </div>
  );
}
