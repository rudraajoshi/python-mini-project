import { useEffect } from 'react';

export function useClickOutside(ref, handler, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    function onPointerDown(event) {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [ref, handler, active]);
}
