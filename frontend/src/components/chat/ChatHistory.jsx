import { motion } from 'framer-motion';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import DropdownMenu from '../ui/DropdownMenu.jsx';
import { formatRelative } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

export default function ChatHistory({ chats = [], activeId, onSelect, onNew, onRename, onDelete }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-1 pb-3">
        <p className="text-meta font-medium text-muted">Conversations</p>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex h-7 items-center gap-1.5 rounded border border-line bg-surface px-2 text-meta font-medium text-ink-soft transition-colors duration-150 hover:border-line-strong"
        >
          <Plus size={12} strokeWidth={2.2} aria-hidden />
          New
        </button>
      </div>

      <ul className="scrollarea -mx-1 flex-1 space-y-0.5 overflow-y-auto px-1">
        {chats.map((chat) => {
          const active = chat.id === activeId;
          return (
            <li key={chat.id} className="group relative">
              <button
                type="button"
                onClick={() => onSelect(chat.id)}
                className={cn(
                  'w-full rounded-md px-2.5 py-2 pr-8 text-left transition-colors duration-150',
                  active ? 'bg-sunken' : 'hover:bg-sunken/70'
                )}
              >
                <span className={cn('block truncate text-sm', active ? 'font-medium text-ink' : 'text-ink-soft')}>
                  {chat.title}
                </span>
                <span className="mt-0.5 block text-2xs text-faint">{formatRelative(chat.updatedAt)}</span>
              </button>
              {active && (
                <motion.span
                  layoutId="chat-indicator"
                  className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-accent"
                />
              )}
              <div className="absolute right-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <DropdownMenu
                  label={`Actions for ${chat.title}`}
                  items={[
                    { label: 'Rename', icon: Pencil, onSelect: () => onRename?.(chat) },
                    { separator: true },
                    { label: 'Delete', icon: Trash2, destructive: true, onSelect: () => onDelete?.(chat) },
                  ]}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
