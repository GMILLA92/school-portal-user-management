import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { UserField } from './UserField';

describe('UserField', () => {
  it('renders label and value', () => {
    render(<UserField icon={<span>i</span>} label="Email" value="test@example.com" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
});
