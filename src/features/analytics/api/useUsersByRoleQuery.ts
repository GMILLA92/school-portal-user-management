import { useQuery } from '@tanstack/react-query';

import type { UsersByRoleDatum } from '../charts/UsersByRoleChart';

async function fetchUsersByRole(): Promise<UsersByRoleDatum[]> {
  const res = await fetch('/api/analytics/users-by-role');
  if (!res.ok) throw new Error('Failed to load users by role');
  return (await res.json()) as UsersByRoleDatum[];
}

export const useUsersByRoleQuery = () => {
  return useQuery({
    queryKey: ['analytics', 'users-by-role'],
    queryFn: fetchUsersByRole,
  });
};
