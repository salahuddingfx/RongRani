import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Search, Phone, Mail, ArrowLeft, Truck, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

const QuickOrderLookup = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchMethod, setSearchMethod] = useState('phone'); // 'phone', 'email', 'product', 'orderId'
  const [contactValue, setContactValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!contactValue.trim()) {
      toast.error('Please enter your search information');
      return;
    }

    setLoading(true);
    setSearched(true);
    
    try {
      let searchData = {};

      switch (searchMethod) {
        case 'email':
          searchData = { email: contactValue.trim() };
          break;
        case 'phone':
          searchData = { phone: contactValue.trim() };
          break;
        case 'product':
          searchData = { productName: contactValue.trim() };
          break;
        case 'orderId':
          searchData = { orderId: contactValue.trim() };
          break;
        default:
          searchData = { phone: contactValue.trim() };
      }

      const response = await axios.post('/api/orders/search', searchData);

      if (response.data.success && response.data.orders.length > 0) {
        setOrders(response.data.orders);
        toast.success(`Found ${response.data.orders.length} order(s)`);
      } else {
        setOrders([]);
        toast.error('No orders found with this information');
      }
    } catch (error) {
      console.error('Search error:', error);
      setOrders([]);
      const message = error.response?.data?.message || 'Unable to find orders. Please check your information.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'processing': return 'bg-indigo-100 text-indigo-700 border-indigo-300';
      case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
      case 'processing': return <Clock className="h-5 w-5" />;
      case 'shipped': return <Truck className="h-5 w-5" />;
      case 'delivered': return <CheckCircle className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream to-pink-100 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-block p-4 bg-maroon/10 rounded-full mb-4">
            <Search className="h-12 w-12 text-maroon" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-maroon mb-4">
            Track Your Orders
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Find your orders using phone number, email address, product name, or order ID
          </p>
        </div>

        {/* Search Form */}
        <div className="card mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Method Selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchMethod('phone');
                  setContactValue('');
                }}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
                  searchMethod === 'phone'
                    ? 'bg-maroon text-white shadow-md scale-105'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-maroon/30'
                }`}
              >
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Phone</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setSearchMethod('email');
                  setContactValue('');
                }}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
                  searchMethod === 'email'
                    ? 'bg-maroon text-white shadow-md scale-105'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-maroon/30'
                }`}
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Email</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchMethod('product');
                  setContactValue('');
                }}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
                  searchMethod === 'product'
                    ? 'bg-maroon text-white shadow-md scale-105'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-maroon/30'
                }`}
              >
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Product</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchMethod('orderId');
                  setContactValue('');
                }}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
                  searchMethod === 'orderId'
                    ? 'bg-maroon text-white shadow-md scale-105'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-maroon/30'
                }`}
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Order ID</span>
              </button>
            </div>

            {/* Input Field */}
            <div className="relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {searchMethod === 'phone' ? (
                  <Phone className="h-5 w-5 text-slate-400" />
                ) : searchMethod === 'email' ? (
                  <Mail className="h-5 w-5 text-slate-400" />
                ) : searchMethod === 'product' ? (
                  <Package className="h-5 w-5 text-slate-400" />
                ) : (
                  <Search className="h-5 w-5 text-slate-400" />
                )}
              </div>
              <input
                type={searchMethod === 'email' ? 'email' : 'text'}
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={
                  searchMethod === 'phone'
                    ? 'Enter your phone number'
                    : searchMethod === 'email'
                    ? 'Enter your email address'
                    : searchMethod === 'product'
                    ? 'Enter product name'
                    : 'Enter order ID'
                }
                className="input-field w-full pl-12 pr-4 py-4 text-lg border-2 border-slate-200 focus:border-maroon rounded-xl"
                required
                disabled={loading}
              />
            </div>

            {/* Search Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-10 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-3 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Find My Orders</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {searched && !loading && (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {orders.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-maroon mb-4">
                  Your Orders ({orders.length})
                </h2>
                
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="card hover:shadow-xl transition-all cursor-pointer group"
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (searchMethod === 'phone') params.set('phone', contactValue);
                      if (searchMethod === 'email') params.set('email', contactValue);
                      // For product and orderId searches, we don't need additional verification
                      const query = params.toString();
                      navigate(`/track/${order.orderId || order._id}${query ? `?${query}` : ''}`);
                    }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Package className="h-6 w-6 text-maroon" />
                          <h3 className="text-xl font-bold text-maroon">
                            #{order.orderId || order._id}
                          </h3>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDate(order.createdAt)}
                          </span>
                          
                          {order.trackingNumber && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-mono text-xs">
                              {order.trackingNumber}
                            </span>
                          )}
                        </div>

                        {/* Items Preview */}
                        <div className="mt-3 flex items-center gap-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            item.image && (
                              <img
                                key={idx}
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                              />
                            )
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Status & Amount */}
                      <div className="flex flex-col items-end gap-3">
                        <div className={`px-4 py-2 rounded-xl border font-semibold flex items-center gap-2 ${getStatusColor(order.orderStatus)}`}>
                          {getStatusIcon(order.orderStatus)}
                          <span className="capitalize">{order.orderStatus}</span>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-maroon">
                            ৳{order.total.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-500">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-sm">
                      <span className="text-slate-600">
                        Click to view details
                      </span>
                      <ArrowLeft className="h-4 w-4 text-maroon rotate-180 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">
                  No Orders Found
                </h3>
                <p className="text-slate-500">
                  We couldn't find any orders with this contact information
                </p>
              </div>
            )}
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-maroon font-semibold hover:underline transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickOrderLookup;
