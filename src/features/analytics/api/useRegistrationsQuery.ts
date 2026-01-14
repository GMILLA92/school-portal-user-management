import { useQuery } from '@tanstack/react-query';

import type { RegistrationsDatum } from '../charts/RegistrationsChart';

async function fetchRegistrations(): Promise<RegistrationsDatum[]> {
  const res = await fetch('/api/analytics/registrations');
  if (!res.ok) throw new Error('Failed to load registrations');
  return (await res.json()) as RegistrationsDatum[];
}

export const useRegistrationsQuery = () => {
  return useQuery({
    queryKey: ['analytics', 'registrations'],
    queryFn: fetchRegistrations,
  });
};
