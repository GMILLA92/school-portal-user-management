import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('renders with default type="button"', () => {
    render(<Button>Click</Button>);

    const btn = screen.getByRole('button', { name: 'Click' });
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('allows overriding type via props', () => {
    render(<Button type="submit">Save</Button>);

    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn).toHaveAttribute('type', 'submit');
  });

  it('applies provided className', () => {
    render(<Button className="extra-class">Click</Button>);

    const btn = screen.getByRole('button', { name: 'Click' });
    expect(btn).toHaveClass('extra-class');
  });

  it('supports variants (adds variant class)', () => {
    render(<Button variant="primary">Primary</Button>);

    const btn = screen.getByRole('button', { name: 'Primary' });
    expect(btn.className).not.toEqual('');
  });

  it('forwards standard button props', () => {
    render(
      <Button
        onClick={() => {
          /* empty */
        }}
        disabled
        aria-label="Do thing"
      >
        Do
      </Button>,
    );

    const btn = screen.getByRole('button', { name: 'Do thing' });
    expect(btn).toBeDisabled();
  });
});
