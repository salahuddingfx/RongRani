import React, { useState, useEffect } from 'react';
import { Image, Plus, Edit, Trash2, Eye, EyeOff, Upload, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    link: '',
    image: '',
    isActive: true,
    order: 0
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/banners', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingBanner) {
        await axios.put(`/api/admin/banners/${editingBanner._id}`, formData, config);
        toast.success('Banner updated successfully');
      } else {
        await axios.post('/api/admin/banners', formData, config);
        toast.success('Banner created successfully');
      }

      setShowModal(false);
      setEditingBanner(null);
      setFormData({ title: '', subtitle: '', link: '', image: '', isActive: true, order: 0 });
      fetchBanners();
    } catch {
      toast.error(editingBanner ? 'Failed to update banner' : 'Failed to create banner');
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      link: banner.link || '',
      image: banner.image,
      isActive: banner.isActive,
      order: banner.order || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (bannerId) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/banners/${bannerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Banner deleted successfully');
      fetchBanners();
    } catch {
      toast.error('Failed to delete banner');
    }
  };

  const toggleActive = async (bannerId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/admin/banners/${bannerId}/toggle`, 
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast.success('Banner status updated');
      fetchBanners();
    } catch {
      toast.error('Failed to update banner status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-maroon mx-auto mb-4"></div>
          <p className="text-slate font-medium">Loading banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-maroon to-red-700 bg-clip-text text-transparent mb-2">
            Banner Management
          </h1>
          <p className="text-slate text-lg">Manage homepage banner slides and promotions</p>
        </div>
        <button 
          onClick={() => {
            setEditingBanner(null);
            setFormData({ title: '', subtitle: '', link: '', image: '', isActive: true, order: 0 });
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-maroon to-red-700 text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-maroon to-red-700 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-semibold mb-1">Total Banners</p>
              <h3 className="text-4xl font-black">{banners.length}</h3>
            </div>
            <Image className="h-12 w-12 opacity-30" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-semibold mb-1">Active</p>
              <h3 className="text-4xl font-black">{banners.filter(b => b.isActive).length}</h3>
            </div>
            <Eye className="h-12 w-12 opacity-30" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-500 to-slate-700 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-semibold mb-1">Inactive</p>
              <h3 className="text-4xl font-black">{banners.filter(b => !b.isActive).length}</h3>
            </div>
            <EyeOff className="h-12 w-12 opacity-30" />
          </div>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner._id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-maroon/10 hover:shadow-2xl transition-all">
            <div className="relative h-48 bg-gradient-to-br from-cream to-pink-50">
              {banner.image ? (
                <img 
                  src={banner.image} 
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="h-16 w-16 text-slate/30" />
                </div>
              )}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                banner.isActive 
                  ? 'bg-green-500 text-white' 
                  : 'bg-slate-500 text-white'
              }`}>
                {banner.isActive ? '✓ Active' : '✗ Inactive'}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-maroon mb-2">{banner.title}</h3>
              {banner.subtitle && (
                <p className="text-sm text-slate mb-4">{banner.subtitle}</p>
              )}
              {banner.link && (
                <p className="text-xs text-blue-600 mb-4 truncate">🔗 {banner.link}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate bg-cream px-3 py-1 rounded-full">
                  Order: {banner.order}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleActive(banner._id, banner.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      banner.isActive
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate'
                        : 'bg-green-100 hover:bg-green-200 text-green-600'
                    }`}
                    title={banner.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {banner.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(banner)}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
          <Image className="h-24 w-24 text-slate/30 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-maroon mb-2">No Banners Yet</h3>
          <p className="text-slate mb-6">Create your first banner to display on the homepage</p>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-maroon to-red-700 text-white px-8 py-3 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create First Banner</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-maroon to-red-700 text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-black">
                {editingBanner ? 'Edit Banner' : 'Create New Banner'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-maroon mb-2">Banner Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-maroon/20 rounded-xl focus:outline-none focus:border-maroon text-slate"
                  required
                  placeholder="e.g., Valentine's Day Special"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-maroon mb-2">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-maroon/20 rounded-xl focus:outline-none focus:border-maroon text-slate"
                  placeholder="e.g., Up to 50% off on selected items"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-maroon mb-2">Image URL *</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-maroon/20 rounded-xl focus:outline-none focus:border-maroon text-slate"
                  required
                  placeholder="https://example.com/banner-image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-maroon mb-2">Link URL</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-maroon/20 rounded-xl focus:outline-none focus:border-maroon text-slate"
                  placeholder="/shop?category=Valentine"
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-maroon mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-maroon/20 rounded-xl focus:outline-none focus:border-maroon text-slate"
                    min="0"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <label className="text-sm font-bold text-maroon">Active</label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-6 h-6 text-maroon rounded focus:ring-maroon"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-maroon to-red-700 text-white py-4 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all"
                >
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-200 text-slate py-4 rounded-xl font-bold hover:bg-slate-300 transition-colors"
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

export default AdminBanners;
