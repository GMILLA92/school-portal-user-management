import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { DirectoryPage } from './DirectoryPage';

import type { MockedFunction } from 'vitest';
import type { SortingState } from '@tanstack/react-table';
import type { UpdateUserPayload, UserDTO, UserRole, UserStatus } from '../../users/model/types';

let mockRole: 'Admin' | 'Teacher' | 'Staff' = 'Admin';

vi.mock('../../auth/AuthContext', () => ({
  useAuth: () => ({ user: { role: mockRole } }),
}));

interface UsersQueryReturn {
  data: UserDTO[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
}

type UseUsersQueryFn = () => UsersQueryReturn;
const useUsersQueryMock = vi.fn() as MockedFunction<UseUsersQueryFn>;

vi.mock('../api/useUsersQuery', () => ({
  useUsersQuery: () => useUsersQueryMock(),
}));

type BulkMutateAsyncFn = (vars: {
  ids: string[];
  payload: UpdateUserPayload;
}) => Promise<{ updatedCount: number }>;

const bulkMutateAsync = vi.fn() as MockedFunction<BulkMutateAsyncFn>;

interface BulkMutationReturn {
  mutateAsync: typeof bulkMutateAsync;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
}

type UseBulkMutationFn = () => BulkMutationReturn;
const useBulkUpdateUsersMutationMock = vi.fn() as MockedFunction<UseBulkMutationFn>;

vi.mock('../api/useBulkUpdateUsersMutation', () => ({
  useBulkUpdateUsersMutation: () => useBulkUpdateUsersMutationMock(),
}));

interface SelectionHook {
  selectedIds: Set<string>;
  selectedCount: number;
  toggleOne: (id: string) => void;
  clear: () => void;
  selectMany: (ids: string[]) => void;
  deselectMany: (ids: string[]) => void;
  setMany: (ids: string[]) => void;
}

vi.mock('../hooks/useDirectorySelection', () => ({
  useDirectorySelection: (): SelectionHook => {
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(() => new Set());

    const toggleOne = (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };

    const clear = () => {
      setSelectedIds(new Set());
    };

    const selectMany = (ids: string[]) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.add(id));
        return next;
      });
    };

    const deselectMany = (ids: string[]) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    };

    const setMany = (ids: string[]) => {
      setSelectedIds(new Set(ids));
    };

    return {
      selectedIds,
      selectedCount: selectedIds.size,
      toggleOne,
      clear,
      selectMany,
      deselectMany,
      setMany,
    };
  },
}));

const useDebouncedValueMock = vi.fn((v: string) => v);
vi.mock('../../../shared/hooks/useDebouncedValue', () => ({
  useDebouncedValue: (v: string) => useDebouncedValueMock(v),
}));

interface DirectoryTableProps {
  data: UserDTO[];
  isAdmin: boolean;
  sorting: SortingState;
  onSortingChange: (updater: SortingState | ((prev: SortingState) => SortingState)) => void;
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  pageRowIds: string[];
  onToggleAllPage: (checked: boolean) => void;
}

vi.mock('../components/DirectoryTable', () => ({
  DirectoryTable: (props: DirectoryTableProps) => (
    <div>
      <div data-testid="table-count">{props.data.length}</div>
      {props.data.map((u) => (
        <button key={u.id} type="button" onClick={() => props.onToggleRow(u.id)}>
          toggle-{u.id}
        </button>
      ))}
      <button type="button" onClick={() => props.onToggleAllPage(true)}>
        select-all-page
      </button>
    </div>
  ),
}));

interface BulkActionsProps {
  selectedCount: number;
  isAdmin: boolean;
  isPending: boolean;
  onClear: () => void;
  onSetRole: (role: UserRole) => void;
  onSetStatus: (status: UserStatus) => void;
}

vi.mock('../components/BulkActions', () => ({
  BulkActions: (props: BulkActionsProps) => (
    <div>
      <div data-testid="bulk-selected">{props.selectedCount}</div>
      <button type="button" onClick={() => props.onSetStatus('Suspended')}>
        bulk-status-suspended
      </button>
      <button type="button" onClick={() => props.onSetRole('Admin')}>
        bulk-role-admin
      </button>
      <button type="button" onClick={props.onClear}>
        bulk-clear
      </button>
    </div>
  ),
}));

const makeUser = (partial: Partial<UserDTO>): UserDTO => ({
  id: partial.id ?? '1',
  firstName: partial.firstName ?? 'Mike',
  lastName: partial.lastName ?? 'Wheeler',
  pronouns: partial.pronouns ?? 'he/him',
  email: partial.email ?? 'mike@example.com',
  registeredAt: partial.registeredAt ?? new Date('2024-01-01').toISOString(),
  lastLoginAt: partial.lastLoginAt ?? null,
  roles: partial.roles ?? ['Student'],
  status: partial.status ?? 'Active',
  grade: partial.grade,
  homeroom: partial.homeroom,
  department: partial.department,
  campus: partial.campus,
  phone: partial.phone,
  notes: partial.notes,
});

const baseUsersQuery: UsersQueryReturn = {
  data: [
    makeUser({ id: '1', firstName: 'Eleven', roles: ['Student'], email: 's1@northridge.edu' }),
    makeUser({ id: '2', firstName: 'Robin', roles: ['Teacher'], email: 'robin@northridge.edu' }),
    makeUser({
      id: '3',
      firstName: 'Sam',
      roles: ['Staff'],
      status: 'Suspended',
      email: 'sam@northridge.edu',
    }),
  ],
  isLoading: false,
  isError: false,
  error: null,
  isFetching: false,
};

