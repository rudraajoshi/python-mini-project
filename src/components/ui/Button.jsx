import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const variants = {
  primary:
    'bg-accent text-white border border-accent hover:bg-accent-hover hover:border-accent-hover shadow-soft',
  secondary:
    'bg-surface text-ink border border-line hover:bg-raised hover:border-line-strong shadow-soft',
  ghost: 'bg-transparent text-muted border border-transparent hover:bg-sunken hover:text-ink',
  subtle: 'bg-sunken text-ink-soft border border-transparent hover:bg-line/70',
  danger: 'bg-danger text-white border border-danger hover:brightness-95 shadow-soft',
};

const sizes = {
  sm: 'h-7 px-2.5 text-meta gap-1.5 rounded',
  md: 'h-8 px-3 text-sm gap-2 rounded-md',
  lg: 'h-10 px-4 text-base gap-2 rounded-md',
};

const Button = forwardRef(function Button(
  { as: Tag = 'button', variant = 'secondary', size = 'md', loading = false, icon: Icon, className, children, disabled, ...props },
  ref
) {
  return (
    <Tag
      ref={ref}
      disabled={Tag === 'button' ? disabled || loading : undefined}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-[background-color,border-color,color,transform] duration-150',
        'active:translate-y-[0.5px] disabled:cursor-not-allowed disabled:opacity-55 disabled:active:translate-y-0',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" aria-hidden />
      ) : (
        Icon && <Icon size={size === 'sm' ? 13 : 15} strokeWidth={1.9} aria-hidden />
      )}
      {children}
    </Tag>
  );
});

export default Button;
