import { useQuery } from '@tanstack/react-query';

import type { UserDTO } from '../../users/model';

export const usersQueryKey = ['users'] as const;

async function fetchUsers(signal?: AbortSignal): Promise<UserDTO[]> {
  const res = await fetch('/api/users', { headers: { Accept: 'application/json' }, signal });
  if (!res.ok) throw new Error(`Failed to load users (${res.status})`);
  return (await res.json()) as UserDTO[];
}

export function useUsersQuery() {
  return useQuery<UserDTO[], Error>({
    queryKey: usersQueryKey,
    queryFn: ({ signal }) => fetchUsers(signal),
    staleTime: 30_000,
  });
}
