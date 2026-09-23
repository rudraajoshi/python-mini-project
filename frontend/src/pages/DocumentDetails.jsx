import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FolderInput, Pencil, Sparkles, Trash2 } from 'lucide-react';
import PageTransition from '../components/app/PageTransition.jsx';
import DocumentViewer from '../components/documents/DocumentViewer.jsx';
import DocumentIcon from '../components/documents/DocumentIcon.jsx';
import ProcessingStatus from '../components/documents/ProcessingStatus.jsx';
import BookmarkButton from '../components/documents/BookmarkButton.jsx';
import RenameDialog from '../components/documents/RenameDialog.jsx';
import MoveDialog from '../components/documents/MoveDialog.jsx';
import SourceReference from '../components/search/SourceReference.jsx';
import Button from '../components/ui/Button.jsx';
import Tag from '../components/ui/Tag.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { Skeleton, ChatResponseSkeleton } from '../components/ui/Skeleton.jsx';
import { deleteDocument, getDocument, summarizeDocument, updateDocument } from '../api/documentsApi.js';
import { createBookmark } from '../api/bookmarksApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatBytes, formatDate } from '../utils/format.js';

function Detail({ label, children }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-b-0">
      <dt className="shrink-0 text-meta text-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right text-meta font-medium text-ink">{children}</dd>
    </div>
  );
}

export default function DocumentDetails() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { collections } = useOutletContext();

  const { data: document, loading, error, run, setData } = useAsync(() => getDocument(id), [id]);

  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [summary, setSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [moving, setMoving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fromUrl = Number(searchParams.get('page'));
    if (fromUrl && fromUrl !== page) setPage(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function changePage(next) {
    setPage(next);
    setSearchParams({ page: String(next) }, { replace: true });
  }

  async function handleSummarize() {
    setSummarizing(true);
    setSummary(null);
    try {
      setSummary(await summarizeDocument(id));
    } catch (err) {
      toast.error('Summary failed', err.message);
    } finally {
      setSummarizing(false);
    }
  }

  async function handleBookmark(next) {
    setData((current) => ({ ...current, bookmarked: next }));
    if (!next) return;
    try {
      await createBookmark({
        documentId: document.id,
        documentName: document.name,
        documentType: document.type,
        page,
        excerpt: document.pageText?.[page] ?? document.excerpt,
      });
      toast.success('Bookmarked', `Page ${page} saved to your bookmarks.`);
    } catch (err) {
      toast.error('Could not bookmark', err.message);
    }
  }

  if (loading) {
    return (
      <PageTransition className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
        <Skeleton className="mb-6 h-6 w-64" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Skeleton className="h-[70vh] rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </PageTransition>
    );
  }

  if (error || !document) {
    return (
      <PageTransition className="mx-auto w-full max-w-3xl px-5 py-16">
        <ErrorState title="Document unavailable" error={error} onRetry={run} />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 lg:py-8">
      <Link
        to="/documents"
        className="mb-5 inline-flex items-center gap-1.5 rounded text-meta text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={13} strokeWidth={2} aria-hidden />
        Documents
      </Link>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3.5">
          <DocumentIcon type={document.type} size="lg" />
          <div className="min-w-0">
            <h1 className="truncate text-section font-semibold tracking-[-0.015em] text-ink">{document.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              {document.collectionName && (
                <Link
                  to={`/collections/${document.collectionId}`}
                  className="rounded text-meta font-medium text-accent hover:underline"
                >
                  {document.collectionName}
                </Link>
              )}
              <ProcessingStatus status={document.status} progress={document.progress} />
              {document.tags?.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <BookmarkButton active={document.bookmarked} onToggle={handleBookmark} />
          <Button icon={Pencil} onClick={() => setRenaming(true)}>
            Rename
          </Button>
          <Button icon={FolderInput} onClick={() => setMoving(true)}>
            Move
          </Button>
          <Button icon={Trash2} variant="ghost" onClick={() => setDeleting(true)}>
            Delete
          </Button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_304px]">
        <div className="h-[72vh] min-h-[480px] lg:h-[76vh]">
          <DocumentViewer document={document} page={page} onPageChange={changePage} />
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border border-line bg-surface p-4">
            <h2 className="mb-1 text-sm font-semibold text-ink">Details</h2>
            <dl>
              <Detail label="Type">{document.type.toUpperCase()}</Detail>
              <Detail label="Size">{formatBytes(document.size)}</Detail>
              <Detail label="Pages">{document.pages}</Detail>
              <Detail label="Added">{formatDate(document.createdAt)}</Detail>
              <Detail label="Last opened">{document.openedAt ? formatDate(document.openedAt) : 'Not yet'}</Detail>
            </dl>
          </section>

          <section className="rounded-lg border border-line bg-surface p-4">
            <h2 className="text-sm font-semibold text-ink">Summary</h2>
            <p className="mt-1 text-meta leading-relaxed text-muted">
              Condense this document into a few paragraphs, with the pages each claim came from.
            </p>

            {summarizing ? (
              <div className="mt-4">
                <ChatResponseSkeleton />
              </div>
            ) : summary ? (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24 }}
                className="mt-4"
              >
                <p className="text-sm leading-relaxed text-ink-soft">{summary.summary}</p>
                {summary.sources?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {summary.sources.map((source, index) => (
                      <SourceReference key={`${source.page}-${index}`} source={source} index={index} />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <Button icon={Sparkles} className="mt-3.5 w-full" onClick={handleSummarize}>
                Generate summary
              </Button>
            )}
          </section>

          <section className="rounded-lg border border-line bg-surface p-4">
            <h2 className="text-sm font-semibold text-ink">Ask about this document</h2>
            <p className="mt-1 text-meta leading-relaxed text-muted">
              Start a conversation scoped to this file instead of your whole library.
            </p>
            <Button
              variant="primary"
              className="mt-3.5 w-full"
              icon={Sparkles}
              onClick={() => navigate(`/ask?document=${document.id}`)}
            >
              Ask a question
            </Button>
          </section>
        </aside>
      </div>

      <RenameDialog
        open={renaming}
        onClose={() => setRenaming(false)}
        initialValue={document.name}
        label="Document name"
        onSubmit={async (name) => {
          setData((current) => ({ ...current, name }));
          await updateDocument(document.id, { name });
          toast.success('Renamed', `Now called ${name}.`);
        }}
      />
      <MoveDialog
        open={moving}
        onClose={() => setMoving(false)}
        collections={collections}
        currentId={document.collectionId}
        onSubmit={async (collectionId) => {
          await updateDocument(document.id, { collectionId });
          toast.success('Moved', 'Collection updated.');
          run();
        }}
      />
      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        title={`Delete ${document.name}?`}
        description="The document, its extracted pages and its embeddings are removed. This cannot be undone."
        confirmLabel="Delete document"
        onConfirm={async () => {
          await deleteDocument(document.id);
          toast.success('Deleted', `${document.name} was removed from your library.`);
          navigate('/documents');
        }}
      />
    </PageTransition>
  );
}
