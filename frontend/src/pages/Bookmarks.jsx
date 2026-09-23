import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Bookmark, Trash2 } from 'lucide-react';
import PageTransition from '../components/app/PageTransition.jsx';
import PageHeader from '../components/app/PageHeader.jsx';
import DocumentIcon from '../components/documents/DocumentIcon.jsx';
import IconButton from '../components/ui/IconButton.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { deleteBookmark, listBookmarks } from '../api/bookmarksApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate } from '../utils/format.js';

export default function Bookmarks() {
  const { data, loading, error, run, setData } = useAsync(() => listBookmarks(), []);
  const [removing, setRemoving] = useState(null);
  const toast = useToast();

  const bookmarks = data?.results ?? [];

  return (
    <PageTransition className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 lg:py-12">
      <PageHeader title="Bookmarks" subtitle="Pages and passages you marked as worth coming back to." />

      {error ? (
        <div className="rounded-lg border border-line bg-surface">
          <ErrorState title="Bookmarks didn’t load" error={error} onRetry={run} compact />
        </div>
      ) : loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[118px] rounded-lg" />
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-surface">
          <EmptyState
            icon={Bookmark}
            title="No bookmarks yet"
            description="Save important pages and sources for quick access."
            action={
              <Button as={Link} to="/documents" variant="primary">
                Browse documents
              </Button>
            }
            compact
          />
        </div>
      ) : (
        <ul className="space-y-2.5">
          {bookmarks.map((bookmark, index) => (
            <motion.li
              key={bookmark.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: Math.min(index * 0.035, 0.24), ease: [0.16, 1, 0.3, 1] }}
              className="group relative"
            >
              <Link
                to={`/documents/${bookmark.documentId}?page=${bookmark.page}`}
                className="block rounded-lg border border-line bg-surface p-4 transition-[border-color,transform] duration-200 hover:-translate-y-[1px] hover:border-line-strong"
              >
                <div className="flex items-center gap-2.5">
                  <DocumentIcon type={bookmark.documentType} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                    {bookmark.documentName}
                  </span>
                  <span className="shrink-0 text-2xs tabular-nums text-muted">Page {bookmark.page}</span>
                  <ArrowUpRight
                    size={13}
                    strokeWidth={2}
                    aria-hidden
                    className="shrink-0 text-faint transition-transform duration-150 group-hover:-translate-y-[1px] group-hover:translate-x-[1px] group-hover:text-accent"
                  />
                </div>

                <p className="mt-3 border-l-2 border-line pl-3 text-base leading-relaxed text-ink-soft">
                  {bookmark.excerpt}
                </p>

                <div className="mt-3 flex items-center gap-2 text-2xs text-faint">
                  <span>Saved {formatDate(bookmark.savedAt)}</span>
                  {bookmark.note && (
                    <>
                      <span aria-hidden className="h-2.5 w-px bg-line" />
                      <span className="truncate text-muted">{bookmark.note}</span>
                    </>
                  )}
                </div>
              </Link>

              <div className="absolute right-3 top-12 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <IconButton
                  icon={Trash2}
                  label="Remove bookmark"
                  onClick={(event) => {
                    event.preventDefault();
                    setRemoving(bookmark);
                  }}
                />
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title="Remove this bookmark?"
        description="The page stays in your library — only the bookmark is removed."
        confirmLabel="Remove bookmark"
        onConfirm={async () => {
          setData((current) => ({ ...current, results: current.results.filter((b) => b.id !== removing.id) }));
          try {
            await deleteBookmark(removing.id);
            toast.success('Bookmark removed');
          } catch (err) {
            toast.error('Could not remove bookmark', err.message);
            run();
          }
        }}
      />
    </PageTransition>
  );
}
