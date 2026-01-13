import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../../features/auth/AuthContext';

import type { ReactElement } from 'react';
import type { AuthRole } from '../../features/auth/types';

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: ReactElement;
  allowedRoles?: AuthRole[];
}) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};
