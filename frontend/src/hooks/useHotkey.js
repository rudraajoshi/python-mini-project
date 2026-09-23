import { useEffect } from 'react';

/** Binds Cmd/Ctrl + key, ignoring repeats while typing in a field. */
export function useHotkey(key, handler, { meta = true } = {}) {
  useEffect(() => {
    function onKeyDown(event) {
      const modifier = meta ? event.metaKey || event.ctrlKey : true;
      if (!modifier || event.key.toLowerCase() !== key.toLowerCase()) return;
      event.preventDefault();
      handler(event);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key, handler, meta]);
}
