import { useState } from 'react';
import { FolderPlus } from 'lucide-react';
import PageTransition from '../components/app/PageTransition.jsx';
import PageHeader from '../components/app/PageHeader.jsx';
import CollectionCard from '../components/collections/CollectionCard.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import Input from '../components/ui/Input.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import RenameDialog from '../components/documents/RenameDialog.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { createCollection, deleteCollection, listCollections, updateCollection } from '../api/collectionsApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Collections() {
  const { data, loading, error, run } = useAsync(() => listCollections(), []);
  const toast = useToast();

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [renaming, setRenaming] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const collections = data?.results ?? [];

  async function handleCreate() {
    if (!form.name.trim()) {
      setFormError('Give the collection a name.');
      return;
    }
    setSaving(true);
    try {
      await createCollection(form);
      toast.success('Collection created', `${form.name} is ready for documents.`);
      setCreating(false);
      setForm({ name: '', description: '' });
      setFormError('');
      run();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageTransition className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 lg:py-12">
      <PageHeader
        title="Collections"
        subtitle="Group documents by subject so you can search a narrower slice."
        actions={
          <Button variant="primary" icon={FolderPlus} onClick={() => setCreating(true)}>
            New collection
          </Button>
        }
      />

      {error ? (
        <div className="rounded-lg border border-line bg-surface">
          <ErrorState title="Collections didn’t load" error={error} onRetry={run} compact />
        </div>
      ) : loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[152px] rounded-lg" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-surface">
          <EmptyState
            icon={FolderPlus}
            title="No collections yet"
            description="Create one for each subject, then move documents into it."
            action={
              <Button variant="primary" icon={FolderPlus} onClick={() => setCreating(true)}>
                New collection
              </Button>
            }
            compact
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, index) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              index={index}
              onRename={setRenaming}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New collection"
        width="max-w-md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} loading={saving}>
              Create collection
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name"
            autoFocus
            placeholder="Semester 5"
            value={form.name}
            error={formError}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <Input
            label="Description"
            placeholder="What belongs in here?"
            hint="Optional, but it helps when you have a dozen collections."
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </div>
      </Modal>

      <RenameDialog
        open={Boolean(renaming)}
        onClose={() => setRenaming(null)}
        initialValue={renaming?.name ?? ''}
        label="Collection name"
        onSubmit={async (name) => {
          await updateCollection(renaming.id, { name });
          toast.success('Renamed', `Now called ${name}.`);
          run();
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={`Delete ${deleting?.name ?? 'collection'}?`}
        description="The collection is removed. Documents inside it stay in your library."
        confirmLabel="Delete collection"
        onConfirm={async () => {
          await deleteCollection(deleting.id);
          toast.success('Collection deleted');
          run();
        }}
      />
    </PageTransition>
  );
}
