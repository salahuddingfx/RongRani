import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Package, Heart, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

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

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-maroon rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold">{user?.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-maroon text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-700/20'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-4"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-lg p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <p className="text-gray-600 dark:text-gray-400">{user?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <p className="text-gray-600 dark:text-gray-400">
                      {user?.phone?.primary || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Role</label>
                    <p className="text-gray-600 dark:text-gray-400 capitalize">{user?.role}</p>
                  </div>
                </div>
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
                            to={`/product/${item.id}`}
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
                          className="w-full px-4 py-2 rounded bg-white/20 dark:bg-gray-700/20 border border-white/30 dark:border-gray-600/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">New Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 rounded bg-white/20 dark:bg-gray-700/20 border border-white/30 dark:border-gray-600/30"
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
  );
};

export default Dashboard;