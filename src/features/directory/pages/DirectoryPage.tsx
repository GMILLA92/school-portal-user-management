import * as React from 'react';

import { useBulkUpdateUsersMutation } from '../api/useBulkUpdateUsersMutation';
import { useUsersQuery } from '../api/useUsersQuery';
import { BulkActions } from '../components/BulkActions';
import { DirectoryTable } from '../components/DirectoryTable';
import {
  DirectoryToolbar,
  type RoleOption,
  type StatusOption,
} from '../components/DirectoryToolbar';
import { useDirectorySelection } from '../hooks/useDirectorySelection';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../../shared/components/Button';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';

import styles from './DirectoryPage.module.scss';

import type { SortingState } from '@tanstack/react-table';
import type { UpdateUserPayload, UserDTO, UserRole, UserStatus } from '../../users/model';

function fullName(u: UserDTO): string {
  return `${u.firstName} ${u.lastName}`.trim();
}

function includesCI(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function hasRole(u: UserDTO, role: UserRole): boolean {
  return u.roles.includes(role);
}

const DEFAULT_ROLE: RoleOption = 'All';
const DEFAULT_STATUS: StatusOption = 'All';
const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_SORTING: SortingState = [{ id: 'name', desc: false }];

export function DirectoryPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const { data, isLoading, isError, error, isFetching } = useUsersQuery();

  const selection = useDirectorySelection();
  const bulkUpdate = useBulkUpdateUsersMutation();

  const [q, setQ] = React.useState('');
  const debouncedQ = useDebouncedValue(q, 250);

  const [role, setRole] = React.useState<RoleOption>(DEFAULT_ROLE);
  const [status, setStatus] = React.useState<StatusOption>(DEFAULT_STATUS);

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);

  const [sorting, setSorting] = React.useState<SortingState>(DEFAULT_SORTING);

  // Reset to first page whenever "query context" changes
  React.useEffect(() => {
    setPage(1);
  }, [debouncedQ, role, status, pageSize, sorting]);

  const allUsers = React.useMemo<UserDTO[]>(() => data ?? [], [data]);

  const filtered = React.useMemo<UserDTO[]>(() => {
    let rows: UserDTO[] = allUsers;

    const query = debouncedQ.trim();
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
  }, [allUsers, debouncedQ, role, status]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);

  const pagedUsers = React.useMemo<UserDTO[]>(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const pageRowIds = React.useMemo(() => pagedUsers.map((u) => u.id), [pagedUsers]);

  const handleToggleRow = React.useCallback(
    (id: string) => {
      selection.toggleOne(id);
    },
    [selection],
  );

  const handleToggleAllPage = React.useCallback(
    (checked: boolean) => {
      if (checked) selection.selectMany(pageRowIds);
      else selection.deselectMany(pageRowIds);
    },
    [selection, pageRowIds],
  );

  const applyBulk = React.useCallback(
    async (payload: UpdateUserPayload) => {
      const ids = Array.from(selection.selectedIds);
      if (ids.length === 0) return;

      await bulkUpdate.mutateAsync({ ids, payload });
      selection.clear();
    },
    [bulkUpdate, selection],
  );

  const handleBulkSetRole = React.useCallback(
    (nextRole: UserRole) => {
      const roles: UserRole[] = nextRole === 'Admin' ? ['Admin', 'Staff'] : [nextRole];
      void applyBulk({ roles });
    },
    [applyBulk],
  );

  const handleBulkSetStatus = React.useCallback(
    (nextStatus: UserStatus) => {
      void applyBulk({ status: nextStatus });
    },
    [applyBulk],
  );

  const isDefaultSorting =
    sorting.length === DEFAULT_SORTING.length &&
    sorting[0]?.id === DEFAULT_SORTING[0]?.id &&
    sorting[0]?.desc === DEFAULT_SORTING[0]?.desc;

  const canReset =
    q.trim() !== '' ||
    role !== DEFAULT_ROLE ||
    status !== DEFAULT_STATUS ||
    pageSize !== DEFAULT_PAGE_SIZE ||
    !isDefaultSorting ||
    selection.selectedCount > 0;

  const handleReset = () => {
    setQ('');
    setRole(DEFAULT_ROLE);
    setStatus(DEFAULT_STATUS);
    setPageSize(DEFAULT_PAGE_SIZE);
    setSorting(DEFAULT_SORTING);
    setPage(1);
    selection.clear();
  };

  const isTyping = q !== debouncedQ;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Directory</h1>
          <div className={styles.subtle}>
            {isFetching ? 'Updating…' : isTyping ? 'Filtering…' : ' '}
          </div>
        </div>

        <DirectoryToolbar
          q={q}
          onQChange={setQ}
          role={role}
          onRoleChange={setRole}
          status={status}
          onStatusChange={setStatus}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          canReset={canReset}
          onReset={handleReset}
        />
      </header>

      <section className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.count}>
            {total.toLocaleString()} users
            {selection.selectedCount > 0 ? (
              <span className={styles.selectedPill}>
                {selection.selectedCount} selected (this page)
              </span>
            ) : null}
          </div>

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

        {selection.selectedCount > 0 ? (
          <BulkActions
            selectedCount={selection.selectedCount}
            isAdmin={isAdmin}
            isPending={bulkUpdate.isPending}
            onClear={selection.clear}
            onSetRole={handleBulkSetRole}
            onSetStatus={handleBulkSetStatus}
          />
        ) : null}

        {bulkUpdate.isError ? (
          <div role="alert" className={styles.error}>
            {bulkUpdate.error.message}
          </div>
        ) : null}

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
            selectedIds={selection.selectedIds}
            onToggleRow={handleToggleRow}
            pageRowIds={pageRowIds}
            onToggleAllPage={handleToggleAllPage}
          />
        )}
      </section>
    </div>
  );
}
