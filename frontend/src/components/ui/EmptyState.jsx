import { cn } from '../../utils/cn.js';

export default function EmptyState({ icon: Icon, title, description, action, className, compact = false }) {
  return (
    <div className={cn('flex flex-col items-center px-6 text-center', compact ? 'py-10' : 'py-16', className)}>
      {Icon && (
        <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-raised text-faint">
          <Icon size={18} strokeWidth={1.7} aria-hidden />
        </span>
      )}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
