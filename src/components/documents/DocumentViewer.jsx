import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, X, ZoomIn, ZoomOut } from 'lucide-react';
import IconButton from '../ui/IconButton.jsx';
import { cn } from '../../utils/cn.js';

/**
 * Page-aware reading surface. Extracted page text comes from the backend, so
 * this component renders text when it exists and leaves a slot for a real PDF
 * renderer to mount later without changing the surrounding controls.
 */
export default function DocumentViewer({ document, page, onPageChange, highlight }) {
  const [zoom, setZoom] = useState(100);
  const [findOpen, setFindOpen] = useState(false);
  const [needle, setNeedle] = useState('');
  const surfaceRef = useRef(null);

  const totalPages = document.pages ?? 1;
  const pageText = document.pageText?.[page];

  useEffect(() => {
    surfaceRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const body = useMemo(() => {
    const text =
      pageText ??
      `Page ${page} of ${document.name}. Extracted text for this page is not available in the current preview.`;
    const term = needle.trim() || (page === highlight?.page ? highlight?.text : '');
    if (!term || term.length < 3) return text;

    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
  }, [pageText, page, document.name, needle, highlight]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex h-11 shrink-0 items-center gap-1 border-b border-line bg-raised px-2">
        <IconButton
          icon={ChevronLeft}
          label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        />
        <span className="flex items-center gap-1.5 px-1 text-meta tabular-nums text-muted">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={page}
            aria-label="Page number"
            onChange={(event) => {
              const next = Number(event.target.value);
              if (next >= 1 && next <= totalPages) onPageChange(next);
            }}
            className="h-6 w-11 rounded border border-line bg-surface text-center text-meta tabular-nums text-ink focus:border-accent/70 focus:outline-none"
          />
          of {totalPages}
        </span>
        <IconButton
          icon={ChevronRight}
          label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        />

        <div className="ml-auto flex items-center gap-1">
          <IconButton icon={ZoomOut} label="Zoom out" disabled={zoom <= 80} onClick={() => setZoom((z) => z - 10)} />
          <span className="w-10 text-center text-2xs tabular-nums text-faint">{zoom}%</span>
          <IconButton icon={ZoomIn} label="Zoom in" disabled={zoom >= 150} onClick={() => setZoom((z) => z + 10)} />
          <IconButton
            icon={findOpen ? X : Search}
            label={findOpen ? 'Close find' : 'Find in document'}
            active={findOpen}
            onClick={() => {
              setFindOpen((o) => !o);
              setNeedle('');
            }}
          />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {findOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="shrink-0 overflow-hidden border-b border-line bg-raised"
          >
            <div className="px-3 py-2">
              <input
                autoFocus
                value={needle}
                onChange={(event) => setNeedle(event.target.value)}
                placeholder="Find on this page…"
                aria-label="Find on this page"
                className="h-8 w-full rounded border border-line bg-surface px-2.5 text-sm text-ink placeholder:text-faint focus:border-accent/70 focus:outline-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={surfaceRef} className="scrollarea flex-1 overflow-y-auto bg-sunken/45 p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.article
            key={page}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: `${zoom / 100}rem` }}
            className={cn(
              'mx-auto min-h-[60vh] w-full max-w-[68ch] rounded-md border border-line bg-surface px-6 py-8 shadow-soft sm:px-10 sm:py-12'
            )}
          >
            {document.type === 'image' ? (
              <div className="flex h-[48vh] flex-col items-center justify-center rounded border border-dashed border-line text-center">
                <p className="text-sm font-medium text-ink">Image preview</p>
                <p className="mt-1 max-w-xs text-meta text-muted">
                  The original file renders here once the backend serves it. OCR text is searchable either way.
                </p>
              </div>
            ) : (
              <p className="text-[1em] leading-[1.75] text-ink-soft">{body}</p>
            )}

            <p className="mt-10 border-t border-line pt-4 text-2xs text-faint">
              {document.name} · page {page}
            </p>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}
