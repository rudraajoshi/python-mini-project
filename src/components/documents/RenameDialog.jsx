import { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';

export default function RenameDialog({ open, onClose, initialValue = '', label = 'Name', onSubmit }) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  useEffect(() => setValue(initialValue), [initialValue, open]);

  async function handleSubmit() {
    if (!value.trim()) return;
    setSaving(true);
    try {
      await onSubmit?.(value.trim());
      onClose?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Rename"
      width="max-w-md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={saving}>
            Save name
          </Button>
        </>
      }
    >
      <Input
        label={label}
        value={value}
        autoFocus
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && handleSubmit()}
      />
    </Modal>
  );
}
