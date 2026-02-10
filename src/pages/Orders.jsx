import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, XCircle, Eye, Search, Download, LogIn } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const Orders = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [guestOrderNumber, setGuestOrderNumber] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const trackGuestOrder = async (e) => {
    e.preventDefault();
    if (!guestOrderNumber || !guestEmail) {
      toast.error('Please enter both order number and email');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/orders/track-guest', {
        orderNumber: guestOrderNumber,
        email: guestEmail
      });

      if (response.data) {
        navigate(`/track/${response.data._id}`);
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      toast.error('Order not found. Please check your order number and email.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Invoice download error:', error);
      toast.error('Failed to download invoice');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'processing': return <Package className="h-5 w-5" />;
      case 'shipped': return <Truck className="h-5 w-5" />;
      case 'delivered': return <CheckCircle className="h-5 w-5" />;
      case 'cancelled': return <XCircle className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const filteredOrders = orders.filter(order =>
    order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Guest User View - Order Tracking Form
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-cream py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card rounded-3xl p-8 md:p-12 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <Package className="h-16 w-16 text-maroon mx-auto mb-4" />
              <h1 className="text-3xl md:text-4xl font-black text-maroon mb-2">
                {t('track_order')}
              </h1>
              <p className="text-slate-600">
                {t('language') === 'bn'
                  ? 'আপনার অর্ডার নম্বর এবং ইমেইল দিয়ে অর্ডার ট্র্যাক করুন'
                  : 'Track your order using order number and email'}
              </p>
            </div>

            {/* Guest Tracking Form */}
            <form onSubmit={trackGuestOrder} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  {t('order_number')}
                </label>
                <input
                  type="text"
                  value={guestOrderNumber}
                  onChange={(e) => setGuestOrderNumber(e.target.value)}
                  placeholder={t('language') === 'bn' ? 'অর্ডার নম্বর লিখুন' : 'Enter order number'}
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder={t('language') === 'bn' ? 'ইমেইল লিখুন' : 'Enter email address'}
                  className="input-field w-full"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-lg disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    {t('loading')}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Search className="h-5 w-5" />
                    {t('track_order')}
                  </span>
                )}
              </button>
            </form>

            {/* Login Prompt */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <p className="text-center text-slate-600 mb-4">
                {t('language') === 'bn'
                  ? 'আপনার একাউন্ট আছে?'
                  : 'Have an account?'}
              </p>
              <Link
                to="/login"
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <LogIn className="h-5 w-5" />
                {t('sign_in')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged-in User View
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-maroon mx-auto mb-4" />
          <p className="text-slate-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-cream py-8 px-4 reveal-fade">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 reveal-left">
          <h1 className="text-3xl md:text-4xl font-black text-maroon mb-2">
            {t('my_orders')}
          </h1>
          <p className="text-slate-600">
            {t('language') === 'bn'
              ? 'আপনার সুন্দর উপহার অর্ডারগুলি ট্র্যাক এবং পরিচালনা করুন'
              : 'Track and manage your beautiful gift orders'}
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 reveal-right">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder={t('language') === 'bn' ? 'অর্ডার আইডি দিয়ে খুঁজুন...' : 'Search by order ID...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 w-full"
            />
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="card rounded-3xl text-center py-16 reveal-up">
            <Package className="h-20 w-20 text-slate-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-charcoal mb-2">
              {t('language') === 'bn' ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No Orders Found'}
            </h3>
            <p className="text-slate-600 mb-8">
              {t('language') === 'bn'
                ? 'কেনাকাটা শুরু করুন এবং আপনার প্রথম অর্ডার তৈরি করুন!'
                : 'Start shopping and create your first order!'}
            </p>
            <Link to="/shop" className="btn-primary">
              {t('language') === 'bn' ? 'পণ্য ব্রাউজ করুন' : 'Browse Products'}
            </Link>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {filteredOrders.map((order, index) => (
              <div
                key={order._id}
                className="card rounded-3xl hover:shadow-2xl transition-all duration-300 reveal-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 md:gap-6">
                  {/* Left - Order Info */}
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                      <h3 className="text-xl md:text-2xl font-bold text-maroon">
                        #{order.orderNumber || order._id}
                      </h3>
                      <span className={`px-3 py-1.5 rounded-xl text-xs md:text-sm font-semibold border-2 flex items-center gap-2 w-fit ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-2 md:space-y-3 mb-4">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 md:gap-4">
                          <img
                            src={item.product?.images?.[0] || 'https://via.placeholder.com/100'}
                            alt={item.product?.name}
                            className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg shadow-md flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-charcoal text-sm md:text-base truncate">
                              {item.product?.name}
                            </p>
                            <p className="text-xs md:text-sm text-slate-600">
                              {t('language') === 'bn' ? 'পরিমাণ' : 'Qty'}: {item.quantity} × ৳{item.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Dates */}
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-slate-600">
                      <div>
                        <span className="font-semibold">
                          {t('language') === 'bn' ? 'অর্ডার করা হয়েছে:' : 'Ordered:'}
                        </span>{' '}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      {order.estimatedDelivery && (
                        <div>
                          <span className="font-semibold">
                            {t('language') === 'bn' ? 'ডেলিভারি:' : 'Delivery:'}
                          </span>{' '}
                          {new Date(order.estimatedDelivery).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right - Amount & Actions */}
                  <div className="flex flex-col sm:items-end gap-3 md:gap-4 w-full sm:w-auto lg:border-l-2 lg:border-slate-200 lg:pl-8">
                    <div className="text-left sm:text-right">
                      <p className="text-xs md:text-sm text-slate-600 mb-1">
                        {t('language') === 'bn' ? 'মোট পরিমাণ' : 'Total Amount'}
                      </p>
                      <p className="text-2xl md:text-3xl font-black text-maroon">
                        ৳{order.totalAmount?.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                      <Link
                        to={`/track/${order._id}`}
                        className="btn-primary flex items-center justify-center gap-2 py-2 md:py-3 text-sm md:text-base"
                      >
                        <Eye className="h-4 md:h-5 w-4 md:w-5" />
                        <span>{t('language') === 'bn' ? 'ট্র্যাক করুন' : 'Track'}</span>
                      </Link>

                      <button
                        onClick={() => handleDownloadInvoice(order._id)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                      >
                        <Download className="h-4 md:h-5 w-4 md:w-5" />
                        <span>{t('language') === 'bn' ? 'ইনভয়েস' : 'Invoice'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
