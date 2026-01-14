import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { AppProviders } from './app/AppProviders';
import { router } from './app/router';
import './shared/styles/globals.scss';

// Start MSW in dev or in production when explicitly enabled
const enableMsw = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW === 'true';

if (enableMsw) {
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'warn' });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </React.StrictMode>,
);
