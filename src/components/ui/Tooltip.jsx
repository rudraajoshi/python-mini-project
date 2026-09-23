import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/** Lightweight tooltip for icon-only controls. Hover and keyboard focus both open it. */
export default function Tooltip({ label, side = 'top', children }) {
  const [open, setOpen] = useState(false);

  const position =
    side === 'right'
      ? 'left-full top-1/2 ml-2 -translate-y-1/2'
      : side === 'bottom'
        ? 'top-full left-1/2 mt-2 -translate-x-1/2'
        : 'bottom-full left-1/2 mb-2 -translate-x-1/2';

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <AnimatePresence>
        {open && label && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: side === 'bottom' ? -2 : 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.13 }}
            className={`pointer-events-none absolute z-50 whitespace-nowrap rounded border border-line bg-ink px-1.5 py-1 text-2xs font-medium text-white shadow-raised ${position}`}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
