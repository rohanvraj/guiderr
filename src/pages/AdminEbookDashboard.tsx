import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Lock, LogOut, Save, X, Loader2 } from 'lucide-react';
import { getCategories } from '../utils/ebooks';
import { getAllProducts, createProduct, updateProduct, deleteProduct, Product } from '../utils/supabase';

interface EditingProduct {
  id?: string;
  name: string;
  price_in_rupees: number;
  delivery_link: string;
  category: string;
  cover_image_url: string;
  isNew?: boolean;
}

export default function AdminEbookDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories] = useState(getCategories());
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load products from Supabase on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
    }
  }, [isAuthenticated]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
      setMessage('Failed to load products from database');
    } finally {
      setLoading(false);
    }
  };

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
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleAddNew = () => {
    const newProduct: EditingProduct = {
      name: '',
      price_in_rupees: 0,
      delivery_link: '',
      category: categories[0]?.id || 'motorcycles',
      cover_image_url: '',
      isNew: true,
    };
    setEditingProduct(newProduct);
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      price_in_rupees: product.price_in_rupees,
      delivery_link: product.delivery_link,
      category: product.category || 'motorcycles',
      cover_image_url: product.cover_image_url || '',
      isNew: false,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!editingProduct) return;

    // Validate required fields
    if (!editingProduct.name || !editingProduct.category) {
      alert('Please fill in all required fields (Title and Category)');
      return;
    }

    setSaving(true);
    try {
      // Map category slug to PascalCase for Supabase
      const categoryMapping: Record<string, string> = {
        'motorcycles': 'Motorcycles',
        'finance': 'Finance',
        'travel': 'Travel',
        'children': 'Children',
        'parenting': 'Parenting',
      };
      const categoryName = categoryMapping[editingProduct.category] || editingProduct.category;

      if (editingProduct.isNew) {
        // Create new product in Supabase
        await createProduct({
          name: editingProduct.name,
          price_in_rupees: editingProduct.price_in_rupees,
          delivery_link: editingProduct.delivery_link,
          category: categoryName,
          cover_image_url: editingProduct.cover_image_url,
        });
        setMessage('Product created successfully!');
      } else if (editingProduct.id) {
        // Update existing product in Supabase
        await updateProduct(editingProduct.id, {
          name: editingProduct.name,
          price_in_rupees: editingProduct.price_in_rupees,
          delivery_link: editingProduct.delivery_link,
          category: categoryName,
          cover_image_url: editingProduct.cover_image_url,
        });
        setMessage('Product updated successfully!');
      }

      // Reload products from Supabase
      await loadProducts();
      setEditingProduct(null);
      setShowForm(false);
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setMessage(`Error: ${err.message || 'Failed to save product'}`);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product? This cannot be undone.')) {
      try {
        await deleteProduct(id);
        await loadProducts();
        setMessage('Product deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (err: any) {
        console.error('Failed to delete product:', err);
        setMessage(`Error: ${err.message || 'Failed to delete product'}`);
      }
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
              Add New Product
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && editingProduct && (
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingProduct.isNew ? 'Add New Product' : 'Edit Product'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Title *</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="Product title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Category *</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, category: e.target.value })
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
                  value={editingProduct.price_in_rupees}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, price_in_rupees: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Google Drive Download Link</label>
                <input
                  type="url"
                  value={editingProduct.delivery_link}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, delivery_link: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="https://drive.google.com/drive/folders/..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Cover Image URL</label>
                <input
                  type="url"
                  value={editingProduct.cover_image_url}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, cover_image_url: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="https://res.cloudinary.com/... or any image URL"
                />
                {editingProduct.cover_image_url && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-500 mb-2">Preview:</p>
                    <img 
                      src={editingProduct.cover_image_url} 
                      alt="Cover preview" 
                      className="w-24 h-32 object-cover rounded-lg border border-slate-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {saving ? 'Saving...' : 'Save Product'}
              </button>

              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Products List */}
        {!showForm && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Products ({products.length})</h2>

            {products.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center text-slate-500">
                No products yet. Click "Add New Product" to create one.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl shadow p-6 flex items-center justify-between hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {product.cover_image_url && (
                        <img 
                          src={product.cover_image_url} 
                          alt={product.name}
                          className="w-12 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                        <div className="mt-1 flex gap-4 text-sm text-slate-500">
                          <span>Category: {product.category}</span>
                          <span>Price: ₹{product.price_in_rupees}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5 text-blue-600" />
                      </button>

                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
