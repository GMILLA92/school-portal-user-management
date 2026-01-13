import * as React from 'react';

import { useUsersQuery } from '../api/useUsersQuery';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../../shared/components/Button';

import styles from './DirectoryPage.module.scss';

import type { UserDTO, UserRole, UserStatus } from '../../users/model';

type SortBy = 'name' | 'email' | 'status' | 'role' | 'registeredAt';
type SortDir = 'asc' | 'desc';

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

function compare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

function sortUsers(users: UserDTO[], sortBy: SortBy, sortDir: SortDir): UserDTO[] {
  const dir = sortDir === 'asc' ? 1 : -1;

  return [...users].sort((ua, ub) => {
    switch (sortBy) {
      case 'name':
        return compare(fullName(ua), fullName(ub)) * dir;
      case 'email':
        return compare(ua.email ?? '', ub.email ?? '') * dir;
      case 'status':
        return compare(ua.status ?? '', ub.status ?? '') * dir;
      case 'role':
        return compare(ua.roles[0] ?? '', ub.roles[0] ?? '') * dir;
      case 'registeredAt':
        return compare(ua.registeredAt ?? '', ub.registeredAt ?? '') * dir;
      default:
        return 0;
    }
  });
}

export function DirectoryPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const { data, isLoading, isError, error, isFetching } = useUsersQuery();

  const [q, setQ] = React.useState('');
  const [role, setRole] = React.useState<RoleOption>('All');
  const [status, setStatus] = React.useState<StatusOption>('All');
  const [sortBy, setSortBy] = React.useState<SortBy>('name');
  const [sortDir, setSortDir] = React.useState<SortDir>('asc');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  React.useEffect(() => {
    setPage(1);
  }, [q, role, status, pageSize, sortBy, sortDir]);

  const allUsers = React.useMemo<UserDTO[]>(() => data ?? [], [data]);

  const filteredSorted = React.useMemo<UserDTO[]>(() => {
    let rows: UserDTO[] = allUsers;

    const query = q.trim();
    if (query) {
      rows = rows.filter((u) => {
        const name = fullName(u);
        return includesCI(name, query) || includesCI(u.email ?? '', query);
      });
    }

    if (role !== 'All') {
      rows = rows.filter((u) => hasRole(u, role as UserRole));
    }

    if (status !== 'All') {
      rows = rows.filter((u) => u.status === (status as UserStatus));
    }

    return sortUsers(rows, sortBy, sortDir);
  }, [allUsers, q, role, status, sortBy, sortDir]);

  const total = filteredSorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);

  const pagedUsers = React.useMemo<UserDTO[]>(() => {
    const start = (safePage - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, safePage, pageSize]);

  const toggleSort = (next: SortBy) => {
    setSortBy((prev) => {
      if (prev !== next) {
        setSortDir('asc');
        return next;
      }
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      return prev;
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Directory</h1>
          <div className={styles.subtle}>{isFetching ? 'Updating…' : ' '}</div>
        </div>

        <div className={styles.controls}>
          <input
            className={styles.input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email…"
            aria-label="Search users"
          />

          <select
            className={styles.select}
            value={role}
            onChange={(e) => setRole(e.target.value as RoleOption)}
            aria-label="Filter by role"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r === 'All' ? 'All roles' : r}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusOption)}
            aria-label="Filter by status"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All statuses' : s}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            value={String(pageSize)}
            onChange={(e) => setPageSize(Number(e.target.value))}
            aria-label="Page size"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={String(n)}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.count}>{total.toLocaleString()} users</div>

          <div className={styles.pager}>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1 || isLoading}
            >
              Prev
            </Button>

            <span className={styles.pageText}>
              Page {safePage} / {pageCount}
            </span>

            <Button
              variant="secondary"
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
          <div className={styles.table}>
            <div className={styles.headerRow} role="row">
              <Button variant="ghost" className={styles.sortBtn} onClick={() => toggleSort('name')}>
                Name {sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </Button>
              <Button
                variant="ghost"
                className={styles.sortBtn}
                onClick={() => toggleSort('email')}
              >
                Email {sortBy === 'email' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </Button>
              <Button variant="ghost" className={styles.sortBtn} onClick={() => toggleSort('role')}>
                Role {sortBy === 'role' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </Button>
              <Button
                variant="ghost"
                className={styles.sortBtn}
                onClick={() => toggleSort('status')}
              >
                Status {sortBy === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </Button>

              <div className={styles.actionsHeader}>Actions</div>
            </div>

            <div className={styles.divider} />

            {pagedUsers.length === 0 ? (
              <div className={styles.state}>No users match your filters.</div>
            ) : (
              pagedUsers.map((u) => (
                <div key={u.id} className={styles.row} role="row">
                  <div className={styles.cell}>{fullName(u)}</div>
                  <div className={styles.cell}>{u.email}</div>
                  <div className={styles.cell}>{u.roles.join(', ')}</div>
                  <div className={styles.cell}>{u.status}</div>
                  <div className={styles.actionsCell}>
                    <Button variant="secondary" disabled={!isAdmin}>
                      Edit
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
