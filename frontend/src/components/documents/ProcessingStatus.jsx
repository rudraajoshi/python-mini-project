import { motion } from 'framer-motion';
import { AlertTriangle, Check } from 'lucide-react';
import { PROCESSING_LABELS } from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';

/**
 * Mirrors the backend lifecycle: uploading → processing → indexing → ready.
 * Progress values come from GET /api/documents/{id}/status/.
 */
export default function ProcessingStatus({ status = 'ready', progress, variant = 'inline' }) {
  const label = PROCESSING_LABELS[status] ?? status;
  const working = status === 'uploading' || status === 'processing' || status === 'indexing';

  if (variant === 'bar') {
    return (
      <div className="w-full">
        <div className="mb-1.5 flex items-center justify-between text-meta">
          <span className={cn('font-medium', status === 'failed' ? 'text-danger' : 'text-ink-soft')}>{label}</span>
          {working && <span className="tabular-nums text-faint">{progress ?? 0}%</span>}
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-sunken">
          {progress == null && working ? (
            <div className="h-full w-1/3 animate-indeterminate rounded-full bg-accent" />
          ) : (
            <motion.div
              initial={false}
              animate={{ width: `${status === 'ready' ? 100 : (progress ?? 0)}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={cn('h-full rounded-full', status === 'failed' ? 'bg-danger' : 'bg-accent')}
            />
          )}
        </div>
      </div>
    );
  }

  if (status === 'ready') {
    return (
      <span className="inline-flex items-center gap-1.5 text-meta text-positive">
        <Check size={12} strokeWidth={2.6} aria-hidden />
        Ready
      </span>
    );
  }

  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-meta text-danger">
        <AlertTriangle size={12} strokeWidth={2.2} aria-hidden />
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-meta text-caution">
      <motion.span
        aria-hidden
        animate={{ opacity: [1, 0.35, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="h-1.5 w-1.5 rounded-full bg-caution"
      />
      {label}
      {progress != null && <span className="tabular-nums text-faint">{progress}%</span>}
    </span>
  );
}
