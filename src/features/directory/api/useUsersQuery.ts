import { useQuery } from '@tanstack/react-query';

import type { UsersQueryParams } from '../model/directory.types';
import type { UserDTO } from '../../users/model';

async function fetchUsers(signal?: AbortSignal): Promise<UserDTO[]> {
  const res = await fetch('/api/users', { headers: { Accept: 'application/json' }, signal });
  if (!res.ok) throw new Error(`Failed to load users (${res.status})`);
  return (await res.json()) as UserDTO[];
}

export function usersQueryKey(params: UsersQueryParams) {
  return ['users', params] as const;
}

export function useUsersQuery() {
  return useQuery<UserDTO[], Error>({
    queryKey: ['users'],
    queryFn: ({ signal }) => fetchUsers(signal),
    staleTime: 30_000,
  });
}
