import { useRef, useState } from 'react';
import { ArrowUp, Layers } from 'lucide-react';
import DropdownMenu from '../ui/DropdownMenu.jsx';
import { cn } from '../../utils/cn.js';

export default function ChatInput({ onSend, scope, onScopeChange, collections = [], disabled = false }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);

  function submit() {
    const question = value.trim();
    if (!question || disabled) return;
    onSend(question);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  function autoGrow(event) {
    setValue(event.target.value);
    event.target.style.height = 'auto';
    event.target.style.height = `${Math.min(event.target.scrollHeight, 168)}px`;
  }

  return (
    <div
      className={cn(
        'rounded-xl border bg-surface transition-[border-color,box-shadow] duration-200',
        focused ? 'border-accent/55 shadow-[0_0_0_3px_rgba(79,109,245,0.09)]' : 'border-line'
      )}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={autoGrow}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        placeholder="Ask something about your documents…"
        aria-label="Ask something about your documents"
        className="scrollarea block max-h-[168px] w-full resize-none bg-transparent px-4 pb-2 pt-3.5 text-reading leading-relaxed text-ink placeholder:text-faint focus:outline-none disabled:opacity-60"
      />

      <div className="flex items-center gap-2 px-3 pb-3">
        <DropdownMenu
          align="left"
          items={[
            { label: 'All documents', icon: Layers, onSelect: () => onScopeChange({ type: 'all' }) },
            { separator: true },
            ...collections.map((collection) => ({
              label: collection.name,
              onSelect: () => onScopeChange({ type: 'collection', id: collection.id, label: collection.name }),
            })),
          ]}
          trigger={({ toggle, open }) => (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              className="inline-flex h-7 items-center gap-1.5 rounded border border-line bg-raised px-2 text-meta font-medium text-ink-soft transition-colors duration-150 hover:border-line-strong"
            >
              <Layers size={12} strokeWidth={2} aria-hidden />
              {scope?.type === 'collection' ? scope.label : 'All documents'}
            </button>
          )}
        />

        <span className="ml-auto hidden items-center gap-1 text-2xs text-faint sm:flex">
          <kbd className="kbd">↵</kbd> to send
        </span>

        <button
          type="button"
          onClick={submit}
          disabled={!value.trim() || disabled}
          aria-label="Send question"
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-md transition-all duration-150 active:translate-y-[0.5px]',
            value.trim() && !disabled
              ? 'bg-accent text-white hover:bg-accent-hover'
              : 'bg-sunken text-faint'
          )}
        >
          <ArrowUp size={16} strokeWidth={2.2} aria-hidden />
        </button>
      </div>
    </div>
  );
}
