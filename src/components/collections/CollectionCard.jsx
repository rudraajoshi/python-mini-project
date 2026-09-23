import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import DropdownMenu from '../ui/DropdownMenu.jsx';
import { formatRelative } from '../../utils/format.js';

export default function CollectionCard({ collection, index = 0, onRename, onDelete, compact = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: Math.min(index * 0.03, 0.2), ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <Link
        to={`/collections/${collection.id}`}
        className="flex h-full flex-col rounded-lg border border-line bg-surface p-4 transition-[border-color,transform] duration-200 hover:-translate-y-[1px] hover:border-line-strong"
      >
        <span
          aria-hidden
          className="mb-3 block h-[3px] w-8 rounded-full"
          style={{ backgroundColor: collection.accent }}
        />
        <p className="text-base font-medium text-ink">{collection.name}</p>
        {!compact && collection.description && (
          <p className="mt-1 line-clamp-2 text-meta leading-relaxed text-muted">{collection.description}</p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-4 text-2xs text-faint">
          <span className="tabular-nums">
            {collection.documentCount} {collection.documentCount === 1 ? 'document' : 'documents'}
          </span>
          <span aria-hidden className="h-2.5 w-px bg-line" />
          <span>Updated {formatRelative(collection.updatedAt)}</span>
        </div>
      </Link>

      {(onRename || onDelete) && (
        <div className="absolute right-2.5 top-2.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
          <DropdownMenu
            label={`Actions for ${collection.name}`}
            items={[
              { label: 'Rename', icon: Pencil, onSelect: () => onRename?.(collection) },
              { separator: true },
              { label: 'Delete', icon: Trash2, destructive: true, onSelect: () => onDelete?.(collection) },
            ]}
          />
        </div>
      )}
    </motion.div>
  );
}
