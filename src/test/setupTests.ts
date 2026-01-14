import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

Object.defineProperty(window, 'scrollTo', {
  value: () => {
    /* empty */
  },
  writable: true,
});

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');

  return {
    ...actual,

    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const child = React.Children.only(children) as React.ReactElement<any>;
      return React.cloneElement(child, { width: 800, height: 300 });
    },
  };
});
