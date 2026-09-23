import { FileText } from 'lucide-react';
import DocumentRow from './DocumentRow.jsx';
import DocumentCard from './DocumentCard.jsx';
import { DocumentRowSkeleton, Skeleton } from '../ui/Skeleton.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import ErrorState from '../ui/ErrorState.jsx';

/** One list component reused by Documents, Dashboard and Collection details. */
export default function DocumentList({
  documents = [],
  view = 'list',
  loading = false,
  error = null,
  onRetry,
  empty,
  ...handlers
}) {
  if (error) {
    return (
      <div className="rounded-lg border border-line bg-surface">
        <ErrorState title="Documents didn’t load" error={error} onRetry={onRetry} compact />
      </div>
    );
  }

  if (loading) {
    return view === 'grid' ? (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[184px] rounded-lg" />
        ))}
      </div>
    ) : (
      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        {Array.from({ length: 5 }).map((_, i) => (
          <DocumentRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-surface">
        {empty ?? (
          <EmptyState
            icon={FileText}
            title="Nothing here yet"
            description="Documents you upload will show up in this list."
            compact
          />
        )}
      </div>
    );
  }

  if (view === 'grid') {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {documents.map((document, index) => (
          <DocumentCard key={document.id} document={document} index={index} {...handlers} />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      {documents.map((document, index) => (
        <DocumentRow key={document.id} document={document} index={index} {...handlers} />
      ))}
    </div>
  );
}
