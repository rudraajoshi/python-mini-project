import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async service function and exposes loading / error / data so every
 * screen can render the same four states without duplicating boilerplate.
 */
export function useAsync(fn, deps = [], { immediate = true } = {}) {
  const [state, setState] = useState({ data: null, loading: immediate, error: null });
  const mounted = useRef(true);
  const callback = useCallback(fn, deps);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(
    async (...args) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await callback(...args);
        if (mounted.current) setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        if (mounted.current) setState({ data: null, loading: false, error });
        throw error;
      }
    },
    [callback]
  );

  useEffect(() => {
    if (immediate) run().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, immediate]);

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }));
  }, []);

  return { ...state, run, setData };
}
