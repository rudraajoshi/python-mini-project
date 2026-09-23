import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderInput, Pencil, Trash2 } from 'lucide-react';
import DocumentIcon from './DocumentIcon.jsx';
import ProcessingStatus from './ProcessingStatus.jsx';
import BookmarkButton from './BookmarkButton.jsx';
import DropdownMenu from '../ui/DropdownMenu.jsx';
import Tag from '../ui/Tag.jsx';
import { formatBytes, formatRelative, truncate } from '../../utils/format.js';

export default function DocumentRow({ document, index = 0, onRename, onMove, onDelete, onToggleBookmark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.022, 0.2), ease: [0.16, 1, 0.3, 1] }}
      className="group relative border-b border-line last:border-b-0"
    >
      <Link
        to={`/documents/${document.id}`}
        className="flex items-start gap-3.5 px-4 py-3.5 transition-colors duration-150 hover:bg-raised focus-visible:bg-raised sm:items-center"
      >
        <DocumentIcon type={document.type} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-base font-medium text-ink">{document.name}</p>
            {document.pages > 1 && (
              <span className="hidden shrink-0 text-2xs tabular-nums text-faint sm:inline">{document.pages} pages</span>
            )}
          </div>
          <p className="mt-0.5 truncate text-meta text-muted">{truncate(document.excerpt, 110)}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {document.collectionName && (
              <span className="text-2xs font-medium text-ink-soft">{document.collectionName}</span>
            )}
            {document.tags?.slice(0, 2).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
            <span className="text-2xs text-faint sm:hidden">{formatRelative(document.updatedAt)}</span>
          </div>
        </div>

        <div className="hidden w-24 shrink-0 md:block">
          <ProcessingStatus status={document.status} progress={document.progress} />
        </div>
        <div className="hidden w-16 shrink-0 text-right text-2xs tabular-nums text-faint lg:block">
          {formatBytes(document.size)}
        </div>
        <div className="hidden w-20 shrink-0 text-right text-2xs text-faint sm:block">
          {formatRelative(document.updatedAt)}
        </div>
      </Link>

      <div className="absolute right-3 top-3 flex items-center gap-0.5 sm:top-1/2 sm:-translate-y-1/2 sm:opacity-0 sm:transition-opacity sm:duration-150 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <BookmarkButton
          active={document.bookmarked}
          onToggle={(next) => onToggleBookmark?.(document, next)}
        />
        <DropdownMenu
          label={`Actions for ${document.name}`}
          items={[
            { label: 'Rename', icon: Pencil, onSelect: () => onRename?.(document) },
            { label: 'Move to collection', icon: FolderInput, onSelect: () => onMove?.(document) },
            { separator: true },
            { label: 'Delete', icon: Trash2, destructive: true, onSelect: () => onDelete?.(document) },
          ]}
        />
      </div>
    </motion.div>
  );
}
