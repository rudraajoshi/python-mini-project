import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, Info, X } from 'lucide-react';

const icons = { success: Check, error: AlertTriangle, info: Info };
const accents = {
  success: 'text-positive bg-positive-soft',
  error: 'text-danger bg-danger-soft',
  info: 'text-accent bg-accent-soft',
};

export default function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-5 sm:translate-x-0"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = icons[toast.variant] ?? Info;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex items-start gap-3 rounded-md border border-line bg-surface p-3 shadow-pop"
            >
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded ${accents[toast.variant]}`}>
                <Icon size={12} strokeWidth={2.4} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{toast.title}</p>
                {toast.description && <p className="mt-0.5 text-meta leading-relaxed text-muted">{toast.description}</p>}
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => onDismiss(toast.id)}
                className="-mr-1 -mt-1 rounded p-1 text-faint transition-colors hover:bg-sunken hover:text-ink"
              >
                <X size={13} strokeWidth={2} aria-hidden />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
