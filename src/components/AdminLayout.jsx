import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ScrollRevealManager from './ScrollRevealManager';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/orders', label: 'Orders', icon: '📦' },
    { path: '/admin/products', label: 'Products', icon: '🛍️' },
    { path: '/admin/categories', label: 'Categories', icon: '📂' },
    { path: '/admin/coupons', label: 'Coupons', icon: '🎫' },
    { path: '/admin/banners', label: 'Banners', icon: '📢' },
    { path: '/admin/hot-offer', label: 'Hot Offer', icon: '🔥' },
    { path: '/admin/reviews', label: 'Reviews', icon: '⭐' },
    { path: '/admin/delivery-settings', label: 'Delivery', icon: '🚚' },
    { path: '/admin/reports', label: 'Reports', icon: '📈' },
    { path: '/admin/status', label: 'Status', icon: '🧭' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollRevealManager />
      {/* Admin Header */}
      <header className="bg-maroon text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link to="/admin/dashboard" className="text-2xl font-bold">
                Chirkut ঘর - Admin
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Welcome, {user?.name || 'Admin'}</span>
              <Link
                to="/dashboard"
                className="text-white hover:text-gold transition-colors text-sm"
              >
                User Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Admin Sidebar */}
        <nav className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {adminNavItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-maroon hover:text-white rounded-lg transition-colors"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;