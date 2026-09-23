import { useState } from 'react';
import { Check } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { cn } from '../../utils/cn.js';

export default function MoveDialog({ open, onClose, collections = [], currentId, onSubmit }) {
  const [selected, setSelected] = useState(currentId ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setSaving(true);
    try {
      await onSubmit?.(selected || null);
      onClose?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Move to collection"
      width="max-w-md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={saving}>
            Move document
          </Button>
        </>
      }
    >
      <ul className="max-h-72 space-y-1 overflow-y-auto scrollarea">
        {[{ id: '', name: 'No collection', description: 'Keep it out of every collection' }, ...collections].map(
          (collection) => {
            const active = selected === collection.id;
            return (
              <li key={collection.id || 'none'}>
                <button
                  type="button"
                  onClick={() => setSelected(collection.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors duration-150',
                    active ? 'border-accent-line bg-accent-soft' : 'border-transparent hover:bg-sunken'
                  )}
                >
                  {collection.accent ? (
                    <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: collection.accent }} />
                  ) : (
                    <span className="h-2 w-2 shrink-0 rounded-[2px] bg-line-strong" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{collection.name}</span>
                    {collection.description && (
                      <span className="block truncate text-2xs text-muted">{collection.description}</span>
                    )}
                  </span>
                  {active && <Check size={14} strokeWidth={2.4} className="shrink-0 text-accent" aria-hidden />}
                </button>
              </li>
            );
          }
        )}
      </ul>
    </Modal>
  );
}
