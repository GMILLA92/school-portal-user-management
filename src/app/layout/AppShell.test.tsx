import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppShell } from './AppShell';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const logoutMock = vi.fn();
let mockUser: { id: string; name: string; role: string } | null = {
  id: 'u-admin',
  name: 'G. Milla',
  role: 'Admin',
};

vi.mock('../../features/auth/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    logout: logoutMock,
  }),
}));

describe('AppShell', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    logoutMock.mockClear();
    mockUser = { id: 'u-admin', name: 'G. Milla', role: 'Admin' };
  });

  it('renders brand and current user pill', () => {
    render(
      <MemoryRouter initialEntries={['/directory']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="directory" element={<div>Directory content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('School Portal')).toBeInTheDocument();
    expect(screen.getByLabelText('Current user')).toHaveTextContent('G. Milla · Admin');
    expect(screen.getByText('Directory content')).toBeInTheDocument();
  });

  it('logout calls logout and navigates to /login replace', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/directory']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="directory" element={<div>Directory content</div>} />
          </Route>
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Logout' }));
    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('shows Signed out when user is null', () => {
    mockUser = null;

    render(
      <MemoryRouter initialEntries={['/directory']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="directory" element={<div>Directory content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Signed out')).toBeInTheDocument();
  });

  it('has primary nav links', () => {
    render(
      <MemoryRouter initialEntries={['/directory']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="directory" element={<div>Directory content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Directory' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Insights' })).toBeInTheDocument();
  });
});
