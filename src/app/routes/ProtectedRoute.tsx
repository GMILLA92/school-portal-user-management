import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../../features/auth/AuthContext';

import type { ReactElement } from 'react';

export const ProtectedRoute = ({
  children,
  requireAdmin,
}: {
  children: ReactElement;
  requireAdmin?: boolean;
}) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireAdmin && user.role !== 'Admin') {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};
