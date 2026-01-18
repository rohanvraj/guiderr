import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Lock, LogOut, Save, X } from 'lucide-react';
import { getAllEbooks, updateEbooksData, getCategories, loadEbooksData } from '../utils/ebooks';
import { Ebook, EbooksData } from '../types/ebook';

interface EditingEbook extends Ebook {
  isNew?: boolean;
}

export default function AdminEbookDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
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

  const handleLogin = () => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'guiderr2024';
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      alert('Invalid password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setEditingEbook(null);
    setShowForm(false);
  };

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-slate-900" />
            <h1 className="text-3xl font-bold text-slate-900 ml-2">Admin Access</h1>
          </div>

          <p className="text-slate-600 mb-6 text-center">
            Enter the admin password to access the ebook management dashboard.
          </p>

          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter password"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />

            <button
              onClick={handleLogin}
              className="w-full py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Access Dashboard
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-4 text-center">
            Password is stored in Netlify environment variables (VITE_ADMIN_PASSWORD)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-slate-900 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Ebook Management Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Message */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {message}
          </div>
        )}

        {/* Controls */}
        {!showForm && (
          <div className="mb-6">
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
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingEbook.isNew ? 'Add New Ebook' : 'Edit Ebook'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="flex gap-4 mt-8">
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
            <h2 className="text-2xl font-bold mb-6">Ebooks ({ebooks.length})</h2>

            <div className="grid grid-cols-1 gap-4">
              {ebooks.map((ebook) => (
                <div
                  key={ebook.id}
                  className="bg-white rounded-xl shadow p-6 flex items-center justify-between hover:shadow-lg transition-shadow"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">{ebook.title}</h3>
                    <p className="text-sm text-slate-600">By {ebook.author}</p>
                    <div className="mt-2 flex gap-4 text-sm text-slate-500">
                      <span>Category: {ebook.category}</span>
                      <span>Price: ₹{ebook.price}</span>
                      {ebook.featured && (
                        <span className="text-emerald-600 font-semibold">Featured</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(ebook)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5 text-blue-600" />
                    </button>

                    <button
                      onClick={() => handleDelete(ebook.id)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
