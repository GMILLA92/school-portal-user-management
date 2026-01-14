import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../api/useUsersQuery', () => ({
  useUsersQuery: vi.fn(),
}));

vi.mock('../api/useUpdateUserMutation', () => ({
  useUpdateUserMutation: vi.fn(),
}));

vi.mock('../../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useUsersQuery } from '../api/useUsersQuery';
import { useUpdateUserMutation } from '../api/useUpdateUserMutation';
import { useAuth } from '../../auth/AuthContext';

import { UserDetailsPage } from './UserDetailsPage';

import type { UserDTO } from '../../users/model/types';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const useUsersQueryMock = useUsersQuery as unknown as ReturnType<typeof vi.fn>;
const useUpdateUserMutationMock = useUpdateUserMutation as unknown as ReturnType<typeof vi.fn>;
const useAuthMock = useAuth as unknown as ReturnType<typeof vi.fn>;

function makeUser(partial: Partial<UserDTO>): UserDTO {
  return {
    id: partial.id ?? '1',
    firstName: partial.firstName ?? 'Mike',
    lastName: partial.lastName ?? 'Wheeler',
    pronouns: partial.pronouns ?? 'he/him',
    email: partial.email ?? 'mike@example.com',
    registeredAt: partial.registeredAt ?? new Date('2024-01-01').toISOString(),
    lastLoginAt: partial.lastLoginAt ?? new Date('2024-02-01').toISOString(),
    roles: partial.roles ?? ['Staff'],
    status: partial.status ?? 'Active',
    grade: partial.grade,
    homeroom: partial.homeroom,
    department: partial.department,
    campus: partial.campus,
    phone: partial.phone,
    notes: partial.notes,
  };
}

function renderRoutes(entry: string) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/directory" element={<div>Directory</div>} />
        <Route path="/directory/:id" element={<UserDetailsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('UserDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock.mockReset();
  });

  it('shows loading state', () => {
    useAuthMock.mockReturnValue({ user: { role: 'Admin' } });
    useUsersQueryMock.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    useUpdateUserMutationMock.mockReturnValue({ isPending: false });

    renderRoutes('/directory/1');

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows error state', () => {
    useAuthMock.mockReturnValue({ user: { role: 'Admin' } });
    useUsersQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Boom'),
    });
    useUpdateUserMutationMock.mockReturnValue({ isPending: false });

    renderRoutes('/directory/1');

    expect(screen.getByText('Boom')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to Directory' })).toBeInTheDocument();
  });

  it('shows not found when user id not in data', () => {
    useAuthMock.mockReturnValue({ user: { role: 'Admin' } });
    useUsersQueryMock.mockReturnValue({
      data: [makeUser({ id: '999' })],
      isLoading: false,
      isError: false,
    });
    useUpdateUserMutationMock.mockReturnValue({ isPending: false });

    renderRoutes('/directory/1');

    expect(screen.getByText('User not found')).toBeInTheDocument();
    expect(screen.getByText(/No user with id/)).toBeInTheDocument();
  });

  it('renders optional fields when present', () => {
    useAuthMock.mockReturnValue({ user: { role: 'Admin' } });
    useUsersQueryMock.mockReturnValue({
      data: [
        makeUser({
          id: '1',
          department: 'Math',
          campus: 'North',
          phone: '+1 (555) 111-2222',
          notes: 'Prefers email.',
        }),
      ],
      isLoading: false,
      isError: false,
    });

    useUpdateUserMutationMock.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutateAsync: vi.fn(),
    });

    renderRoutes('/directory/1');

    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('Math')).toBeInTheDocument();

    expect(screen.getByText('Campus')).toBeInTheDocument();
    expect(screen.getByText('North')).toBeInTheDocument();

    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('+1 (555) 111-2222')).toBeInTheDocument();

    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Prefers email.')).toBeInTheDocument();
  });

  it('teacher is read-only even if mode=edit in URL', () => {
    useAuthMock.mockReturnValue({ user: { role: 'Teacher' } });

    useUsersQueryMock.mockReturnValue({
      data: [makeUser({ id: '1', roles: ['Staff'], status: 'Active' })],
      isLoading: false,
      isError: false,
    });

    useUpdateUserMutationMock.mockReturnValue({
      isPending: false,
      isError: false,
      mutateAsync: vi.fn(),
    });

    renderRoutes('/directory/1?mode=edit');

    expect(screen.getByText('Roles')).toBeInTheDocument();
    expect(screen.queryByLabelText('Role')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
  });

  it('admin shows Edit button when not in edit mode', () => {
    useAuthMock.mockReturnValue({ user: { role: 'Admin' } });
    useUsersQueryMock.mockReturnValue({
      data: [makeUser({ id: '1', roles: ['Staff'], status: 'Active' })],
      isLoading: false,
      isError: false,
    });

    useUpdateUserMutationMock.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutateAsync: vi.fn(),
    });

    renderRoutes('/directory/1');

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('back button navigates to /directory', async () => {
    const user = userEvent.setup();

    useAuthMock.mockReturnValue({ user: { role: 'Admin' } });
    useUsersQueryMock.mockReturnValue({
      data: [makeUser({ id: '1' })],
      isLoading: false,
      isError: false,
    });

    useUpdateUserMutationMock.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutateAsync: vi.fn(),
    });

    renderRoutes('/directory/1');

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(navigateMock).toHaveBeenCalledWith('/directory');
  });

  it('admin can enter edit mode and saving Admin role merges Admin+Staff', async () => {
    const user = userEvent.setup();

    useAuthMock.mockReturnValue({ user: { role: 'Admin' } });

    useUsersQueryMock.mockReturnValue({
      data: [makeUser({ id: '1', roles: ['Teacher'], status: 'Active' })],
      isLoading: false,
      isError: false,
    });

    const mutateAsync = vi.fn().mockResolvedValue({});
    useUpdateUserMutationMock.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutateAsync,
    });

    renderRoutes('/directory/1?mode=edit');

    await user.selectOptions(screen.getByLabelText('Role'), 'Admin');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    const call = mutateAsync.mock.calls[0]?.[0];
    expect(call.id).toBe('1');
    expect(call.payload.roles).toEqual(['Admin', 'Staff']);
  });

  it('admin saving non-admin role replaces roles to [role]', async () => {
    const user = userEvent.setup();

    useAuthMock.mockReturnValue({ user: { role: 'Admin' } });

    useUsersQueryMock.mockReturnValue({
      data: [makeUser({ id: '1', roles: ['Admin', 'Staff'], status: 'Active' })],
      isLoading: false,
      isError: false,
    });

    const mutateAsync = vi.fn().mockResolvedValue({});
    useUpdateUserMutationMock.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutateAsync,
    });

    renderRoutes('/directory/1?mode=edit');

    await user.selectOptions(screen.getByLabelText('Role'), 'Teacher');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const call = mutateAsync.mock.calls[0]?.[0];
    expect(call.payload.roles).toEqual(['Teacher']);
  });

  it('shows update error alert when mutation errors', () => {
    useAuthMock.mockReturnValue({ user: { role: 'Admin' } });
    useUsersQueryMock.mockReturnValue({
      data: [makeUser({ id: '1', roles: ['Staff'], status: 'Active' })],
      isLoading: false,
      isError: false,
    });

    useUpdateUserMutationMock.mockReturnValue({
      isPending: false,
      isError: true,
      error: new Error('Failed to update user (500)'),
      mutateAsync: vi.fn(),
    });

    renderRoutes('/directory/1');

    expect(screen.getByRole('alert')).toHaveTextContent('Failed to update user (500)');
  });
});
