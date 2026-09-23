import { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const Input = forwardRef(function Input(
  { label, hint, error, icon: Icon, trailing, className, id, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-meta font-medium text-ink-soft">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            strokeWidth={1.9}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
          />
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            'h-10 w-full rounded-md border bg-surface text-base text-ink placeholder:text-faint',
            'transition-[border-color,box-shadow] duration-150',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            Icon ? 'pl-9 pr-3' : 'px-3',
            trailing && 'pr-10',
            error
              ? 'border-danger/60 focus:border-danger focus:ring-danger/20'
              : 'border-line hover:border-line-strong focus:border-accent/70 focus:ring-accent/18',
            className
          )}
          {...props}
        />
        {trailing && <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 flex items-center gap-1.5 text-meta text-danger">
          <AlertCircle size={13} strokeWidth={2} aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-meta text-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
