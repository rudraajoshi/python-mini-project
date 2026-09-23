import { cn } from '../../utils/cn.js';

export default function Tag({ children, onClick, active = false, className }) {
  const Tag_ = onClick ? 'button' : 'span';
  return (
    <Tag_
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'inline-flex h-[22px] max-w-[160px] items-center truncate rounded border px-1.5 text-2xs font-medium',
        active
          ? 'border-accent-line bg-accent-soft text-accent'
          : 'border-line bg-raised text-muted',
        onClick && 'transition-colors duration-150 hover:border-line-strong hover:text-ink',
        className
      )}
    >
      {children}
    </Tag_>
  );
}
