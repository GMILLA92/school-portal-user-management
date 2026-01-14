import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BulkActions } from './BulkActions';

describe('BulkActions', () => {
  it('disables Apply buttons when not admin', async () => {
    const user = userEvent.setup();

    render(
      <BulkActions
        selectedCount={3}
        isAdmin={false}
        isPending={false}
        onClear={vi.fn()}
        onSetRole={vi.fn()}
        onSetStatus={vi.fn()}
      />,
    );

    const applyButtons = screen.getAllByRole('button', { name: 'Apply' });
    expect(applyButtons).toHaveLength(2);
    applyButtons.forEach((b) => expect(b).toBeDisabled());

    const clearBtn = screen.getByRole('button', { name: 'Clear' });
    expect(clearBtn).toBeEnabled();

    await user.click(clearBtn);
  });

  it('calls onSetRole with selected role when admin', async () => {
    const user = userEvent.setup();
    const onSetRole = vi.fn();

    render(
      <BulkActions
        selectedCount={2}
        isAdmin={true}
        isPending={false}
        onClear={vi.fn()}
        onSetRole={onSetRole}
        onSetStatus={vi.fn()}
      />,
    );

    await user.selectOptions(screen.getByLabelText('Bulk role'), 'Teacher');
    await user.click(screen.getAllByRole('button', { name: 'Apply' })[0]);

    expect(onSetRole).toHaveBeenCalledWith('Teacher');
  });

  it('calls onSetStatus with selected status when admin', async () => {
    const user = userEvent.setup();
    const onSetStatus = vi.fn();

    render(
      <BulkActions
        selectedCount={2}
        isAdmin={true}
        isPending={false}
        onClear={vi.fn()}
        onSetRole={vi.fn()}
        onSetStatus={onSetStatus}
      />,
    );

    await user.selectOptions(screen.getByLabelText('Bulk status'), 'Suspended');
    await user.click(screen.getAllByRole('button', { name: 'Apply' })[1]);

    expect(onSetStatus).toHaveBeenCalledWith('Suspended');
  });

  it('disables everything when pending (including clear)', () => {
    render(
      <BulkActions
        selectedCount={2}
        isAdmin={true}
        isPending={true}
        onClear={vi.fn()}
        onSetRole={vi.fn()}
        onSetStatus={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();
    screen.getAllByRole('button', { name: 'Apply' }).forEach((b) => expect(b).toBeDisabled());
  });
});
