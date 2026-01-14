import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react';

import { useUpdateUserMutation } from './useUpdateUserMutation';
import { usersQueryKey } from './useUsersQuery';

import type { UserDTO } from '../../users/model/types';

function makeClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function makeWrapper(client: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

const makeUser = (partial: Partial<UserDTO>): UserDTO => ({
  id: partial.id ?? '1',
  firstName: partial.firstName ?? 'Mike',
  lastName: partial.lastName ?? 'Wheeler',
  pronouns: partial.pronouns ?? 'he/him',
  email: partial.email ?? 'mike@example.com',
  registeredAt: partial.registeredAt ?? new Date('2024-01-01').toISOString(),
  lastLoginAt: partial.lastLoginAt ?? null,
  roles: partial.roles ?? ['Student'],
  status: partial.status ?? 'Active',
  grade: partial.grade,
  homeroom: partial.homeroom,
  department: partial.department,
  campus: partial.campus,
  phone: partial.phone,
  notes: partial.notes,
});

describe('useUpdateUserMutation', () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch');

  beforeEach(() => {
    fetchSpy.mockReset();
  });

  it('PATCHes user and updates cached users list', async () => {
    const client = makeClient();
    client.setQueryData<UserDTO[]>(usersQueryKey, [
      makeUser({ id: '1', status: 'Active' }),
      makeUser({ id: '2', status: 'Active' }),
    ]);

    const updated = makeUser({ id: '2', status: 'Suspended', roles: ['Staff'] });

    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify(updated), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const { result } = renderHook(() => useUpdateUserMutation(), {
      wrapper: makeWrapper(client),
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: '2',
        payload: { status: 'Suspended', roles: ['Staff'] },
      });
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/users/2',
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        body: JSON.stringify({ status: 'Suspended', roles: ['Staff'] }),
      }),
    );

    const after = client.getQueryData<UserDTO[]>(usersQueryKey);
    expect(after?.find((u) => u.id === '2')?.status).toBe('Suspended');
    expect(after?.find((u) => u.id === '1')?.status).toBe('Active');
  });

  it('throws a helpful error when PATCH fails', async () => {
    const client = makeClient();

    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 500 }));

    const { result } = renderHook(() => useUpdateUserMutation(), {
      wrapper: makeWrapper(client),
    });

    await expect(
      act(async () => {
        await result.current.mutateAsync({ id: '1', payload: { status: 'Archived' } });
      }),
    ).rejects.toThrow('Failed to update user (500)');
  });
});
