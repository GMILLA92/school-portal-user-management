import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AuthProvider, useAuth } from './AuthContext';

type AuthRole = 'Admin' | 'Teacher' | 'Staff';

const STORAGE_KEY = 'school-portal-auth';

function Consumer() {
  const { user, loginAs, logout } = useAuth();

  return (
    <div>
      <div data-testid="role">{user?.role ?? 'none'}</div>
      <div data-testid="name">{user?.name ?? 'none'}</div>

      <button type="button" onClick={() => loginAs('Admin' as AuthRole)}>
        login-admin
      </button>
      <button type="button" onClick={() => loginAs('Teacher' as AuthRole)}>
        login-teacher
      </button>
      <button type="button" onClick={() => loginAs('Staff' as AuthRole)}>
        login-staff
      </button>
      <button type="button" onClick={logout}>
        logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to Admin when storage is empty', () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('role')).toHaveTextContent('Admin');
    expect(screen.getByTestId('name')).toHaveTextContent('G. Milla');
  });

  it('loads user from localStorage when present', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ id: 'u-teacher', name: 'Robin Buckley', role: 'Teacher' }),
    );

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('role')).toHaveTextContent('Teacher');
    expect(screen.getByTestId('name')).toHaveTextContent('Robin Buckley');
  });

  it('loginAs(Teacher) sets Teacher user and saves to storage', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'login-teacher' }));

    expect(screen.getByTestId('role')).toHaveTextContent('Teacher');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toMatchObject({
      role: 'Teacher',
      name: 'Robin Buckley',
    });
  });

  it('loginAs(Staff) sets Staff user and saves to storage', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'login-staff' }));

    expect(screen.getByTestId('role')).toHaveTextContent('Staff');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toMatchObject({
      role: 'Staff',
      name: 'Sam Calder',
    });
  });

  it('logout clears user and removes from storage', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'logout' }));

    expect(screen.getByTestId('role')).toHaveTextContent('none');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('useAuth throws if used outside AuthProvider', () => {
    function BadConsumer() {
      useAuth();
      return <div />;
    }

    expect(() => render(<BadConsumer />)).toThrow('useAuth must be used within AuthProvider');
  });

  it('ignores localStorage read errors and falls back to default admin', () => {
    const originalGetItem = localStorage.getItem.bind(localStorage);
    localStorage.getItem = () => {
      throw new Error('boom');
    };

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('role')).toHaveTextContent('Admin');

    localStorage.getItem = originalGetItem;
  });

  it('ignores localStorage write errors (does not crash)', async () => {
    const originalSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = () => {
      throw new Error('boom');
    };

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'login-staff' }));
    expect(screen.getByTestId('role')).toHaveTextContent('Staff');

    localStorage.setItem = originalSetItem;
  });

  it('ignores localStorage remove errors (does not crash)', async () => {
    const originalRemoveItem = localStorage.removeItem.bind(localStorage);

    localStorage.removeItem = () => {
      throw new Error('boom');
    };

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'logout' }));
    expect(screen.getByTestId('role')).toHaveTextContent('none');

    localStorage.removeItem = originalRemoveItem;
  });
});
