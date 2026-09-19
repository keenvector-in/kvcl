import type { ReactNode } from 'react';
import { Button } from '../Button';
import { Modal } from '../Modal';

export interface ConfirmDialogProps {
  title: string;
  /** What will happen, in plain words ("This removes the offer from 12 products."). */
  message: ReactNode;
  /** Say the action, not "OK": "Delete offer". Default "Confirm". */
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` for destructive actions (default), `primary` otherwise. */
  tone?: 'danger' | 'primary';
  /** Shows progress on the confirm button and disables both buttons. */
  loading?: boolean;
  onConfirm: () => void;
  /** Also called on Escape and backdrop click. */
  onCancel: () => void;
}

/** Small confirmation modal for irreversible or risky actions. */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      title={title}
      size="sm"
      onClose={loading ? () => {} : onCancel}
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-fg-muted">{message}</p>
    </Modal>
  );
}
