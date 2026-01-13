import { createBrowserRouter, Navigate } from 'react-router-dom';

import { DirectoryPage } from '../features/directory/DirectoryPage';
import { InsightsPage } from '../features/insights/InsightsPage';

import { AppShell } from './layout/AppShell';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/directory" replace /> },
      { path: 'directory', element: <DirectoryPage /> },
      { path: 'insights', element: <InsightsPage /> },
    ],
  },
]);
