import { createBrowserRouter } from 'react-router-dom';

import { DirectoryPage } from '../features/directory';

export const router = createBrowserRouter([
  { path: '/', element: <DirectoryPage /> },
  { path: '/directory', element: <DirectoryPage /> },
]);
