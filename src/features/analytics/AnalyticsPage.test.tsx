import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AnalyticsPage } from './AnalyticsPage';

vi.mock('./api/useRegistrationsQuery', () => ({
  useRegistrationsQuery: vi.fn(),
}));

vi.mock('./api/useUsersByRoleQuery', () => ({
  useUsersByRoleQuery: vi.fn(),
}));

import { useRegistrationsQuery } from './api/useRegistrationsQuery';
import { useUsersByRoleQuery } from './api/useUsersByRoleQuery';

const useRegistrationsQueryMock = useRegistrationsQuery as unknown as ReturnType<typeof vi.fn>;
const useUsersByRoleQueryMock = useUsersByRoleQuery as unknown as ReturnType<typeof vi.fn>;

describe('AnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders headings and loading states', () => {
    useRegistrationsQueryMock.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    useUsersByRoleQueryMock.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    render(<AnalyticsPage />);

    expect(screen.getByRole('heading', { name: 'Analytics' })).toBeInTheDocument();
    expect(screen.getAllByText('Last 12 months').length).toBeGreaterThan(0);
    expect(screen.getByText('Users by role')).toBeInTheDocument();

    expect(screen.getAllByText('Loading…').length).toBeGreaterThanOrEqual(1);
  });

  it('renders chart ticks when data exists', () => {
    useRegistrationsQueryMock.mockReturnValue({
      data: [{ month: 'Jan', registrations: 5 }],
      isLoading: false,
      isError: false,
    });

    useUsersByRoleQueryMock.mockReturnValue({
      data: [{ role: 'Student', count: 10 }],
      isLoading: false,
      isError: false,
    });

    render(<AnalyticsPage />);

    expect(screen.getAllByText('Jan').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Student').length).toBeGreaterThan(0);
  });
});
