import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { updateEbooksData, loadEbooksData } from '../../utils/ebooks';
import { Ebook, EbooksData } from '../../types/ebook';

interface EditingEbook extends Ebook {
  isNew?: boolean;
}

interface EbookManagerProps {
  // No authentication prop - parent component handles auth
}

export default function EbookManager({}: EbookManagerProps) {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [editingEbook, setEditingEbook] = useState<EditingEbook | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load initial data
    const data = loadEbooksData();
    setEbooks(data.ebooks);
    setCategories(data.categories);
  }, []);

  const handleAddNew = () => {
    const newEbook: EditingEbook = {
      id: `ebook-${Date.now()}`,
      title: '',
      author: '',
      price: 0,
      cover: '',
      coverImage: '',
      pdf: '',
      category: categories[0]?.id || '',
      synopsis: '',
      featured: false,
      downloadLink: '',
      isNew: true,
    };
    setEditingEbook(newEbook);
    setShowForm(true);
  };

  const handleEdit = (ebook: Ebook) => {
    setEditingEbook(ebook);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!editingEbook) return;

    // Validate required fields
    if (!editingEbook.title || !editingEbook.author || !editingEbook.category) {
      alert('Please fill in all required fields');
      return;
    }

    let updatedEbooks: Ebook[];

    if (editingEbook.isNew) {
      // Add new ebook
      const newEbook: Ebook = {
        ...editingEbook,
      };
      delete (newEbook as any).isNew;
      updatedEbooks = [...ebooks, newEbook];
    } else {
      // Edit existing ebook
      updatedEbooks = ebooks.map((e) =>
        e.id === editingEbook.id
          ? { ...editingEbook }
          : e
      );
    }

    const data = loadEbooksData();
    const newData: EbooksData = {
      ...data,
      ebooks: updatedEbooks,
    };

    await updateEbooksData(newData);
    setEbooks(updatedEbooks);
    setEditingEbook(null);
    setShowForm(false);
    setMessage('Ebook saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this ebook?')) {
      const updatedEbooks = ebooks.filter((e) => e.id !== id);

      const data = loadEbooksData();
      const newData: EbooksData = {
        ...data,
        ebooks: updatedEbooks,
      };

      await updateEbooksData(newData);
      setEbooks(updatedEbooks);
      setMessage('Ebook deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {message}
        </div>
      )}

      {/* Controls */}
      {!showForm && (
        <div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Ebook
          </button>
        </div>
      )}

      {/* Form */}
      {showForm && editingEbook && (
        <div className="bg-white rounded-2xl shadow p-6 border border-slate-200">
          <h3 className="text-xl font-bold mb-6">
            {editingEbook.isNew ? 'Add New Ebook' : 'Edit Ebook'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Title *</label>
              <input
                type="text"
                value={editingEbook.title}
                onChange={(e) =>
                  setEditingEbook({ ...editingEbook, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Ebook title"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Author *</label>
              <input
                type="text"
                value={editingEbook.author}
                onChange={(e) =>
                  setEditingEbook({ ...editingEbook, author: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Author name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Category *</label>
              <select
                value={editingEbook.category}
                onChange={(e) =>
                  setEditingEbook({ ...editingEbook, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Price (₹)</label>
              <input
                type="number"
                value={editingEbook.price}
                onChange={(e) =>
                  setEditingEbook({ ...editingEbook, price: parseFloat(e.target.value) })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Google Drive Download Link</label>
              <input
                type="url"
                value={editingEbook.downloadLink || ''}
                onChange={(e) =>
                  setEditingEbook({ ...editingEbook, downloadLink: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="https://drive.google.com/drive/folders/..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Cloudinary Cover Image URL</label>
              <input
                type="url"
                value={editingEbook.coverImage || ''}
                onChange={(e) =>
                  setEditingEbook({ ...editingEbook, coverImage: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="https://res.cloudinary.com/..."
              />
              <p className="text-xs text-slate-500 mt-2">
                Format: https://res.cloudinary.com/your-cloud/image/upload/w=400,h=600,c=fill/your-image-url
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Synopsis</label>
              <textarea
                value={editingEbook.synopsis}
                onChange={(e) =>
                  setEditingEbook({ ...editingEbook, synopsis: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Ebook description"
                rows={4}
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingEbook.featured}
                  onChange={(e) =>
                    setEditingEbook({ ...editingEbook, featured: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold">Featured</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Ebook
            </button>

            <button
              onClick={() => {
                setShowForm(false);
                setEditingEbook(null);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Ebooks List */}
      {!showForm && (
        <div>
          <h3 className="text-xl font-bold mb-4">Ebooks ({ebooks.length})</h3>

          <div className="grid grid-cols-1 gap-3">
            {ebooks.length === 0 ? (
              <div className="bg-slate-50 rounded-lg p-6 text-center text-slate-500">
                No ebooks yet. Create your first ebook to get started.
              </div>
            ) : (
              ebooks.map((ebook) => (
                <div
                  key={ebook.id}
                  className="bg-white rounded-lg shadow p-4 flex items-center justify-between hover:shadow-md transition-shadow border border-slate-100"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{ebook.title}</h4>
                    <p className="text-sm text-slate-600">By {ebook.author}</p>
                    <div className="mt-2 flex gap-4 text-xs text-slate-500">
                      <span>Category: {ebook.category}</span>
                      <span>Price: ₹{ebook.price}</span>
                      {ebook.featured && (
                        <span className="text-emerald-600 font-semibold">Featured</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(ebook)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>

                    <button
                      onClick={() => handleDelete(ebook.id)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
