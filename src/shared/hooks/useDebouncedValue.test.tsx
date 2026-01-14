import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(({ v }) => useDebouncedValue(v, 250), {
      initialProps: { v: 'a' },
    });

    expect(result.current).toBe('a');
  });

  it('updates only after the delay', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 250), {
      initialProps: { v: 'a' },
    });

    rerender({ v: 'b' });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(249);
    });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('b');
  });

  it('cancels previous timer when value changes quickly', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 250), {
      initialProps: { v: 'a' },
    });

    rerender({ v: 'b' });
    rerender({ v: 'c' });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current).toBe('c');
  });
});
