import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DirectoryToolbar } from './DirectoryToolbar';

describe('DirectoryToolbar', () => {
  it('calls onQChange when typing search', async () => {
    const user = userEvent.setup();
    const onQChange = vi.fn();

    render(
      <DirectoryToolbar
        q=""
        onQChange={onQChange}
        role="All"
        onRoleChange={vi.fn()}
        status="All"
        onStatusChange={vi.fn()}
        pageSize={25}
        onPageSizeChange={vi.fn()}
        canReset={false}
        onReset={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText('Search users'), 'mike');
    expect(onQChange).toHaveBeenCalled();
  });

  it('reset button is disabled when canReset=false', () => {
    render(
      <DirectoryToolbar
        q=""
        onQChange={vi.fn()}
        role="All"
        onRoleChange={vi.fn()}
        status="All"
        onStatusChange={vi.fn()}
        pageSize={25}
        onPageSizeChange={vi.fn()}
        canReset={false}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Reset filters')).toBeDisabled();
  });

  it('calls onReset when canReset=true and clicked', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(
      <DirectoryToolbar
        q="x"
        onQChange={vi.fn()}
        role="Teacher"
        onRoleChange={vi.fn()}
        status="Active"
        onStatusChange={vi.fn()}
        pageSize={10}
        onPageSizeChange={vi.fn()}
        canReset={true}
        onReset={onReset}
      />,
    );

    await user.click(screen.getByLabelText('Reset filters'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
