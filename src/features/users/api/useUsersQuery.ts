import { useQuery } from '@tanstack/react-query';

import { fetchUsers } from './usersApi';

export const usersQueryKey = ['users'];

export const useUsersQuery = () =>
  useQuery({
    queryKey: usersQueryKey,
    queryFn: fetchUsers,
  });
