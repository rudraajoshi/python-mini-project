import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import DocumentIcon from '../documents/DocumentIcon.jsx';
import Tooltip from '../ui/Tooltip.jsx';

/**
 * Compact citation block. Clicking it opens /documents/:id?page=n so the
 * page-level chunk the backend returned stays reachable.
 */
export default function SourceReference({ source, index }) {
  const [copied, setCopied] = useState(false);

  async function copyExcerpt(event) {
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${source.excerpt}\n— ${source.documentName}, p.${source.page}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min((index ?? 0) * 0.05, 0.2) }}
      className="group relative"
    >
      <Link
        to={`/documents/${source.documentId}?page=${source.page}`}
        className="block rounded-md border border-line bg-surface p-3 transition-[border-color,background-color] duration-150 hover:border-accent-line hover:bg-accent-soft/35"
      >
        <div className="flex items-center gap-2">
          <DocumentIcon type={source.documentType} size="sm" />
          <span className="min-w-0 flex-1 truncate text-meta font-medium text-ink">{source.documentName}</span>
          <span className="shrink-0 text-2xs tabular-nums text-muted">Page {source.page}</span>
          <ArrowUpRight
            size={13}
            strokeWidth={2}
            aria-hidden
            className="shrink-0 text-faint transition-transform duration-150 group-hover:-translate-y-[1px] group-hover:translate-x-[1px] group-hover:text-accent"
          />
        </div>
        {source.excerpt && (
          <p className="mt-2 line-clamp-3 border-l-2 border-line pl-2.5 text-meta leading-relaxed text-muted">
            {source.excerpt}
          </p>
        )}
      </Link>

      {source.excerpt && (
        <div className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <Tooltip label={copied ? 'Copied' : 'Copy excerpt'}>
            <button
              type="button"
              onClick={copyExcerpt}
              aria-label="Copy excerpt"
              className="rounded border border-line bg-surface p-1 text-faint transition-colors hover:text-ink"
            >
              {copied ? (
                <Check size={12} strokeWidth={2.4} className="text-positive" aria-hidden />
              ) : (
                <Copy size={12} strokeWidth={2} aria-hidden />
              )}
            </button>
          </Tooltip>
        </div>
      )}
    </motion.div>
  );
}
