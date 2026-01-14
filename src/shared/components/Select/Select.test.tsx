import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Select } from './Select';

describe('Select', () => {
  it('renders a select with label and hint', () => {
    render(
      <Select
        name="role"
        label="Role"
        hint="Pick one"
        defaultValue="Teacher"
        aria-label="Role select"
      >
        <option value="Student">Student</option>
        <option value="Teacher">Teacher</option>
      </Select>,
    );

    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Pick one')).toBeInTheDocument();

    expect(screen.getByRole('combobox', { name: 'Role select' })).toBeInTheDocument();
  });

  it('uses provided id to connect label htmlFor and select id', () => {
    render(
      <Select id="role-id" label="Role" name="role">
        <option value="Student">Student</option>
      </Select>,
    );

    const label = screen.getByText('Role');
    expect(label).toHaveAttribute('for', 'role-id');

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('id', 'role-id');
  });

  it('falls back to name as id when id is not provided', () => {
    render(
      <Select label="Role" name="role">
        <option value="Student">Student</option>
      </Select>,
    );

    const label = screen.getByText('Role');
    expect(label).toHaveAttribute('for', 'role');

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('id', 'role');
  });

  it('does not render label or hint when not provided', () => {
    render(
      <Select name="status" aria-label="Status">
        <option value="Active">Active</option>
      </Select>,
    );

    expect(screen.queryByText('Status')).not.toBeInTheDocument(); // label text
    expect(screen.getByRole('combobox', { name: 'Status' })).toBeInTheDocument();
  });

  it('merges wrapper className', () => {
    render(
      <Select name="status" aria-label="Status" className="extra-class">
        <option value="Active">Active</option>
      </Select>,
    );

    const select = screen.getByRole('combobox', { name: 'Status' });
    const wrapper = select.parentElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper).toHaveClass('extra-class');
  });

  it('forwards props to the select element', () => {
    render(
      <Select
        name="role"
        aria-label="Role"
        disabled
        required
        defaultValue="Student"
        data-testid="role-select"
      >
        <option value="Student">Student</option>
        <option value="Teacher">Teacher</option>
      </Select>,
    );

    const select = screen.getByTestId('role-select');
    expect(select).toBeDisabled();
    expect(select).toBeRequired();
    expect(select).toHaveValue('Student');
  });
});
