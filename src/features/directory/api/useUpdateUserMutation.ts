import { useMutation, useQueryClient } from '@tanstack/react-query';

import { usersQueryKey } from './useUsersQuery';

import type { UpdateUserPayload, UserDTO } from '../../users/model';

async function patchUser(id: string, payload: UpdateUserPayload): Promise<UserDTO> {
  const res = await fetch(`/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Failed to update user (${res.status})`);

  return (await res.json()) as UserDTO;
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      patchUser(id, payload),

    onSuccess: (updated) => {
      queryClient.setQueryData<UserDTO[]>(usersQueryKey, (prev) => {
        if (!prev) return prev;
        return prev.map((u) => (u.id === updated.id ? updated : u));
      });
    },
  });
}
