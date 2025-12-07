"use client"
import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { InventoryItem, InventoryFormData } from '../globalvariables';

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InventoryFormData) => Promise<void>;
  initialData?: InventoryItem | null;
  isLoading?: boolean;
}

export const InventoryFormModal: React.FC<InventoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}) => {
  const [formData, setFormData] = useState<InventoryFormData>({
    name: '',
    stock: '',
    price: ''
  });

  useEffect(() => {
    // Defer the state update to avoid synchronous setState inside effect
    const timer = setTimeout(() => {
      if (initialData) {
        setFormData({
          name: initialData.name,
          stock: initialData.stock,
          price: initialData.price
        });
      } else {
        setFormData({ name: '', stock: '', price: '' });
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Barang" : "Tambah Barang Baru"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Barang"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Contoh: Nasi Goreng"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Stok"
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            placeholder="0"
            required
          />
          <Input
            label="Harga (IDR)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            placeholder="0"
            required
          />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {initialData ? 'Simpan Perubahan' : 'Tambah Barang'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};