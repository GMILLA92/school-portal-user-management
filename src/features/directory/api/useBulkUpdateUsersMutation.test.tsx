import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react';

import { useBulkUpdateUsersMutation } from './useBulkUpdateUsersMutation';

vi.mock('./useUpdateUserMutation', () => ({
  useUpdateUserMutation: vi.fn(),
}));

import { useUpdateUserMutation } from './useUpdateUserMutation';

const useUpdateUserMutationMock = useUpdateUserMutation as unknown as ReturnType<typeof vi.fn>;

function wrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe('useBulkUpdateUsersMutation', () => {
  it('calls updateOne.mutateAsync for each id', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useUpdateUserMutationMock.mockReturnValue({ mutateAsync });

    const { result } = renderHook(() => useBulkUpdateUsersMutation(), { wrapper: wrapper() });

    await act(async () => {
      const r = await result.current.mutateAsync({
        ids: ['1', '2', '3'],
        payload: { status: 'Suspended' },
      });

      expect(r.updatedCount).toBe(3);
    });

    expect(mutateAsync).toHaveBeenCalledTimes(3);
    expect(mutateAsync).toHaveBeenNthCalledWith(1, { id: '1', payload: { status: 'Suspended' } });
    expect(mutateAsync).toHaveBeenNthCalledWith(2, { id: '2', payload: { status: 'Suspended' } });
    expect(mutateAsync).toHaveBeenNthCalledWith(3, { id: '3', payload: { status: 'Suspended' } });
  });
});
