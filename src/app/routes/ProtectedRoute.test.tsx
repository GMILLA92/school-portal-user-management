import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { useAuth } from '../../features/auth/AuthContext';

import { ProtectedRoute } from './ProtectedRoute';

// Mocking useAuth
vi.mock('../../features/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const useAuthMock = useAuth as unknown as ReturnType<typeof vi.fn>;

function renderAt(path: string, ui: React.ReactElement) {
  return render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);
}

describe('ProtectedRoute', () => {
  it('redirects to /login when user is null', () => {
    useAuthMock.mockReturnValue({ user: null });

    renderAt(
      '/directory',
      <Routes>
        <Route
          path="/directory"
          element={
            <ProtectedRoute>
              <div>Directory</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>,
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Directory')).toBeNull();
  });

  it('redirects to /forbidden when role not allowed', () => {
    useAuthMock.mockReturnValue({ user: { id: 'u1', name: 'Sam', role: 'Staff' } });

    renderAt(
      '/directory',
      <Routes>
        <Route
          path="/directory"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Teacher']}>
              <div>Directory</div>
            </ProtectedRoute>
          }
        />
        <Route path="/forbidden" element={<div>Forbidden</div>} />
      </Routes>,
    );

    expect(screen.getByText('Forbidden')).toBeInTheDocument();
    expect(screen.queryByText('Directory')).toBeNull();
  });

  it('renders children when user is allowed', () => {
    useAuthMock.mockReturnValue({ user: { id: 'u2', name: 'Robin', role: 'Teacher' } });

    renderAt(
      '/directory',
      <Routes>
        <Route
          path="/directory"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Teacher']}>
              <div>Directory</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login</div>} />
        <Route path="/forbidden" element={<div>Forbidden</div>} />
      </Routes>,
    );

    expect(screen.getByText('Directory')).toBeInTheDocument();
  });
});
