import { describe, expect, it, vi, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';

import { renderHookWithQueryClient } from '../../../test/utils/renderHookWithQueryClient';

import { useUsersByRoleQuery } from './useUsersByRoleQuery';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useUsersByRoleQuery', () => {
  it('fetches users-by-role successfully', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify([{ role: 'Student', count: 10 }]), { status: 200 }),
    );

    const { result } = renderHookWithQueryClient(() => useUsersByRoleQuery());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.[0]?.role).toBe('Student');
    expect(result.current.data?.[0]?.count).toBe(10);
  });

  it('sets error when response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('nope', { status: 500 }));

    const { result } = renderHookWithQueryClient(() => useUsersByRoleQuery());

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
