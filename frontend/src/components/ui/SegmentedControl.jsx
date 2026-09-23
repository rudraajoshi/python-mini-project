import { motion } from 'framer-motion';
import { cn } from '../../utils/cn.js';

export default function SegmentedControl({ options, value, onChange, label = 'View' }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-md border border-line bg-raised p-0.5">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative inline-flex h-7 items-center gap-1.5 rounded px-2 text-meta font-medium transition-colors duration-150',
              active ? 'text-ink' : 'text-faint hover:text-ink-soft'
            )}
          >
            {active && (
              <motion.span
                layoutId={`segmented-${label}`}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 rounded border border-line bg-surface shadow-soft"
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {option.icon && <option.icon size={13} strokeWidth={2} aria-hidden />}
              {option.showLabel !== false && option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
