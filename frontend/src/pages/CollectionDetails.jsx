import { useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Sparkles } from 'lucide-react';
import PageTransition from '../components/app/PageTransition.jsx';
import DocumentList from '../components/documents/DocumentList.jsx';
import RenameDialog from '../components/documents/RenameDialog.jsx';
import MoveDialog from '../components/documents/MoveDialog.jsx';
import Button from '../components/ui/Button.jsx';
import Tag from '../components/ui/Tag.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { getCollection } from '../api/collectionsApi.js';
import { deleteDocument, updateDocument } from '../api/documentsApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatRelative } from '../utils/format.js';

export default function CollectionDetails() {
  const { id } = useParams();
  const { collections, openUpload } = useOutletContext();
  const toast = useToast();

  const { data, loading, error, run } = useAsync(() => getCollection(id), [id]);
  const [renaming, setRenaming] = useState(null);
  const [moving, setMoving] = useState(null);
  const [deleting, setDeleting] = useState(null);

  if (loading) {
    return (
      <PageTransition className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 lg:py-12">
        <Skeleton className="mb-3 h-7 w-52" />
        <Skeleton className="mb-8 h-4 w-80" />
        <Skeleton className="h-64 rounded-lg" />
      </PageTransition>
    );
  }

  if (error || !data) {
    return (
      <PageTransition className="mx-auto w-full max-w-3xl px-5 py-16">
        <ErrorState title="Collection unavailable" error={error} onRetry={run} />
      </PageTransition>
    );
  }

  const documents = data.documents ?? [];
  const tags = Array.from(new Set(documents.flatMap((doc) => doc.tags ?? []))).slice(0, 10);

  return (
    <PageTransition className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-8 lg:py-10">
      <Link
        to="/collections"
        className="mb-5 inline-flex items-center gap-1.5 rounded text-meta text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={13} strokeWidth={2} aria-hidden />
        Collections
      </Link>

      <header className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div className="min-w-0">
          <span
            aria-hidden
            className="mb-3 block h-[3px] w-10 rounded-full"
            style={{ backgroundColor: data.accent }}
          />
          <h1 className="text-title font-semibold tracking-[-0.022em] text-ink">{data.name}</h1>
          {data.description && <p className="mt-1.5 max-w-[60ch] text-lg text-muted">{data.description}</p>}
          <p className="mt-3 text-meta text-faint">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'} · updated{' '}
            {formatRelative(data.updatedAt)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button as={Link} to={`/ask?collection=${data.id}`} icon={Sparkles}>
            Ask this collection
          </Button>
          <Button variant="primary" icon={Plus} onClick={openUpload}>
            Add documents
          </Button>
        </div>
      </header>

      {tags.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      )}

      <DocumentList
        documents={documents}
        onRename={setRenaming}
        onMove={setMoving}
        onDelete={setDeleting}
        empty={
          <EmptyState
            icon={Plus}
            title="Nothing in this collection yet"
            description="Upload documents here, or move existing ones in from your library."
            action={
              <Button variant="primary" icon={Plus} onClick={openUpload}>
                Add documents
              </Button>
            }
            compact
          />
        }
      />

      <RenameDialog
        open={Boolean(renaming)}
        onClose={() => setRenaming(null)}
        initialValue={renaming?.name ?? ''}
        label="Document name"
        onSubmit={async (name) => {
          await updateDocument(renaming.id, { name });
          toast.success('Renamed', `Now called ${name}.`);
          run();
        }}
      />
      <MoveDialog
        open={Boolean(moving)}
        onClose={() => setMoving(null)}
        collections={collections}
        currentId={moving?.collectionId}
        onSubmit={async (collectionId) => {
          await updateDocument(moving.id, { collectionId });
          toast.success('Moved', 'Collection updated.');
          run();
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={`Delete ${deleting?.name ?? 'document'}?`}
        description="The document, its extracted pages and its embeddings are removed. This cannot be undone."
        confirmLabel="Delete document"
        onConfirm={async () => {
          await deleteDocument(deleting.id);
          toast.success('Deleted', `${deleting.name} was removed from your library.`);
          run();
        }}
      />
    </PageTransition>
  );
}
