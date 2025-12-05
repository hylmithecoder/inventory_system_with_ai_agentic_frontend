"use client";
import { useState } from 'react';
import { InventoryItem } from '../globalvariables';
import { Package, MoreHorizontal, Check, X, Pencil, Trash } from 'lucide-react';

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

interface HandleEdit {
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

const formatCurrency = (value: string) => {
  const number = parseFloat(value);
  if (isNaN(number)) return value;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

export const InventoryTable = ({ items, onEdit, onDelete }: InventoryTableProps) => {
  const [isActionOpen, setIsActionOpen] = useState(false);

  const actionClicked = () => {
    setIsActionOpen(true);
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
          <Package className="text-slate-400" size={24} />
        </div>
        <h3 className="text-lg font-medium text-slate-900">Belum ada data barang</h3>
        <p className="text-slate-500 mt-1">Data inventory akan muncul di sini setelah ditambahkan.</p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium text-slate-500">Item Name</th>
              <th scope="col" className="px-6 py-4 font-medium text-slate-500 text-center">Stock</th>
              <th scope="col" className="px-6 py-4 font-medium text-slate-500 text-right">Price (IDR)</th>
              <th scope="col" className="px-6 py-4 font-medium text-slate-500">Added By</th>
              <th scope="col" className="px-6 py-4 font-medium text-slate-500 text-right">Created At</th>
              <th scope="col" className="px-6 py-4 font-medium text-slate-500 text-center">Action</th>
            </tr>
            </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.ID} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">
                  <div className="flex items-center gap-3">
                    {/* <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      {item.name.charAt(0).toUpperCase()}
                    </div> */}
                    {item.name}
                  </div>
                </td>
                <td className="sm:px-6 sm:py-4 text-center">
                  <span className={`block sm:inline-flex items-center px-2.5 py-1 sm:py-0.5 rounded-full text-xs font-medium ${
                    parseInt(item.stock) > 10 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.stock} unit
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium">
                  {formatCurrency(item.price)}
                  </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600">
                      {item.created_by.charAt(0).toUpperCase()}
                    </div>
                    {item.created_by}
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-slate-400 text-xs">
                  {formatDate(item.created_at)}
                </td>
                 <td className="px-6 py-4 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <button className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded hover:bg-indigo-50" onClick={() => onEdit(item)}>
                        <Pencil size={16} />
                      </button>
                      <button className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50" onClick={() => onDelete(item)}>
                        <Trash size={16} />
                      </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};