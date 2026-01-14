import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { RegistrationsChart } from './RegistrationsChart';

describe('RegistrationsChart', () => {
  it('renders loading', () => {
    render(<RegistrationsChart data={[]} isLoading />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders error', () => {
    render(<RegistrationsChart data={[]} isError />);
    expect(screen.getByText('Couldn’t load registrations.')).toBeInTheDocument();
  });

  it('renders chart ticks for provided data', () => {
    render(
      <RegistrationsChart
        data={[
          { month: 'Jan', registrations: 10 },
          { month: 'Feb', registrations: 20 },
        ]}
      />,
    );
    expect(screen.getAllByText('Jan').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Feb').length).toBeGreaterThan(0);
  });
});
