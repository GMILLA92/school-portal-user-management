import { useMutation } from '@tanstack/react-query';

import { useUpdateUserMutation } from './useUpdateUserMutation';

import type { UpdateUserPayload } from '../../users/model';

interface BulkVars {
  ids: string[];
  payload: UpdateUserPayload;
}

export function useBulkUpdateUsersMutation() {
  const updateOne = useUpdateUserMutation();

  return useMutation({
    mutationFn: async ({ ids, payload }: BulkVars) => {
      for (const id of ids) {
        await updateOne.mutateAsync({ id, payload });
      }
      return { updatedCount: ids.length };
    },
  });
}
