import { X, Save } from 'lucide-react';
import { Category } from '../types/ebook';

interface CategoryModalProps {
  category: Category | null;
  formData: { name: string; description: string };
  onClose: () => void;
  onSave: () => void;
  onChange: (data: { name: string; description: string }) => void;
}

export default function CategoryModal({
  category,
  formData,
  onClose,
  onSave,
  onChange,
}: CategoryModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-900">
            {category ? 'Edit Category' : 'New Category'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Category name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              rows={3}
              placeholder="Category description"
            />
          </div>
          <button
            onClick={onSave}
            className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all"
          >
            <Save className="w-5 h-5" />
            {category ? 'Update' : 'Add'} Category
          </button>
        </div>
      </div>
    </div>
  );
}





