import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LayoutGrid, List, Upload } from 'lucide-react';
import PageTransition from '../components/app/PageTransition.jsx';
import PageHeader from '../components/app/PageHeader.jsx';
import SearchBar from '../components/app/SearchBar.jsx';
import DocumentList from '../components/documents/DocumentList.jsx';
import RenameDialog from '../components/documents/RenameDialog.jsx';
import MoveDialog from '../components/documents/MoveDialog.jsx';
import Button from '../components/ui/Button.jsx';
import Select from '../components/ui/Select.jsx';
import SegmentedControl from '../components/ui/SegmentedControl.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Tag from '../components/ui/Tag.jsx';
import { deleteDocument, listDocuments, updateDocument } from '../api/documentsApi.js';
import { createBookmark } from '../api/bookmarksApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useToast } from '../context/ToastContext.jsx';
import { DOCUMENT_TYPES, SORT_OPTIONS } from '../utils/constants.js';

export default function Documents() {
  const { collections, openUpload } = useOutletContext();
  const toast = useToast();

  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [collectionId, setCollectionId] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState('recent');
  const [view, setView] = useState('list');

  const [renaming, setRenaming] = useState(null);
  const [moving, setMoving] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const debouncedQuery = useDebounce(query, 260);

  const { data, loading, error, run, setData } = useAsync(
    () => listDocuments({ search: debouncedQuery, type, collectionId: collectionId || undefined, tag: tag || undefined, sort }),
    [debouncedQuery, type, collectionId, tag, sort]
  );

  const documents = data?.results ?? [];
  const allTags = useMemo(() => {
    const set = new Set();
    documents.forEach((doc) => doc.tags?.forEach((t) => set.add(t)));
    return Array.from(set).slice(0, 8);
  }, [documents]);

  const filtered = Boolean(debouncedQuery || type !== 'all' || collectionId || tag);

  async function handleRename(name) {
    const document = renaming;
    setData((current) => ({
      ...current,
      results: current.results.map((d) => (d.id === document.id ? { ...d, name } : d)),
    }));
    try {
      await updateDocument(document.id, { name });
      toast.success('Renamed', `Now called ${name}.`);
    } catch (err) {
      toast.error('Rename failed', err.message);
      run();
    }
  }

  async function handleMove(nextCollectionId) {
    const document = moving;
    try {
      await updateDocument(document.id, { collectionId: nextCollectionId });
      toast.success('Moved', `${document.name} moved.`);
      run();
    } catch (err) {
      toast.error('Move failed', err.message);
    }
  }

  async function handleDelete() {
    const document = deleting;
    setData((current) => ({ ...current, results: current.results.filter((d) => d.id !== document.id) }));
    try {
      await deleteDocument(document.id);
      toast.success('Deleted', `${document.name} was removed from your library.`);
    } catch (err) {
      toast.error('Delete failed', err.message);
      run();
    }
  }

  async function handleToggleBookmark(document, next) {
    setData((current) => ({
      ...current,
      results: current.results.map((d) => (d.id === document.id ? { ...d, bookmarked: next } : d)),
    }));
    if (!next) return;
    try {
      await createBookmark({
        documentId: document.id,
        documentName: document.name,
        documentType: document.type,
        page: document.lastPage ?? 1,
        excerpt: document.excerpt,
      });
      toast.success('Bookmarked', `${document.name} saved to your bookmarks.`);
    } catch (err) {
      toast.error('Could not bookmark', err.message);
    }
  }

  return (
    <PageTransition className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
      <PageHeader
        title="Documents"
        subtitle="Everything you’ve saved, in one place."
        actions={
          <Button variant="primary" icon={Upload} onClick={openUpload}>
            Upload
          </Button>
        }
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search documents by name or contents…"
          className="min-w-[220px] flex-1"
        />
        <Select
          label="Filter by type"
          value={type}
          onChange={setType}
          options={DOCUMENT_TYPES}
          className="w-[130px]"
        />
        <Select
          label="Filter by collection"
          value={collectionId}
          onChange={setCollectionId}
          className="w-[160px]"
          options={[
            { value: '', label: 'All collections' },
            ...collections.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <Select label="Sort" value={sort} onChange={setSort} options={SORT_OPTIONS} className="w-[160px]" />
        <SegmentedControl
          label="View"
          value={view}
          onChange={setView}
          options={[
            { value: 'list', label: 'List', icon: List, showLabel: false },
            { value: 'grid', label: 'Grid', icon: LayoutGrid, showLabel: false },
          ]}
        />
      </div>

      {allTags.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-1.5">
          <Tag active={!tag} onClick={() => setTag('')}>
            All tags
          </Tag>
          {allTags.map((name) => (
            <Tag key={name} active={tag === name} onClick={() => setTag(tag === name ? '' : name)}>
              {name}
            </Tag>
          ))}
        </div>
      )}

      <p className="mb-3 text-meta text-faint">
        {loading ? 'Loading…' : `${documents.length} ${documents.length === 1 ? 'document' : 'documents'}`}
      </p>

      <DocumentList
        documents={documents}
        view={view}
        loading={loading}
        error={error}
        onRetry={run}
        onRename={setRenaming}
        onMove={setMoving}
        onDelete={setDeleting}
        onToggleBookmark={handleToggleBookmark}
        empty={
          filtered ? (
            <EmptyState
              title="No documents match these filters"
              description="Try a different search term, or clear the filters to see your whole library."
              action={
                <Button
                  onClick={() => {
                    setQuery('');
                    setType('all');
                    setCollectionId('');
                    setTag('');
                  }}
                >
                  Clear filters
                </Button>
              }
              compact
            />
          ) : (
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
          )
        }
      />

      <RenameDialog
        open={Boolean(renaming)}
        onClose={() => setRenaming(null)}
        initialValue={renaming?.name ?? ''}
        label="Document name"
        onSubmit={handleRename}
      />
      <MoveDialog
        open={Boolean(moving)}
        onClose={() => setMoving(null)}
        collections={collections}
        currentId={moving?.collectionId}
        onSubmit={handleMove}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleting?.name ?? 'document'}?`}
        description="The document, its extracted pages and its embeddings are removed. This cannot be undone."
        confirmLabel="Delete document"
      />
    </PageTransition>
  );
}
