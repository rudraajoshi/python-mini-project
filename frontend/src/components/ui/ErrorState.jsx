import { AlertTriangle, RotateCw } from 'lucide-react';
import Button from './Button.jsx';

export default function ErrorState({ title = 'Something went wrong', error, onRetry, compact = false }) {
  const message = typeof error === 'string' ? error : error?.message;

  return (
    <div className={`flex flex-col items-center px-6 text-center ${compact ? 'py-10' : 'py-16'}`}>
      <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-danger/20 bg-danger-soft text-danger">
        <AlertTriangle size={18} strokeWidth={1.8} aria-hidden />
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{message}</p>}
      {onRetry && (
        <Button className="mt-5" icon={RotateCw} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
