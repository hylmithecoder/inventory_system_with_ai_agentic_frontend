import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { InventoryItem } from '../globalvariables';
import { AlertCircle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (item: InventoryItem) => Promise<void>;
  itemToDelete: InventoryItem | null;
  isLoading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemToDelete,
  isLoading
}) => {
  const handleConfirm = async () => {
    if (itemToDelete) {
      await onConfirm(itemToDelete);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Barang"
    >
      <div className="space-y-4">
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <p className="text-slate-700">
              Apakah Anda yakin ingin menghapus barang{' '}
              <span className="font-semibold text-slate-900">"{itemToDelete?.name}"</span>?
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Tindakan ini tidak dapat dibatalkan dan data akan dihapus secara permanen dari sistem.
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            Hapus Barang
          </Button>
        </div>
      </div>
    </Modal>
  );
};
