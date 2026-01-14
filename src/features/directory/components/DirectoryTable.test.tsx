import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DirectoryTable } from './DirectoryTable';

import type { UserDTO } from '../../users/model/types';

// Mocking react-router navigate
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

function makeUser(partial: Partial<UserDTO>): UserDTO {
  return {
    id: partial.id ?? '1',
    firstName: partial.firstName ?? 'Mike',
    lastName: partial.lastName ?? 'Wheeler',
    pronouns: partial.pronouns ?? 'he/him',
    email: partial.email ?? 'mike@example.com',
    registeredAt: partial.registeredAt ?? new Date().toISOString(),
    lastLoginAt: partial.lastLoginAt ?? null,
    roles: partial.roles ?? ['Student'],
    status: partial.status ?? 'Active',
    grade: partial.grade,
    homeroom: partial.homeroom,
    department: partial.department,
    campus: partial.campus,
    phone: partial.phone,
    notes: partial.notes,
  };
}

describe('DirectoryTable', () => {
  beforeEach(() => {
    navigateMock.mockClear();
  });

  it('renders rows and supports row selection toggle', async () => {
    const user = userEvent.setup();

    const data = [
      makeUser({ id: '1', firstName: 'Eleven' }),
      makeUser({ id: '2', firstName: 'Will' }),
    ];

    const onToggleRow = vi.fn();
    const onToggleAllPage = vi.fn();

    render(
      <DirectoryTable
        data={data}
        isAdmin={false}
        sorting={[{ id: 'name', desc: false }]}
        onSortingChange={vi.fn()}
        selectedIds={new Set()}
        onToggleRow={onToggleRow}
        pageRowIds={['1', '2']}
        onToggleAllPage={onToggleAllPage}
      />,
    );

    expect(screen.getByText('Eleven Wheeler')).toBeInTheDocument();
    expect(screen.getByText('Will Wheeler')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Select Eleven Wheeler'));
    expect(onToggleRow).toHaveBeenCalledWith('1');

    await user.click(screen.getByLabelText('Select all rows on this page'));
    expect(onToggleAllPage).toHaveBeenCalledWith(true);
  });

  it('shows Edit button only for admin and navigates correctly', async () => {
    const user = userEvent.setup();

    const data = [makeUser({ id: '7', firstName: 'Robin', lastName: 'Buckley' })];

    render(
      <DirectoryTable
        data={data}
        isAdmin={true}
        sorting={[{ id: 'name', desc: false }]}
        onSortingChange={vi.fn()}
        selectedIds={new Set(['7'])}
        onToggleRow={vi.fn()}
        pageRowIds={['7']}
        onToggleAllPage={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'View' }));
    expect(navigateMock).toHaveBeenCalledWith('/directory/7');

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(navigateMock).toHaveBeenCalledWith('/directory/7?mode=edit');
  });

  it('does not show Edit button for non-admin', () => {
    const data = [makeUser({ id: '7', firstName: 'Robin', lastName: 'Buckley' })];

    render(
      <DirectoryTable
        data={data}
        isAdmin={false}
        sorting={[{ id: 'name', desc: false }]}
        onSortingChange={vi.fn()}
        selectedIds={new Set()}
        onToggleRow={vi.fn()}
        pageRowIds={['7']}
        onToggleAllPage={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
  });

  it('shows empty state when no rows', () => {
    render(
      <DirectoryTable
        data={[]}
        isAdmin={false}
        sorting={[{ id: 'name', desc: false }]}
        onSortingChange={vi.fn()}
        selectedIds={new Set()}
        onToggleRow={vi.fn()}
        pageRowIds={[]}
        onToggleAllPage={vi.fn()}
      />,
    );

    expect(screen.getByText('No users match your filters.')).toBeInTheDocument();
  });
});
