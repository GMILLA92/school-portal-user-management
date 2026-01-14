import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useDirectorySelection } from './useDirectorySelection';

describe('useDirectorySelection', () => {
  it('toggles selection for a single id', () => {
    const { result } = renderHook(() => useDirectorySelection());

    expect(result.current.selectedCount).toBe(0);

    act(() => result.current.toggleOne('1'));
    expect(result.current.isSelected('1')).toBe(true);
    expect(result.current.selectedCount).toBe(1);

    act(() => result.current.toggleOne('1'));
    expect(result.current.isSelected('1')).toBe(false);
    expect(result.current.selectedCount).toBe(0);
  });

  it('selectMany and deselectMany work as expected', () => {
    const { result } = renderHook(() => useDirectorySelection());

    act(() => result.current.selectMany(['1', '2', '3']));
    expect(result.current.selectedCount).toBe(3);
    expect(result.current.isSelected('2')).toBe(true);

    act(() => result.current.deselectMany(['2', '3']));
    expect(result.current.selectedCount).toBe(1);
    expect(result.current.isSelected('1')).toBe(true);
    expect(result.current.isSelected('2')).toBe(false);
  });

  it('clear empties selection', () => {
    const { result } = renderHook(() => useDirectorySelection());

    act(() => result.current.selectMany(['1', '2']));
    expect(result.current.selectedCount).toBe(2);

    act(() => result.current.clear());
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.isSelected('1')).toBe(false);
  });

  it('setMany replaces selection', () => {
    const { result } = renderHook(() => useDirectorySelection());

    act(() => result.current.selectMany(['1', '2', '3']));
    expect(result.current.selectedCount).toBe(3);

    act(() => result.current.setMany(['9']));
    expect(result.current.selectedCount).toBe(1);
    expect(result.current.isSelected('9')).toBe(true);
    expect(result.current.isSelected('1')).toBe(false);
  });
});
