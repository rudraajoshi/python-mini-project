import { useMemo, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bookmark,
  Folder,
  FolderPlus,
  MessageSquare,
  Search as SearchIcon,
  Sparkles,
  Upload,
} from 'lucide-react';
import PageTransition from '../components/app/PageTransition.jsx';
import SearchBar from '../components/app/SearchBar.jsx';
import DocumentList from '../components/documents/DocumentList.jsx';
import CollectionCard from '../components/collections/CollectionCard.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { DashboardSkeleton } from '../components/ui/Skeleton.jsx';
import { listDocuments } from '../api/documentsApi.js';
import { listActivity } from '../api/activityApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatRelative, greeting } from '../utils/format.js';

const activityIcons = {
  upload: Upload,
  ask: Sparkles,
  bookmark: Bookmark,
  collection: FolderPlus,
  search: SearchIcon,
};

function SectionHeading({ title, action }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <h2 className="text-lg font-semibold tracking-[-0.01em] text-ink">{title}</h2>
      {action}
    </div>
  );
}

function ContinueReading({ documents }) {
  const items = documents
    .filter((doc) => doc.openedAt && doc.pages > 1)
    .sort((a, b) => new Date(b.openedAt) - new Date(a.openedAt))
    .slice(0, 3);

  if (items.length === 0) return null;

  return (
    <section>
      <SectionHeading title="Continue reading" />
      <div className="grid gap-2.5 sm:grid-cols-3">
        {items.map((doc, index) => {
          const progress = Math.round((doc.lastPage / doc.pages) * 100);
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={`/documents/${doc.id}?page=${doc.lastPage}`}
                className="group block rounded-lg border border-line bg-surface p-3.5 transition-[border-color,transform] duration-200 hover:-translate-y-[1px] hover:border-line-strong"
              >
                <p className="truncate text-sm font-medium text-ink">{doc.name}</p>
                <p className="mt-0.5 text-2xs text-faint">
                  Page {doc.lastPage} of {doc.pages} · opened {formatRelative(doc.openedAt)}
                </p>
                <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-sunken">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="block h-full rounded-full bg-accent/70"
                  />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const { collections, openUpload } = useOutletContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const documentsState = useAsync(() => listDocuments({ sort: 'recent' }), []);
  const activityState = useAsync(() => listActivity(), []);

  const documents = documentsState.data?.results ?? [];
  const recent = useMemo(() => documents.slice(0, 5), [documents]);
  const activity = activityState.data?.results ?? [];

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <PageTransition className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 lg:py-12">
      <header className="mb-8">
        <p className="text-meta text-muted">
          {greeting()}, {firstName}
        </p>
        <h1 className="mt-1 text-title font-semibold tracking-[-0.022em] text-ink">
          {documents.length > 0
            ? `${documents.length} documents, indexed and searchable.`
            : 'Nothing saved yet. Start with one document.'}
        </h1>
      </header>

      <SearchBar
        size="lg"
        value={query}
        shortcut={['⌘', 'K']}
        onChange={setQuery}
        onSubmit={(value) => navigate(value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : '/search')}
        className="mb-4"
      />

      <div className="mb-11 flex flex-wrap items-center gap-2">
        <Button icon={Upload} onClick={openUpload}>
          Upload document
        </Button>
        <Button as={Link} to="/ask" icon={Sparkles}>
          Ask your knowledge
        </Button>
        <Button as={Link} to="/collections" icon={Folder}>
          Browse collections
        </Button>
      </div>

      {documentsState.loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-11">
          <section>
            <SectionHeading
              title="Recent documents"
              action={
                <Link to="/documents" className="rounded text-meta font-medium text-accent hover:underline">
                  All documents
                </Link>
              }
            />
            <DocumentList
              documents={recent}
              error={documentsState.error}
              onRetry={documentsState.run}
              empty={
                <EmptyState
                  icon={Upload}
                  title="Your library is empty"
                  description="Upload your first document to start building your knowledge base."
                  action={
                    <Button variant="primary" icon={Upload} onClick={openUpload}>
                      Upload document
                    </Button>
                  }
                  compact
                />
              }
            />
          </section>

          <ContinueReading documents={documents} />

          {collections.length > 0 && (
            <section>
              <SectionHeading
                title="Collections"
                action={
                  <Link to="/collections" className="rounded text-meta font-medium text-accent hover:underline">
                    All collections
                  </Link>
                }
              />
              <div className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
                {collections.slice(0, 4).map((collection, index) => (
                  <div key={collection.id} className="w-[220px] shrink-0 sm:w-auto">
                    <CollectionCard collection={collection} index={index} compact />
                  </div>
                ))}
              </div>
            </section>
          )}

          {activity.length > 0 && (
            <section>
              <SectionHeading title="Activity" />
              <ul className="rounded-lg border border-line bg-surface">
                {activity.map((item) => {
                  const Icon = activityIcons[item.kind] ?? MessageSquare;
                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0"
                    >
                      <Icon size={14} strokeWidth={1.8} aria-hidden className="shrink-0 text-faint" />
                      <span className="min-w-0 flex-1 truncate text-sm text-ink-soft">{item.label}</span>
                      <span className="hidden shrink-0 text-2xs text-muted sm:block">{item.detail}</span>
                      <span className="shrink-0 text-2xs tabular-nums text-faint">{formatRelative(item.at)}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      )}
    </PageTransition>
  );
}
