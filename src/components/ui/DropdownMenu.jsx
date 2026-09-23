import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside.js';
import { cn } from '../../utils/cn.js';

/**
 * Contextual actions menu. Rows collapse their actions into this instead of
 * showing every control at once.
 */
export default function DropdownMenu({ items = [], label = 'More actions', align = 'right', trigger }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div className="relative" ref={ref}>
      {trigger ? (
        trigger({ open, toggle: () => setOpen((o) => !o) })
      ) : (
        <button
          type="button"
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            setOpen((o) => !o);
          }}
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded border border-transparent text-faint',
            'transition-colors duration-150 hover:bg-sunken hover:text-ink',
            open && 'border-line bg-sunken text-ink'
          )}
        >
          <MoreHorizontal size={16} strokeWidth={2} aria-hidden />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'absolute z-40 mt-1 min-w-[176px] overflow-hidden rounded-md border border-line bg-surface p-1 shadow-pop',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {items.map((item, index) =>
              item.separator ? (
                <div key={`sep-${index}`} className="my-1 h-px bg-line" />
              ) : (
                <button
                  key={item.label}
                  role="menuitem"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    setOpen(false);
                    item.onSelect?.();
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left text-sm transition-colors duration-100',
                    item.destructive ? 'text-danger hover:bg-danger-soft' : 'text-ink-soft hover:bg-sunken hover:text-ink'
                  )}
                >
                  {item.icon && <item.icon size={14} strokeWidth={1.9} aria-hidden />}
                  {item.label}
                </button>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
