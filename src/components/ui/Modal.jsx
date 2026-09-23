import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import IconButton from './IconButton.jsx';
import { cn } from '../../utils/cn.js';

export default function Modal({ open, onClose, title, description, children, footer, width = 'max-w-lg' }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/25 backdrop-blur-[1px]"
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 12, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.99 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative z-10 w-full rounded-t-xl border border-line bg-surface shadow-pop focus:outline-none sm:rounded-xl',
              width
            )}
          >
            {(title || onClose) && (
              <header className="flex items-start justify-between gap-6 border-b border-line px-5 py-4">
                <div className="min-w-0">
                  {title && <h2 className="text-lg font-semibold text-ink">{title}</h2>}
                  {description && <p className="mt-1 text-sm text-muted">{description}</p>}
                </div>
                <IconButton icon={X} label="Close" onClick={onClose} className="-mr-1 -mt-1" />
              </header>
            )}
            <div className="px-5 py-5">{children}</div>
            {footer && (
              <footer className="flex items-center justify-end gap-2 border-t border-line bg-raised px-5 py-3.5 sm:rounded-b-xl">
                {footer}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