describe('DirectoryPage', () => {
  beforeEach(() => {
    bulkMutateAsync.mockReset();
    useBulkUpdateUsersMutationMock.mockReset();
    useUsersQueryMock.mockReset();
    useDebouncedValueMock.mockReset();

    useBulkUpdateUsersMutationMock.mockReturnValue({
      mutateAsync: bulkMutateAsync,
      isPending: false,
      isError: false,
      error: null,
    });

    useUsersQueryMock.mockReturnValue({
      data: [
        makeUser({ id: '1', firstName: 'Eleven', roles: ['Student'], email: 's1@northridge.edu' }),
        makeUser({
          id: '2',
          firstName: 'Robin',
          roles: ['Teacher'],
          email: 'robin@northridge.edu',
        }),
        makeUser({
          id: '3',
          firstName: 'Sam',
          roles: ['Staff'],
          status: 'Suspended',
          email: 'sam@northridge.edu',
        }),
      ],
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
    });

    useUsersQueryMock.mockReturnValue(baseUsersQuery);

    useDebouncedValueMock.mockImplementation((v: string) => v);
    mockRole = 'Admin';
  });

  it('renders total users count', () => {
    render(<DirectoryPage />);
    expect(screen.getByText('3 users')).toBeInTheDocument();
  });

  it('shows "Updating…" when isFetching is true', () => {
    useUsersQueryMock.mockReturnValueOnce({
      ...baseUsersQuery,
      isFetching: true,
    });

    render(<DirectoryPage />);
    expect(screen.getByText('Updating…')).toBeInTheDocument();
  });

  it('shows "Filtering…" when q differs from debouncedQ', async () => {
    const user = userEvent.setup();

    useDebouncedValueMock.mockImplementation((v: string) => (v === '' ? '' : ''));

    render(<DirectoryPage />);

    await user.type(screen.getByLabelText('Search users'), 'r');
    expect(screen.getByText('Filtering…')).toBeInTheDocument();
  });

  it('renders bulk mutation error alert', () => {
    useBulkUpdateUsersMutationMock.mockReturnValueOnce({
      mutateAsync: bulkMutateAsync,
      isPending: false,
      isError: true,
      error: new Error('Bulk failed'),
    });

    render(<DirectoryPage />);
    expect(screen.getByRole('alert')).toHaveTextContent('Bulk failed');
  });

  it('renders loading state from users query', () => {
    useUsersQueryMock.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      isFetching: false,
    });

    render(<DirectoryPage />);
    expect(screen.getByText('Loading users…')).toBeInTheDocument();
  });

  it('renders error state from users query', () => {
    useUsersQueryMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load users (500)'),
      isFetching: false,
    });

    render(<DirectoryPage />);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load users (500)');
  });

  it('filters by search query', async () => {
    const user = userEvent.setup();
    render(<DirectoryPage />);

    expect(screen.getByTestId('table-count')).toHaveTextContent('3');

    await user.type(screen.getByLabelText('Search users'), 'robin');
    expect(screen.getByTestId('table-count')).toHaveTextContent('1');
  });

  it('filters by role and status', async () => {
    const user = userEvent.setup();
    render(<DirectoryPage />);

    await user.selectOptions(screen.getByLabelText('Filter by role'), 'Teacher');
    expect(screen.getByTestId('table-count')).toHaveTextContent('1');

    await user.selectOptions(screen.getByLabelText('Filter by status'), 'Suspended');
    expect(screen.getByTestId('table-count')).toHaveTextContent('0');
  });

  it('selecting a row shows BulkActions and clears selection after bulk mutate', async () => {
    const user = userEvent.setup();
    bulkMutateAsync.mockResolvedValueOnce({ updatedCount: 1 });

    render(<DirectoryPage />);

    await user.click(screen.getByRole('button', { name: 'toggle-1' }));
    expect(screen.getByTestId('bulk-selected')).toHaveTextContent('1');

    await user.click(screen.getByRole('button', { name: 'bulk-status-suspended' }));

    expect(bulkMutateAsync).toHaveBeenCalledWith({
      ids: ['1'],
      payload: { status: 'Suspended' },
    });

    expect(screen.queryByTestId('bulk-selected')).toBeNull();
  });

  it('bulk role Admin uses roles [Admin, Staff]', async () => {
    const user = userEvent.setup();
    bulkMutateAsync.mockResolvedValueOnce({ updatedCount: 1 });

    render(<DirectoryPage />);

    await user.click(screen.getByRole('button', { name: 'toggle-2' }));
    await user.click(screen.getByRole('button', { name: 'bulk-role-admin' }));

    expect(bulkMutateAsync).toHaveBeenCalledWith({
      ids: ['2'],
      payload: { roles: ['Admin', 'Staff'] },
    });
  });

  it('reset clears filters and selection', async () => {
    const user = userEvent.setup();
    render(<DirectoryPage />);

    await user.type(screen.getByLabelText('Search users'), 'robin');
    expect(screen.getByTestId('table-count')).toHaveTextContent('1');

    await user.click(screen.getByRole('button', { name: 'toggle-2' }));
    expect(screen.getByTestId('bulk-selected')).toHaveTextContent('1');

    await user.click(screen.getByLabelText('Reset filters'));

    expect(screen.getByTestId('table-count')).toHaveTextContent('3');
    expect(screen.queryByTestId('bulk-selected')).toBeNull();
  });
});
