import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryModal from '../components/CategoryModal';
import EbookModalAdmin from '../components/EbookModalAdmin';
import {
  loadEbooksData,
  updateEbooksData,
} from '../utils/ebooks';
import { Category, Ebook, EbooksData } from '../types/ebook';

export default function SuperadminDashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [activeTab, setActiveTab] = useState<'categories' | 'ebooks'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingEbook, setEditingEbook] = useState<Ebook | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEbookModal, setShowEbookModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newEbook, setNewEbook] = useState({
    title: '',
    author: '',
    price: '',
    cover: '',
    pdf: '',
    category: '',
    synopsis: '',
  });

  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'guiderr123';

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = () => {
    const data = loadEbooksData();
    setCategories(data.categories);
    setEbooks(data.ebooks);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const username = (document.getElementById('username') as HTMLInputElement)?.value;
    const password = (document.getElementById('password') as HTMLInputElement)?.value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setShowAuthModal(false);
    } else {
      alert('Invalid credentials');
    }
  };

  const saveData = (newData: EbooksData) => {
    updateEbooksData(newData);
    localStorage.setItem('ebooks_data', JSON.stringify(newData));
    loadData();
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    const data = loadEbooksData();
    const newCat: Category = {
      id: newCategory.name.toLowerCase().replace(/\s+/g, '-'),
      name: newCategory.name,
      description: newCategory.description,
    };

    saveData({
      ...data,
      categories: [...data.categories, newCat],
    });

    setNewCategory({ name: '', description: '' });
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({ name: category.name, description: category.description });
    setShowCategoryModal(true);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !newCategory.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    const data = loadEbooksData();
    saveData({
      ...data,
      categories: data.categories.map((cat) =>
        cat.id === editingCategory.id
          ? { ...cat, name: newCategory.name, description: newCategory.description }
          : cat
      ),
    });

    setEditingCategory(null);
    setNewCategory({ name: '', description: '' });
    setShowCategoryModal(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!confirm('Are you sure? This will also delete all ebooks in this category.')) return;

    const data = loadEbooksData();
    saveData({
      ...data,
      categories: data.categories.filter((cat) => cat.id !== categoryId),
      ebooks: data.ebooks.filter((ebook) => ebook.category !== categoryId),
    });
  };

  const handleAddEbook = () => {
    if (!newEbook.title || !newEbook.author || !newEbook.price || !newEbook.category) {
      alert('Please fill in all required fields');
      return;
    }

    const data = loadEbooksData();
    const newEbookData: Ebook = {
      id: `${newEbook.category}-${Date.now()}`,
      title: newEbook.title,
      author: newEbook.author,
      price: parseInt(newEbook.price),
      cover: newEbook.cover || '/covers/placeholder.jpg',
      pdf: newEbook.pdf || '/ebooks/placeholder.pdf',
      category: newEbook.category,
      synopsis: newEbook.synopsis,
    };

    saveData({
      ...data,
      ebooks: [...data.ebooks, newEbookData],
    });

    setNewEbook({
      title: '',
      author: '',
      price: '',
      cover: '',
      pdf: '',
      category: '',
      synopsis: '',
    });
    setShowEbookModal(false);
    setEditingEbook(null);
  };

  const handleEditEbook = (ebook: Ebook) => {
    setEditingEbook(ebook);
    setNewEbook({
      title: ebook.title,
      author: ebook.author,
      price: ebook.price.toString(),
      cover: ebook.cover,
      pdf: ebook.pdf,
      category: ebook.category,
      synopsis: ebook.synopsis,
    });
    setShowEbookModal(true);
  };

  const handleUpdateEbook = () => {
    if (!editingEbook || !newEbook.title || !newEbook.author || !newEbook.price) {
      alert('Please fill in all required fields');
      return;
    }

    const data = loadEbooksData();
    saveData({
      ...data,
      ebooks: data.ebooks.map((ebook) =>
        ebook.id === editingEbook.id
          ? {
              ...ebook,
              title: newEbook.title,
              author: newEbook.author,
              price: parseInt(newEbook.price),
              cover: newEbook.cover,
              pdf: newEbook.pdf,
              synopsis: newEbook.synopsis,
            }
          : ebook
      ),
    });

    setEditingEbook(null);
    setNewEbook({
      title: '',
      author: '',
      price: '',
      cover: '',
      pdf: '',
      category: '',
      synopsis: '',
    });
    setShowEbookModal(false);
  };

  const handleDeleteEbook = (ebookId: string) => {
    if (!confirm('Are you sure you want to delete this ebook?')) return;

    const data = loadEbooksData();
    saveData({
      ...data,
      ebooks: data.ebooks.filter((ebook) => ebook.id !== ebookId),
    });
  };

  if (showAuthModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Header />
        <div className="pt-32 pb-20 px-4 flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Superadmin Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Username</label>
                <input
                  id="username"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all"
              >
                Login
              </button>
            </form>
            <button
              onClick={() => navigate('/')}
              className="w-full mt-4 py-2 bg-slate-100 text-slate-900 font-semibold rounded-lg hover:bg-slate-200 transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Header />

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          formData={newCategory}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
            setNewCategory({ name: '', description: '' });
          }}
          onSave={editingCategory ? handleUpdateCategory : handleAddCategory}
          onChange={(data) => setNewCategory(data)}
        />
      )}

      {/* Ebook Modal */}
      {showEbookModal && (
        <EbookModalAdmin
          ebook={editingEbook}
          formData={newEbook}
          categories={categories}
          onClose={() => {
            setShowEbookModal(false);
            setEditingEbook(null);
            setNewEbook({
              title: '',
              author: '',
              price: '',
              cover: '',
              pdf: '',
              category: '',
              synopsis: '',
            });
          }}
          onSave={editingEbook ? handleUpdateEbook : handleAddEbook}
          onChange={(data) => setNewEbook(data)}
        />
      )}

      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Superadmin Dashboard</h1>
            <p className="text-lg text-slate-600">Manage categories and ebooks</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'categories'
                  ? 'text-slate-900 border-b-2 border-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('ebooks')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'ebooks'
                  ? 'text-slate-900 border-b-2 border-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ebooks
            </button>
          </div>

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Categories</h2>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setNewCategory({ name: '', description: '' });
                    setShowCategoryModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Category
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div key={category.id} className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{category.name}</h3>
                    <p className="text-slate-600 mb-4">{category.description}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-900 font-semibold rounded-lg hover:bg-slate-200 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 font-semibold rounded-lg hover:bg-red-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ebooks Tab */}
          {activeTab === 'ebooks' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Ebooks</h2>
                <button
                  onClick={() => {
                    setEditingEbook(null);
                    setNewEbook({
                      title: '',
                      author: '',
                      price: '',
                      cover: '',
                      pdf: '',
                      category: '',
                      synopsis: '',
                    });
                    setShowEbookModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Ebook
                </button>
              </div>

              {/* Stamp-sized ebook grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {ebooks.map((ebook) => (
                  <div
                    key={ebook.id}
                    className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-slate-200 relative"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={ebook.cover}
                        alt={ebook.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x200?text=Cover';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Action buttons overlay on hover */}
                      <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50">
                        <button
                          onClick={() => handleEditEbook(ebook)}
                          className="p-2 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEbook(ebook.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-2 sm:p-3">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5 line-clamp-2 leading-tight">
                        {ebook.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-slate-600 mb-1 line-clamp-1">
                        by {ebook.author}
                      </p>
                      <div className="text-sm sm:text-base font-bold text-slate-900">
                        ₹{ebook.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

