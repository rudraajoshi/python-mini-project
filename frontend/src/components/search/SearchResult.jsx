import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import DocumentIcon from '../documents/DocumentIcon.jsx';
import Tag from '../ui/Tag.jsx';

function Relevance({ score }) {
  const pct = Math.round(score * 100);
  return (
    <span className="flex items-center gap-2" title={`Relevance ${pct}%`}>
      <span aria-hidden className="flex h-1 w-12 overflow-hidden rounded-full bg-sunken">
        <span className="h-full rounded-full bg-accent/70" style={{ width: `${pct}%` }} />
      </span>
      <span className="text-2xs tabular-nums text-faint">{pct}%</span>
    </span>
  );
}

/** Highlights the query terms inside the retrieved chunk. */
function highlight(text, query) {
  const terms = (query ?? '')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2);
  if (terms.length === 0) return text;

  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const splitter = new RegExp(`(${escaped})`, 'gi');
  const matcher = new RegExp(`^(?:${escaped})$`, 'i');

  return text.split(splitter).map((part, index) =>
    matcher.test(part) ? (
      <mark key={index} className="rounded-sm bg-accent-soft px-0.5 text-ink">
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

export default function SearchResult({ result, query, index = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: Math.min(index * 0.03, 0.24), ease: [0.16, 1, 0.3, 1] }}
      className="group border-b border-line last:border-b-0"
    >
      <Link
        to={`/documents/${result.documentId}?page=${result.page}`}
        className="-mx-3 block rounded-md px-3 py-5 transition-colors duration-150 hover:bg-raised"
      >
        <div className="mb-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <DocumentIcon type={result.documentType} size="sm" className="transition-transform duration-200 group-hover:-translate-y-[1px]" />
          <span className="text-meta font-medium text-ink">{result.documentName}</span>
          <span aria-hidden className="h-3 w-px bg-line" />
          <span className="text-meta text-muted transition-colors duration-150 group-hover:text-ink-soft">
            Page {result.page}
          </span>
          {result.collectionName && (
            <>
              <span aria-hidden className="h-3 w-px bg-line" />
              <span className="text-meta text-muted">{result.collectionName}</span>
            </>
          )}
          <span className="ml-auto hidden sm:block">
            <Relevance score={result.score} />
          </span>
        </div>

        <p className="max-w-[72ch] text-reading leading-relaxed text-ink-soft">
          {highlight(result.excerpt, query)}
        </p>

        <div className="mt-3 flex items-center gap-2">
          {result.tags?.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
          <span className="ml-auto inline-flex items-center gap-1 text-meta font-medium text-accent opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            View source
            <ArrowUpRight size={13} strokeWidth={2} aria-hidden />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
