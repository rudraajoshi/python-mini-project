import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const SearchBar = forwardRef(function SearchBar(
  { value, onChange, onSubmit, placeholder = 'Search your knowledge…', shortcut, size = 'md', className, autoFocus },
  ref
) {
  const [focused, setFocused] = useState(false);

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(value);
      }}
      className={cn('relative w-full', className)}
    >
      <motion.div
        animate={{ scale: focused ? 1.004 : 1 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'flex items-center gap-2.5 rounded-lg border bg-surface transition-[border-color,box-shadow] duration-200',
          size === 'lg' ? 'h-[52px] px-4' : 'h-10 px-3',
          focused ? 'border-accent/60 shadow-[0_0_0_3px_rgba(79,109,245,0.10)]' : 'border-line hover:border-line-strong'
        )}
      >
        <Search
          size={size === 'lg' ? 18 : 16}
          strokeWidth={1.9}
          aria-hidden
          className={cn('shrink-0 transition-colors duration-200', focused ? 'text-accent' : 'text-faint')}
        />
        <input
          ref={ref}
          type="search"
          value={value}
          autoFocus={autoFocus}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          aria-label={placeholder}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-ink placeholder:text-faint focus:outline-none',
            '[&::-webkit-search-cancel-button]:hidden',
            size === 'lg' ? 'text-reading' : 'text-base'
          )}
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange('')}
            className="shrink-0 rounded p-1 text-faint transition-colors hover:bg-sunken hover:text-ink"
          >
            <X size={14} strokeWidth={2} aria-hidden />
          </button>
        ) : (
          shortcut && (
            <span className="hidden shrink-0 items-center gap-0.5 sm:flex">
              <kbd className="kbd">{shortcut[0]}</kbd>
              <kbd className="kbd">{shortcut[1]}</kbd>
            </span>
          )
        )}
      </motion.div>
    </form>
  );
});

export default SearchBar;
