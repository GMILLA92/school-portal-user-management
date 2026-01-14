import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ForbiddenPage } from './ForbiddenPage';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const logoutMock = vi.fn();
vi.mock('../../features/auth/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u-staff', name: 'Sam', role: 'Staff' },
    logout: logoutMock,
  }),
}));

describe('ForbiddenPage', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    logoutMock.mockClear();
  });

  it('shows access denied message with current role', () => {
    render(<ForbiddenPage />);
    expect(screen.getByText('Access denied')).toBeInTheDocument();
    expect(screen.getByText('Staff')).toBeInTheDocument();
  });

  it('Go back navigates -1', async () => {
    const user = userEvent.setup();
    render(<ForbiddenPage />);

    await user.click(screen.getByRole('button', { name: 'Go back' }));
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('Switch role logs out and navigates to /login replace', async () => {
    const user = userEvent.setup();
    render(<ForbiddenPage />);

    await user.click(screen.getByRole('button', { name: 'Switch role' }));
    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/login', { replace: true });
  });
});
