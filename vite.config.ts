import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setupTests.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],

      include: ['src/**/*.{ts,tsx}'],

      exclude: [
        'src/main.tsx',
        'src/test/**',

        // type-only / declarations
        'src/**/*.d.ts',
        'src/**/types.ts',

        // barrel files
        'src/**/index.ts',

        // app wiring (covered better by e2e)
        'src/app/router.tsx',
        'src/app/AppProviders.tsx',

        // MSW + mock data generation
        'src/mocks/**',

        // pages that have not been implemented yet
        'src/features/insights/**',
      ],

      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
