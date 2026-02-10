import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit, Search, Package, Globe, Tag, Settings } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../contexts/socketContextBase';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [stockDrafts, setStockDrafts] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const { socket } = useSocket() || {};
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: '',
    tags: '',
    seoTitle: '',
    seoDescription: ''
  });

  const fetchProducts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.products || response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Use mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get('/api/categories?all=true');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    if (!socket) return;
    const handleRefresh = () => fetchProducts();

    socket.on('product:created', handleRefresh);
    socket.on('product:updated', handleRefresh);
    socket.on('product:deleted', handleRefresh);
    socket.on('inventory:updated', handleRefresh);
    socket.on('category:created', fetchCategories);
    socket.on('category:updated', fetchCategories);
    socket.on('category:deleted', fetchCategories);

    return () => {
      socket.off('product:created', handleRefresh);
      socket.off('product:updated', handleRefresh);
      socket.off('product:deleted', handleRefresh);
      socket.off('inventory:updated', handleRefresh);
      socket.off('category:created', fetchCategories);
      socket.off('category:updated', fetchCategories);
      socket.off('category:deleted', fetchCategories);
    };
  }, [socket, fetchProducts]);

  useEffect(() => {
    if (!socket) return;
    socket.on('category:created', fetchCategories);
    socket.on('category:updated', fetchCategories);
    socket.on('category:deleted', fetchCategories);

    return () => {
      socket.off('category:created', fetchCategories);
      socket.off('category:updated', fetchCategories);
      socket.off('category:deleted', fetchCategories);
    };
  }, [socket, fetchCategories]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleStockChange = (id, value) => {
    setStockDrafts((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleStockUpdate = async (product) => {
    const nextStock = Number(stockDrafts[product._id]);
    if (Number.isNaN(nextStock)) {
      toast.error('Enter a valid stock number');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/products/${product._id}`,
        { stock: nextStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Stock updated');
      fetchProducts();
    } catch {
      toast.error('Failed to update stock');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!formData.images.trim()) {
        toast.error('At least one image URL is required');
        return;
      }
      const productData = {
        ...formData,
        images: formData.images.split(',').map(img => img.trim()),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post('/api/products', productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product added successfully');
      }

      setShowAddModal(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        images: '',
        tags: '',
        seoTitle: '',
        seoDescription: ''
      });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    const imagesValue = (product.images || [])
      .map(img => (typeof img === 'string' ? img : img?.url))
      .filter(Boolean)
      .join(', ');

    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      stock: product.stock ?? '',
      images: imagesValue,
      tags: (product.tags || []).join(', '),
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || ''
    });
    setShowAddModal(true);
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon"></div>
    </div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-maroon flex items-center">
          <Package className="mr-3 h-8 w-8" />
          Manage Products
        </h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              name: '',
              description: '',
              price: '',
              category: '',
              stock: '',
              images: '',
              tags: '',
              seoTitle: '',
              seoDescription: ''
            });
            setShowAddModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate" />
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12 w-full md:w-96"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-maroon text-white">
              <tr>
                <th className="px-6 py-4 text-left">Image</th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">Price</th>
                <th className="px-6 py-4 text-left">Stock</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate/20">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-cream-light transition-colors">
                  <td className="px-6 py-4">
                    <img
                      src={typeof product.images?.[0] === 'string' ? product.images?.[0] : product.images?.[0]?.url || 'https://via.placeholder.com/100'}
                      alt={product.name}
                      className="h-16 w-16 object-cover rounded-lg shadow-soft"
                    />
                  </td>
                  <td className="px-6 py-4 font-semibold text-charcoal">{product.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-maroon/10 text-maroon rounded-full text-sm font-medium">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-maroon">৳{product.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {product.stock}
                      </span>
                      <input
                        type="number"
                        className="w-20 px-3 py-2 border border-slate/20 rounded-lg text-sm"
                        value={stockDrafts[product._id] ?? product.stock}
                        onChange={(e) => handleStockChange(product._id, e.target.value)}
                      />
                      <button
                        onClick={() => handleStockUpdate(product)}
                        className="px-3 py-2 bg-maroon text-white rounded-lg text-xs font-semibold hover:bg-maroon-light"
                      >
                        Update
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-3">
                      <button
                        className="p-2 hover:bg-maroon/10 rounded-lg transition-colors"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-5 w-5 text-maroon" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-maroon">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                }}
                className="text-slate hover:text-maroon"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate mb-2">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="Handmade Pottery Vase"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate mb-2">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field w-full"
                  rows="3"
                  placeholder="Beautiful handcrafted pottery..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">Price (৳)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field w-full"
                    placeholder="1500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="input-field w-full"
                    placeholder="25"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate mb-2">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate mb-2">
                  Product Images (Multiple URLs)
                  <span className="text-xs font-normal text-slate-500 ml-2">
                    💡 Separate multiple image URLs with commas
                  </span>
                </label>
                <textarea
                  required
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="input-field w-full"
                  rows="3"
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg, https://example.com/image3.jpg"
                />
                <p className="text-xs text-slate-500 mt-1">
                  📌 First image will be the main product image. You can add up to 5 images.
                </p>
              </div>

              <div className="border-t border-slate/10 pt-6 mt-6">
                <h3 className="text-xl font-bold text-maroon mb-6 flex items-center space-x-2">
                  <Settings className="h-6 w-6" />
                  <span>SEO & Search Optimization</span>
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate mb-2">
                      <Tag className="h-4 w-4 mr-2 text-maroon" />
                      Search Tags (Keywords)
                      <span className="text-xs font-normal text-slate-500 ml-2">
                        💡 Separate with commas (e.g., gift, handmade, birthday)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="input-field w-full"
                      placeholder="gift, surprise, handmade, pottery"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center text-sm font-semibold text-slate mb-2">
                        <Globe className="h-4 w-4 mr-2 text-maroon" />
                        SEO Title
                      </label>
                      <input
                        type="text"
                        value={formData.seoTitle}
                        onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                        className="input-field w-full"
                        placeholder="Premium Handmade Pottery Vase"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-semibold text-slate mb-2">
                        <Search className="h-4 w-4 mr-2 text-maroon" />
                        SEO Description
                      </label>
                      <textarea
                        value={formData.seoDescription}
                        onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                        className="input-field w-full"
                        rows="2"
                        placeholder="Best handcrafted pottery in Bangladesh with free shipping..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
