import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Package, Heart, Settings, LogOut, Edit2, Save, X, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  // Update profileData when user object changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address?.street || (typeof user.address === 'string' ? user.address : '')
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(profileData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const ProfileField = ({ label, value, icon: Icon, full = false }) => (
    <div className={`p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50 transition-all hover:border-maroon/20 group/field ${full ? 'w-full' : ''}`}>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-400 group-hover/field:text-maroon transition-colors">
          <Icon size={16} />
        </div>
        <p className="font-bold text-slate-700 dark:text-slate-200 truncate">
          {value || <span className="text-slate-300 dark:text-slate-600 italic font-medium">Not provided</span>}
        </p>
      </div>
    </div>
  );

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
  };

  const formatAddress = (addr) => {
    if (!addr) return 'Not provided';
    if (typeof addr === 'string') return addr;
    const parts = [
      addr.street,
      addr.union,
      addr.subDistrict,
      addr.city,
      addr.district,
      addr.division
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  };

  // Mock data
  const orders = useMemo(() => [
    {
      id: '1',
      date: '2024-01-15',
      status: 'Delivered',
      total: 2500,
      items: ['Saree', 'Jewelry']
    }
  ], []);

  const wishlist = useMemo(() => [
    {
      id: '1',
      name: 'Beautiful Saree',
      price: 1500,
      image: '/placeholder.jpg'
    }
  ], []);

  return (
    <div className="min-h-screen bg-[#FFFBFB] dark:bg-slate-900 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-[35px] shadow-premium p-8 border border-maroon/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
              
              <div className="text-center mb-10 relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-maroon to-[#6A112B] rounded-[30px] flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3 transition-transform hover:rotate-0 duration-300">
                  <User className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{user?.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium italic mt-1">@{user?.username || 'member'}</p>
                
                <div className="mt-4 flex justify-center gap-2">
                   <span className="px-3 py-1 bg-maroon/10 text-maroon text-[10px] font-black uppercase tracking-widest rounded-full border border-maroon/20">
                     {user?.role}
                   </span>
                   {user?.isTwoFactorEnabled && (
                     <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200 flex items-center gap-1">
                       <ShieldCheck size={10} /> Verified
                     </span>
                   )}
                </div>
              </div>

              <nav className="space-y-3 relative z-10">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all duration-300 ${
                        activeTab === item.id
                          ? 'bg-maroon text-white shadow-lg shadow-maroon/20 scale-[1.02]'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
                      <span className="tracking-tight">{item.label}</span>
                    </button>
                  );
                })}

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 font-black hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 group/btn"
                  >
                    <LogOut className="h-5 w-5 transition-transform group-hover/btn:-translate-x-1" />
                    <span className="tracking-tight">Logout</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-[40px] shadow-premium p-10 border border-maroon/5 min-h-[600px]">
              {activeTab === 'profile' && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Profile Information</h2>
                      <p className="text-slate-500 font-medium mt-1">Manage your personal details and contact info.</p>
                    </div>
                    {!isEditing ? (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-2xl font-black hover:bg-maroon hover:text-white transition-all duration-300 shadow-sm"
                      >
                        <Edit2 size={18} />
                        Edit Profile
                      </button>
                    ) : (
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 text-slate-400 hover:text-maroon font-black transition-colors"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <ProfileField label="Full Name" value={user?.name} icon={User} />
                      <ProfileField label="Email Address" value={user?.email} icon={Settings} />
                      <ProfileField label="Username" value={user?.username} icon={Settings} />
                      <ProfileField label="Phone Number" value={user?.phone || 'Not provided'} icon={Phone} />
                      <div className="md:col-span-2">
                        <ProfileField label="Primary Address" value={formatAddress(user?.address)} icon={MapPin} full />
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleProfileUpdate} className="space-y-8 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">Full Name</label>
                          <input
                            type="text"
                            name="name"
                            value={profileData.name}
                            onChange={handleChange}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-700 focus:border-maroon focus:ring-0 transition-all font-bold"
                            placeholder="Your Name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">Phone Number</label>
                          <input
                            type="text"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleChange}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-700 focus:border-maroon focus:ring-0 transition-all font-bold"
                            placeholder="017XXXXXXXX"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">Primary Address</label>
                          <textarea
                            name="address"
                            value={profileData.address}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-700 focus:border-maroon focus:ring-0 transition-all font-bold resize-none"
                            placeholder="Your full delivery address..."
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex items-center gap-3 bg-maroon text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-maroon/20 hover:bg-[#701e2a] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                        >
                          {loading ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-4 border-white/30 border-t-white"></div>
                          ) : (
                            <>
                              <Save size={22} />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">My Orders</h2>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-white/30 dark:border-gray-600/30 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-semibold">Order #{order.id}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">৳{order.total}</p>
                            <span className={`px-2 py-1 rounded text-sm ${
                              order.status === 'Delivered'
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                                : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Items: {order.items.join(', ')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No orders found.</p>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
                {wishlist.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wishlist.map((item) => (
                      <div key={item.id} className="border border-white/30 dark:border-gray-600/30 rounded-lg p-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                        <h3 className="font-semibold mb-2">{item.name}</h3>
                        <p className="text-maroon font-semibold">৳{item.price}</p>
                        <div className="flex space-x-2 mt-3">
                          <Link
                            to={`/product/${item.slug || item.id}`}
                            className="bg-maroon text-white px-4 py-2 rounded hover:bg-maroon/80 transition-colors text-sm"
                          >
                            View Product
                          </Link>
                          <button className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">Your wishlist is empty.</p>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Current Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 rounded-2xl bg-white/20 dark:bg-gray-700/20 border border-white/30 dark:border-gray-600/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">New Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 rounded-2xl bg-white/20 dark:bg-gray-700/20 border border-white/30 dark:border-gray-600/30"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-maroon text-white px-6 py-2 rounded hover:bg-maroon/80 transition-colors"
                      >
                        Update Password
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default Dashboard;