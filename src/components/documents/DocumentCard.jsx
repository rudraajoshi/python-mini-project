import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderInput, Pencil, Trash2 } from 'lucide-react';
import DocumentIcon from './DocumentIcon.jsx';
import ProcessingStatus from './ProcessingStatus.jsx';
import DropdownMenu from '../ui/DropdownMenu.jsx';
import Tag from '../ui/Tag.jsx';
import { formatRelative, truncate } from '../../utils/format.js';

export default function DocumentCard({ document, index = 0, onRename, onMove, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: Math.min(index * 0.025, 0.24), ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <Link
        to={`/documents/${document.id}`}
        className="flex h-full flex-col rounded-lg border border-line bg-surface p-4 transition-[border-color,transform] duration-200 hover:-translate-y-[1px] hover:border-line-strong"
      >
        <div className="mb-3 flex items-start justify-between">
          <DocumentIcon type={document.type} size="lg" />
          <span className="text-2xs tabular-nums text-faint">{document.pages} pp</span>
        </div>
        <p className="truncate text-base font-medium text-ink">{document.name}</p>
        <p className="mt-1 line-clamp-3 text-meta leading-relaxed text-muted">{truncate(document.excerpt, 130)}</p>

        <div className="mt-auto pt-4">
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {document.tags?.slice(0, 2).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-line pt-2.5">
            <ProcessingStatus status={document.status} progress={document.progress} />
            <span className="text-2xs text-faint">{formatRelative(document.updatedAt)}</span>
          </div>
        </div>
      </Link>

      <div className="absolute right-2.5 top-11 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
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
