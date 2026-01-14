import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LoginPage } from './LoginPage';

type AuthRole = 'Admin' | 'Teacher' | 'Staff';

const navigateMock = vi.fn();

let mockUser: { id: string; name: string; role: AuthRole } | null = null;
const loginAsMock = vi.fn<(role: AuthRole) => void>();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
  };
});

vi.mock('./AuthContext', () => ({
  useAuth: () => ({ user: mockUser, loginAs: loginAsMock }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    loginAsMock.mockReset();
    mockUser = null;
  });

  it('renders login options when signed out', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText('Login')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Continue as Admin/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue as Teacher/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue as Staff/i })).toBeInTheDocument();
  });

  it('when signed in as Staff, navigates to /insights', () => {
    mockUser = { id: 'u-staff', name: 'Sam', role: 'Staff' };
    render(<LoginPage />);
    expect(screen.getByTestId('navigate')).toHaveTextContent('/insights');
  });

  it('when signed in as Admin, navigates to /directory', () => {
    mockUser = { id: 'u-admin', name: 'G. Milla', role: 'Admin' };
    render(<LoginPage />);
    expect(screen.getByTestId('navigate')).toHaveTextContent('/directory');
  });

  it('clicking "Continue as Teacher" calls loginAs and navigates to /directory', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole('button', { name: /Continue as Teacher/i }));

    expect(loginAsMock).toHaveBeenCalledWith('Teacher');
    expect(navigateMock).toHaveBeenCalledWith('/directory', { replace: true });
  });

  it('clicking "Continue as Staff" calls loginAs and navigates to /insights', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole('button', { name: /Continue as Staff/i }));

    expect(loginAsMock).toHaveBeenCalledWith('Staff');
    expect(navigateMock).toHaveBeenCalledWith('/insights', { replace: true });
  });
});
