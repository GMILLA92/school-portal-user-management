import { createBrowserRouter, Navigate } from 'react-router-dom';

import { LoginPage } from '../features/auth/LoginPage';
import { DirectoryPage } from '../features/directory/pages/DirectoryPage';
import { UserDetailsPage } from '../features/directory/pages/UserDetailsPage';
import { AnalyticsPage } from '../features/analytics/AnalyticsPage';

import { AppShell } from './layout/AppShell';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { ForbiddenPage } from './routes/ForbiddenPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/forbidden', element: <ForbiddenPage /> },

  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/directory" replace /> },
      {
        path: 'directory',
        element: (
          <ProtectedRoute allowedRoles={['Admin', 'Teacher']}>
            <DirectoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'analytics',
        element: (
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'directory/:id',
        element: (
          <ProtectedRoute allowedRoles={['Admin', 'Teacher']}>
            <UserDetailsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
