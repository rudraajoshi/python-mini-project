import { useState } from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  variant = 'danger',
}) {
  const [working, setWorking] = useState(false);

  async function handleConfirm() {
    setWorking(true);
    try {
      await onConfirm?.();
      onClose?.();
    } finally {
      setWorking(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={working ? undefined : onClose}
      title={title}
      width="max-w-md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={working}>
            Cancel
          </Button>
          <Button variant={variant} onClick={handleConfirm} loading={working}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-base leading-relaxed text-muted">{description}</p>
    </Modal>
  );
}
