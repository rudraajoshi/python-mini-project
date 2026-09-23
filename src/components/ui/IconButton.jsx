import { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import Tooltip from './Tooltip.jsx';

const IconButton = forwardRef(function IconButton(
  { icon: Icon, label, size = 16, active = false, className, tooltip = true, ...props },
  ref
) {
  const button = (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted',
        'transition-colors duration-150 hover:bg-sunken hover:text-ink disabled:opacity-45',
        active && 'bg-accent-soft text-accent hover:bg-accent-soft hover:text-accent',
        className
      )}
      {...props}
    >
      <Icon size={size} strokeWidth={1.9} aria-hidden />
    </button>
  );

  return tooltip ? <Tooltip label={label}>{button}</Tooltip> : button;
});

export default IconButton;
