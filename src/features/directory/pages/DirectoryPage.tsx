import * as React from 'react';

import { useUsersQuery } from '../api/useUsersQuery';
import { DirectoryTable } from '../components/DirectoryTable';
import { useAuth } from '../../auth/AuthContext';

import styles from './DirectoryPage.module.scss';

import type { SortingState } from '@tanstack/react-table';
import type { UserDTO, UserRole, UserStatus } from '../../users/model';
import { Button } from '../../../shared/components/Button';
import { Select } from '../../../shared/components/Select/Select';

const ROLE_OPTIONS = ['All', 'Student', 'Teacher', 'Guardian', 'Staff', 'Admin'] as const;
type RoleOption = (typeof ROLE_OPTIONS)[number];

const STATUS_OPTIONS = ['All', 'Active', 'Invited', 'Suspended', 'Archived'] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

function fullName(u: UserDTO): string {
  return `${u.firstName} ${u.lastName}`.trim();
}

function includesCI(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function hasRole(u: UserDTO, role: UserRole): boolean {
  return u.roles.includes(role);
}

export function DirectoryPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const { data, isLoading, isError, error, isFetching } = useUsersQuery();

  const [q, setQ] = React.useState('');
  const [role, setRole] = React.useState<RoleOption>('All');
  const [status, setStatus] = React.useState<StatusOption>('All');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'name', desc: false }]);

  // Reset page when inputs change
  React.useEffect(() => {
    setPage(1);
  }, [q, role, status, pageSize, sorting]);

  const allUsers = React.useMemo<UserDTO[]>(() => data ?? [], [data]);

  // Filter only. Sorting is handled inside DirectoryTable via react-table.
  const filtered = React.useMemo<UserDTO[]>(() => {
    let rows: UserDTO[] = allUsers;

    const query = q.trim();
    if (query) {
      rows = rows.filter((u) => includesCI(fullName(u), query) || includesCI(u.email ?? '', query));
    }

    if (role !== 'All') {
      rows = rows.filter((u) => hasRole(u, role as UserRole));
    }

    if (status !== 'All') {
      rows = rows.filter((u) => u.status === (status as UserStatus));
    }

    return rows;
  }, [allUsers, q, role, status]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);

  const pagedUsers = React.useMemo<UserDTO[]>(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Directory</h1>
          <div className={styles.subtle}>{isFetching ? 'Updating…' : ' '}</div>
        </div>

        <div className={styles.controls}>
          <input
            className={`${styles.control} ${styles.search}`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email…"
            aria-label="Search users"
          />

          <Select
            aria-label="Filter by role"
            value={role}
            onChange={(e) => setRole(e.target.value as RoleOption)}
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r === 'All' ? 'All roles' : r}
              </option>
            ))}
          </Select>

          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusOption)}
            aria-label="Filter by status"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All statuses' : s}
              </option>
            ))}
          </Select>

          <Select
            value={String(pageSize)}
            onChange={(e) => setPageSize(Number(e.target.value))}
            aria-label="Page size"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={String(n)}>
                {n} / page
              </option>
            ))}
          </Select>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.count}>{total.toLocaleString()} users</div>

          <div className={styles.pager}>
            <Button
              variant="soft"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1 || isLoading}
            >
              Prev
            </Button>

            <span className={styles.pageText}>
              Page {safePage} / {pageCount}
            </span>

            <Button
              variant="soft"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={safePage >= pageCount || isLoading}
            >
              Next
            </Button>
          </div>
        </div>

        {isLoading && <div className={styles.state}>Loading users…</div>}

        {isError && (
          <div role="alert" className={styles.error}>
            {error.message}
          </div>
        )}

        {!isLoading && !isError && (
          <DirectoryTable
            data={pagedUsers}
            isAdmin={isAdmin}
            sorting={sorting}
            onSortingChange={setSorting}
          />
        )}
      </section>
    </div>
  );
}
