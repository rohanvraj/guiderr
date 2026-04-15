import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase, Product } from '../../utils/supabase';

interface EditingProduct extends Product {
  isNew?: boolean;
  product_type?: string;
  category?: string;
}

interface ProductManagerProps {
  // No authentication prop - parent component handles auth
}

export default function ProductManager({}: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch products from Supabase on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to fetch products:', error);
          setMessage('Failed to load products from database');
          return;
        }

        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setMessage('Error loading products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddNew = () => {
    const newProduct: EditingProduct = {
      id: `temp-${Date.now()}`,
      name: '',
      price_in_rupees: 0,
      delivery_link: '',
      product_type: 'ebook',
      category: getDefaultCategory('ebook'),
      author: '',
      isNew: true,
    };
    setEditingProduct(newProduct);
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      console.error('Cloudinary environment variables not configured');
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      return null;
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingProduct) return;

    try {
      setUploadingImage(true);
      const imageUrl = await uploadImageToCloudinary(file);
      
      if (imageUrl) {
        setEditingProduct({
          ...editingProduct,
          cover_image_url: imageUrl,
        });
        setMessage('✅ Image uploaded successfully!');
      } else {
        setMessage('❌ Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage('❌ Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Get category options based on product type
  const getCategoryOptions = (productType: string) => {
    const type = (productType || 'ebook').toLowerCase();
    
    switch (type) {
      case 'ebook':
        return [
          { value: 'Motorcycles', label: 'Motorcycles' },
          { value: 'Finance', label: 'Personal Finance' },
          { value: 'Travel', label: 'Travel' },
          { value: 'Pets', label: 'Pets' },
          { value: 'Beauty & Wellness', label: 'Beauty & Wellness' },
          { value: 'Business', label: 'Business' },
          { value: 'Gadget & Tech', label: 'Gadget & Tech' },
          { value: 'Home & Living', label: 'Home & Living' },
        ];
      case 'zoom_call':
      case 'audit':
        return [
          { value: 'Service', label: 'Service' },
          { value: 'Consultation', label: 'Consultation' },
        ];
      case 'lut':
      case 'template':
      case 'preset':
      default:
        return [
          { value: 'General', label: 'General' },
          { value: 'Speciality', label: 'Speciality' },
        ];
    }
  };

  // Get default category for a product type
  const getDefaultCategory = (productType: string) => {
    const options = getCategoryOptions(productType);
    return options.length > 0 ? options[0].value : '';
  };

  const handleSave = async () => {
    if (!editingProduct) return;

    // Validate required fields
    if (!editingProduct.name || !editingProduct.price_in_rupees || !editingProduct.delivery_link) {
      alert('Please fill in all required fields: name, price, and delivery link');
      return;
    }

    // Check if admin session exists
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      setMessage('Admin session expired. Please log in again.');
      return;
    }

    try {
      setLoading(true);

      if (editingProduct.isNew) {
        // Ensure product_type is lowercase and valid
        const productType = (editingProduct.product_type || 'ebook').toLowerCase().trim();
        const category = (editingProduct.category || 'Ebook').trim();
        
        console.log('📝 Attempting to insert product with:');
        console.log('   name:', editingProduct.name);
        console.log('   price_in_rupees:', editingProduct.price_in_rupees);
        console.log('   product_type:', productType);
        console.log('   category:', category);
        console.log('   delivery_link:', editingProduct.delivery_link);
        
        // Insert new product into Supabase
        const { data, error } = await supabase
          .from('products')
          .insert([
            {
              name: editingProduct.name,
              price_in_rupees: editingProduct.price_in_rupees,
              delivery_link: editingProduct.delivery_link,
              product_type: productType,
              category: category,
              author: editingProduct.author || null,
              cover_image_url: editingProduct.cover_image_url || null,
            },
          ])
          .select();

        if (error) {
          console.error('❌ Failed to insert product:', error);
          console.error('   Error code:', error.code);
          console.error('   Error message:', error.message);
          console.error('   Details:', error.details);
          
          // Provide user-friendly error messages
          if (error.code === 'PGRST301') {
            setMessage('❌ Access denied - RLS policy rejected the request. Ensure you are logged in as an admin.');
          } else if (error.message?.includes('check constraint')) {
            setMessage('❌ Invalid product_type value. Allowed values: ebook, lut, zoom_call, audit, template, consultation. Ensure value matches database constraints.');
          } else if (error.message?.includes('policy')) {
            setMessage('❌ Database policy error. Check your RLS configuration.');
          } else {
            setMessage(`Error saving product: ${error.message}`);
          }
          return;
        }

        if (data && data.length > 0) {
          setProducts([data[0], ...products]);
          setMessage('Product added successfully!');
        }
      } else {
        // Ensure product_type is lowercase and valid
        const productType = (editingProduct.product_type || 'ebook').toLowerCase().trim();
        const category = (editingProduct.category || 'Ebook').trim();
        
        console.log('📝 Attempting to update product with:');
        console.log('   id:', editingProduct.id);
        console.log('   product_type:', productType);
        console.log('   category:', category);
        
        // Update existing product in Supabase
        const { error } = await supabase
          .from('products')
          .update({
            name: editingProduct.name,
            price_in_rupees: editingProduct.price_in_rupees,
            delivery_link: editingProduct.delivery_link,
            product_type: productType,
            category: category,
            author: editingProduct.author || null,
            cover_image_url: editingProduct.cover_image_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingProduct.id);

        if (error) {
          console.error('❌ Failed to update product:', error);
          console.error('   Error code:', error.code);
          console.error('   Error message:', error.message);
          console.error('   Details:', error.details);
          
          if (error.code === 'PGRST301') {
            setMessage('❌ Access denied - RLS policy rejected the request. Ensure you are logged in as an admin.');
          } else if (error.message?.includes('check constraint')) {
            setMessage('❌ Invalid product_type value. Allowed values: ebook, lut, zoom_call, audit, template, consultation. Ensure value matches database constraints.');
          } else if (error.message?.includes('policy')) {
            setMessage('❌ Database policy error. Check your RLS configuration.');
          } else {
            setMessage(`Error updating product: ${error.message}`);
          }
          return;
        }

        // Update local state
        setProducts(
          products.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  name: editingProduct.name,
                  price_in_rupees: editingProduct.price_in_rupees,
                  delivery_link: editingProduct.delivery_link,
                }
              : p
          )
        );
        setMessage('Product updated successfully!');
      }

      setEditingProduct(null);
      setShowForm(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving product:', err);
      setMessage('Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      // Check if admin session exists
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        setMessage('Admin session expired. Please log in again.');
        return;
      }

      try {
        setLoading(true);
        const { error } = await supabase.from('products').delete().eq('id', id);

        if (error) {
          console.error('❌ Failed to delete product:', error);
          console.error('   Error code:', error.code);
          console.error('   Error message:', error.message);
          console.error('   Details:', error.details);
          
          if (error.code === 'PGRST301') {
            setMessage('❌ Access denied - RLS policy rejected the request. Ensure you are logged in as an admin.');
          } else if (error.message?.includes('policy')) {
            setMessage('❌ Database policy error. Check your RLS configuration.');
          } else {
            setMessage(`Error deleting product: ${error.message}`);
          }

          return;
        }

        setProducts(products.filter((p) => p.id !== id));
        setMessage('Product deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        console.error('Error deleting product:', err);
        setMessage('Error deleting product');
      } finally {
        setLoading(false);
      }
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

      {/* Loading indicator */}
      {loading && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
          Loading...
        </div>
      )}

      {/* Controls */}
      {!showForm && (
        <div>
          <button
            onClick={handleAddNew}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Product
          </button>
        </div>
      )}

      {/* Form */}
      {showForm && editingProduct && (
        <div className="bg-white rounded-2xl shadow p-6 border border-slate-200">
          <h3 className="text-xl font-bold mb-6">
            {editingProduct.isNew ? 'Add New Product' : 'Edit Product'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Product Name *</label>
              <input
                type="text"
                value={editingProduct.name}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="e.g., Complete Beginner's Guide to Motorcycling"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Author Name</label>
              <input
                type="text"
                value={editingProduct.author || ''}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, author: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="e.g., John Doe"
              />
              <p className="text-xs text-slate-500 mt-1">
                Shown as &ldquo;by Author&rdquo; on the storefront
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Product Type</label>
              <select
                value={editingProduct.product_type || 'ebook'}
                onChange={(e) => {
                  const newType = e.target.value;
                  // Reset category to default for new product type
                  setEditingProduct({ 
                    ...editingProduct, 
                    product_type: newType,
                    category: getDefaultCategory(newType)
                  });
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="ebook">Ebook</option>
                <option value="lut">LUT (Color Grade)</option>
                <option value="zoom_call">Online Meeting / Consultation</option>
                <option value="audit">Audit</option>
                <option value="template">Template</option>
                <option value="consultation">Consultation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Category (Niche) *</label>
              <select
                value={editingProduct.category || getDefaultCategory(editingProduct.product_type || 'ebook')}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {getCategoryOptions(editingProduct.product_type || 'ebook').map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Price (₹) *</label>
              <input
                type="number"
                value={editingProduct.price_in_rupees}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, price_in_rupees: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Cover Image</label>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-50 cursor-pointer"
                  />
                  {uploadingImage && (
                    <p className="text-xs text-slate-500 mt-2">Uploading...</p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    Select a JPG or PNG image for the product cover
                  </p>
                </div>
                {editingProduct.cover_image_url && (
                  <div className="flex flex-col gap-2 items-center">
                    <img
                      src={editingProduct.cover_image_url}
                      alt="Cover preview"
                      className="w-24 h-24 object-contain bg-gray-50 rounded-md border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditingProduct({ ...editingProduct, cover_image_url: '' })
                      }
                      className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Delivery Link *</label>
              <input
                type="url"
                value={editingProduct.delivery_link}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, delivery_link: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="https://drive.google.com/drive/folders/... or https://..."
              />
              <p className="text-xs text-slate-500 mt-2">
                Paste the meeting link (Zoom, Google Meet, Calendly) or file download link here.
              </p>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              disabled={loading || uploadingImage}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Product
            </button>

            <button
              onClick={() => {
                setShowForm(false);
                setEditingProduct(null);
              }}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-400 disabled:opacity-50 transition-colors"
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
          <h3 className="text-xl font-bold mb-4">Products ({products.length})</h3>

          <div className="grid grid-cols-1 gap-3">
            {products.length === 0 ? (
              <div className="bg-slate-50 rounded-lg p-6 text-center text-slate-500">
                No products yet. Create your first product to get started.
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow p-4 flex items-center justify-between hover:shadow-md transition-shadow border border-slate-100"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{product.name}</h4>
                    <div className="mt-2 flex gap-4 text-xs text-slate-500">
                      <span>Price: ₹{product.price_in_rupees}</span>
                      <span className="text-emerald-600 font-semibold">
                        {product.product_type || 'ebook'} 
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>

                    <button
                      onClick={() => handleDelete(product.id)}
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
