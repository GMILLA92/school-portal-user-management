import type { UserDTO } from '../model';

export const fetchUsers = async (): Promise<UserDTO[]> => {
  const res = await fetch('/api/users');

  if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.status}`);
  }

  return (await res.json()) as UserDTO[];
};
