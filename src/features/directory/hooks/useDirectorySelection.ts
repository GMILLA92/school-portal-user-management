import * as React from 'react';

export function useDirectorySelection() {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(() => new Set());

  const isSelected = React.useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const toggleOne = React.useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clear = React.useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectMany = React.useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const deselectMany = React.useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  const setMany = React.useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    isSelected,
    toggleOne,
    clear,
    selectMany,
    deselectMany,
    setMany,
  };
}
