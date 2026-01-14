import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
  type OnChangeFn,
} from '@tanstack/react-table';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../../shared/components/Button';

import styles from './DirectoryTable.module.scss';

import type { UserDTO } from '../../users/model';

interface Props {
  data: UserDTO[];
  isAdmin: boolean;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  pageRowIds: string[];
  onToggleAllPage: (checked: boolean) => void;
}

export function DirectoryTable({
  data,
  isAdmin,
  sorting,
  onSortingChange,
  selectedIds,
  onToggleRow,
  pageRowIds,
  onToggleAllPage,
}: Props) {
  const columns = React.useMemo<ColumnDef<UserDTO>[]>(() => {
    return [
      {
        id: 'name',
        header: 'Name',
        accessorFn: (u) => `${u.firstName} ${u.lastName}`,
        sortingFn: 'alphanumeric',
        cell: ({ row }) => {
          const u = row.original;
          const name = `${u.firstName} ${u.lastName}`.trim();

          return (
            <div className={styles.nameCell}>
              <div className={styles.name}>{name}</div>
              {u.pronouns && u.pronouns !== 'prefer not to say' ? (
                <div className={styles.pronouns}>{u.pronouns}</div>
              ) : null}
            </div>
          );
        },
      },
      { accessorKey: 'email', header: 'Email' },
      {
        id: 'roles',
        header: 'Role',
        accessorFn: (u) => u.roles.join(', '),
        cell: (info) => String(info.getValue()),
        sortingFn: 'alphanumeric',
      },
      { accessorKey: 'status', header: 'Status' },
    ];
  }, []);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const allOnPageSelected = pageRowIds.length > 0 && pageRowIds.every((id) => selectedIds.has(id));

  const headerCheckboxRef = React.useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  return (
    <div className={styles.table}>
      <div className={styles.headerRow} role="row">
        <div className={styles.checkboxHeader}>
          <input
            type="checkbox"
            aria-label="Select all rows on this page"
            checked={allOnPageSelected}
            ref={headerCheckboxRef}
            onChange={(e) => onToggleAllPage(e.target.checked)}
          />
        </div>

        {table.getHeaderGroups().map((hg) =>
          hg.headers.map((header) => {
            const canSort = header.column.getCanSort();
            const sorted = header.column.getIsSorted(); // false | 'asc' | 'desc'

            return (
              <div key={header.id} className={styles.headerCell}>
                {canSort ? (
                  <Button
                    variant="ghost"
                    className={styles.sortBtn}
                    onClick={() => header.column.toggleSorting(sorted === 'asc')}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {sorted === 'asc' ? ' ▲' : sorted === 'desc' ? ' ▼' : ''}
                  </Button>
                ) : (
                  <div className={styles.headerText}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </div>
                )}
              </div>
            );
          }),
        )}

        <div className={styles.actionsHeader}>Actions</div>
      </div>

      <div className={styles.divider} />

      {table.getRowModel().rows.length === 0 ? (
        <div className={styles.state}>No users match your filters.</div>
      ) : (
        <div className={styles.body}>
          {table.getRowModel().rows.map((row) => {
            const user = row.original;

            return (
              <div key={row.id} className={styles.row} role="row">
                <div className={styles.checkboxCell}>
                  <input
                    type="checkbox"
                    aria-label={`Select ${user.firstName} ${user.lastName}`}
                    checked={selectedIds.has(user.id)}
                    onChange={() => onToggleRow(user.id)}
                  />
                </div>

                {row.getVisibleCells().map((cell) => {
                  if (cell.column.id === 'status') {
                    const v = String(cell.getValue());
                    const statusCls =
                      v === 'Active'
                        ? styles.statusActive
                        : v === 'Invited'
                          ? styles.statusInvited
                          : v === 'Suspended'
                            ? styles.statusSuspended
                            : styles.statusArchived;

                    return (
                      <div key={cell.id} className={styles.cell}>
                        <span className={`${styles.statusPill} ${statusCls}`}>{v}</span>
                      </div>
                    );
                  }

                  return (
                    <div key={cell.id} className={styles.cell}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  );
                })}
                <div className={styles.actionsCell}>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      void navigate(`/directory/${user.id}`);
                    }}
                  >
                    View
                  </Button>

                  {isAdmin ? (
                    <Button
                      variant="secondary"
                      onClick={() => void navigate(`/directory/${user.id}?mode=edit`)}
                    >
                      Edit
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
