import { X, Save } from 'lucide-react';
import { Ebook } from '../types/ebook';
import { Category } from '../types/ebook';

interface EbookModalAdminProps {
  ebook: Ebook | null;
  formData: {
    title: string;
    author: string;
    price: string;
    cover: string;
    pdf: string;
    category: string;
    synopsis: string;
  };
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
  onChange: (data: any) => void;
}

export default function EbookModalAdmin({
  ebook,
  formData,
  categories,
  onClose,
  onSave,
  onChange,
}: EbookModalAdminProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-900">
            {ebook ? 'Edit Ebook' : 'New Ebook'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => onChange({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Ebook title"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Author *</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => onChange({ ...formData, author: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Author name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Price (₹) *</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => onChange({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="199"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => onChange({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Cover URL</label>
            <input
              type="text"
              value={formData.cover}
              onChange={(e) => onChange({ ...formData, cover: e.target.value })}
              placeholder="/covers/filename.jpg"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">PDF URL</label>
            <input
              type="text"
              value={formData.pdf}
              onChange={(e) => onChange({ ...formData, pdf: e.target.value })}
              placeholder="/ebooks/filename.pdf"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-900 mb-2">Synopsis</label>
            <textarea
              value={formData.synopsis}
              onChange={(e) => onChange({ ...formData, synopsis: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              rows={4}
              placeholder="Ebook synopsis..."
            />
          </div>
          <div className="md:col-span-2">
            <button
              onClick={onSave}
              className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all"
            >
              <Save className="w-5 h-5" />
              {ebook ? 'Update' : 'Add'} Ebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}





