import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export default function Select({ value, onChange, options, label, className }) {
  return (
    <div className={cn('relative', className)}>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full appearance-none rounded-md border border-line bg-surface pl-2.5 pr-7 text-meta font-medium text-ink-soft transition-colors duration-150 hover:border-line-strong focus:border-accent/70 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        strokeWidth={2}
        aria-hidden
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-faint"
      />
    </div>
  );
}
