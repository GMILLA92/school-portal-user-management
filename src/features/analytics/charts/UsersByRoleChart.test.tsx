import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { UsersByRoleChart } from './UsersByRoleChart';

describe('UsersByRoleChart', () => {
  it('renders loading', () => {
    render(<UsersByRoleChart data={[]} isLoading />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders error', () => {
    render(<UsersByRoleChart data={[]} isError />);
    expect(screen.getByText('Couldn’t load users by role.')).toBeInTheDocument();
  });

  it('renders chart ticks for provided data', () => {
    render(
      <UsersByRoleChart
        data={[
          { role: 'Student', count: 10 },
          { role: 'Teacher', count: 2 },
        ]}
      />,
    );

    expect(screen.getAllByText('Student').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Teacher').length).toBeGreaterThan(0);
  });
});
