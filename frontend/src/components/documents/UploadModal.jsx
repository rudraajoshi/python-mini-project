import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Select from '../ui/Select.jsx';
import UploadDropzone from './UploadDropzone.jsx';
import DocumentIcon from './DocumentIcon.jsx';
import ProcessingStatus from './ProcessingStatus.jsx';
import { uploadDocument } from '../../api/documentsApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatBytes } from '../../utils/format.js';

const typeOf = (name) => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['png', 'jpg', 'jpeg'].includes(ext)) return 'image';
  return ['pdf', 'md', 'txt'].includes(ext) ? ext : 'txt';
};

export default function UploadModal({ open, onClose, collections = [], onUploaded }) {
  const [queue, setQueue] = useState([]);
  const [collectionId, setCollectionId] = useState('');
  const toast = useToast();

  const patch = useCallback((id, changes) => {
    setQueue((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  }, []);

  const handleFiles = useCallback(
    async (files) => {
      const entries = files.map((file) => ({
        id: `q_${Math.random().toString(36).slice(2, 8)}`,
        file,
        status: 'uploading',
        progress: 0,
      }));
      setQueue((current) => [...current, ...entries]);

      for (const entry of entries) {
        try {
          const created = await uploadDocument(entry.file, {
            collectionId: collectionId || undefined,
            onProgress: (progress) => patch(entry.id, { progress }),
          });
          // The backend continues with extraction, chunking and embeddings after
          // the upload completes; the UI reflects that without simulating it.
          patch(entry.id, { status: 'processing', progress: 100 });
          onUploaded?.(created);
        } catch (error) {
          patch(entry.id, { status: 'failed' });
          toast.error('Upload failed', `${entry.file.name} — ${error.message}`);
        }
      }
    },
    [collectionId, patch, onUploaded, toast]
  );

  function handleClose() {
    setQueue([]);
    onClose?.();
  }

  const done = queue.length > 0 && queue.every((item) => item.status !== 'uploading');

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Upload documents"
      description="PDFs, notes and screenshots are indexed page by page once they arrive."
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            {done ? 'Close' : 'Cancel'}
          </Button>
          <Button variant="primary" onClick={handleClose} disabled={queue.length === 0}>
            Done
          </Button>
        </>
      }
    >
      <UploadDropzone onFiles={handleFiles} />

      <div className="mt-4 flex items-center gap-3">
        <span className="shrink-0 text-meta text-muted">Add to</span>
        <Select
          className="w-52"
          label="Collection"
          value={collectionId}
          onChange={setCollectionId}
          options={[
            { value: '', label: 'No collection' },
            ...collections.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
      </div>

      <AnimatePresence initial={false}>
        {queue.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 space-y-2 overflow-hidden"
          >
            {queue.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-md border border-line bg-raised px-3 py-2.5"
              >
                <DocumentIcon type={typeOf(item.file.name)} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-medium text-ink">{item.file.name}</p>
                    <span className="shrink-0 text-2xs tabular-nums text-faint">{formatBytes(item.file.size)}</span>
                  </div>
                  <div className="mt-1.5">
                    <ProcessingStatus status={item.status} progress={item.progress} variant="bar" />
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${item.file.name}`}
                  onClick={() => setQueue((c) => c.filter((q) => q.id !== item.id))}
                  className="rounded p-1 text-faint transition-colors hover:bg-sunken hover:text-ink"
                >
                  <X size={13} strokeWidth={2} aria-hidden />
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </Modal>
  );
}
