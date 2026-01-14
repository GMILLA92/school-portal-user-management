import { describe, expect, it, vi, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';

import { renderHookWithQueryClient } from '../../../test/utils/renderHookWithQueryClient';

import { useRegistrationsQuery } from './useRegistrationsQuery';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useRegistrationsQuery', () => {
  it('fetches registrations successfully', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify([{ month: 'Jan', registrations: 1 }]), { status: 200 }),
    );

    const { result } = renderHookWithQueryClient(() => useRegistrationsQuery());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.[0]?.month).toBe('Jan');
    expect(result.current.data?.[0]?.registrations).toBe(1);
  });

  it('sets error when response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('nope', { status: 500 }));

    const { result } = renderHookWithQueryClient(() => useRegistrationsQuery());

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
