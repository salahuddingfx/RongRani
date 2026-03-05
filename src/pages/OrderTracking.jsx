import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, MapPin, Calendar, DollarSign, ArrowLeft, Phone, Mail, Download, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

import { useSocket } from '../contexts/socketContextBase';
import ReviewForm from '../components/ReviewForm';

const OrderTracking = () => {
  const { t } = useLanguage();
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingInput, setTrackingInput] = useState(orderId || '');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [error, setError] = useState('');

  const { socket } = useSocket();
  const [reviewingProductId, setReviewingProductId] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!socket || !order) return;

    // Listen for order updates
    socket.on('order:updated', (updatedOrder) => {
      if (updatedOrder._id === order._id) {
        setOrder(prev => ({ ...prev, ...updatedOrder }));
      }
    });

    socket.on('order:sent-to-courier', (data) => {
      if (data._id === order._id) {
        // Re-fetch to get full courier info or manually merge
        fetchOrder(order._id, contactEmail, contactPhone);
      }
    });

    return () => {
      socket.off('order:updated');
      socket.off('order:sent-to-courier');
    };
  }, [socket, order, contactEmail, contactPhone]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    const phoneParam = params.get('phone');
    if (emailParam) setContactEmail(emailParam);
    if (phoneParam) setContactPhone(phoneParam);

    if (orderId) {
      fetchOrder(orderId, emailParam, phoneParam);
    } else {
      setLoading(false);
    }
  }, [orderId, location.search]);

  const fetchOrder = async (id, email, phone) => {
    try {
      setError('');
      // const token = localStorage.getItem('token'); // Optional for public tracking
      const response = await axios.get(`/api/orders/track/${id}`, {
        params: {
          email: email || undefined,
          phone: phone || undefined,
        },
        // headers: token ? { Authorization: `Bearer ${token}` } : {}, // Remove auth requirement for better public tracking if API allows
      });
      setOrder(response.data);
    } catch (err) {
      setOrder(null);
      const message = err.response?.data?.message || 'Unable to track this order';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;

    const params = new URLSearchParams();
    if (contactEmail.trim()) params.set('email', contactEmail.trim());
    if (contactPhone.trim()) params.set('phone', contactPhone.trim());

    const query = params.toString();
    navigate(`/track/${trackingInput.trim()}${query ? `?${query}` : ''}`);
  };

  const handleDownloadInvoice = async (e) => {
    e.preventDefault();
    if (!order?._id) return;

    try {
      setDownloading(true);
      const response = await axios.get(`/api/orders/${order._id}/invoice`, {
        params: {
          email: contactEmail || undefined,
          phone: contactPhone || undefined,
        },
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });

      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${order.orderId || order._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Invoice downloaded successfully', { id: 'download-success' });
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Failed to download invoice. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'processing': return 'bg-indigo-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-slate';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
      case 'confirmed': return <Package className="h-7 w-7" />;
      case 'processing': return <Package className="h-7 w-7" />;
      case 'shipped': return <Truck className="h-7 w-7" />;
      case 'delivered': return <CheckCircle className="h-7 w-7" />;
      default: return <Package className="h-7 w-7" />;
    }
  };

  const buildTrackingHistory = (orderData) => {
    const statusRank = {
      pending: 1,
      processing: 2,
      shipped: 3,
      delivered: 4,
      cancelled: 0,
      returned: 0,
    };

    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentRank = statusRank[orderData.orderStatus] || 1;

    return steps.map((status) => {
      const completed = statusRank[status] <= currentRank && currentRank > 0;
      let timestamp = null;

      if (status === 'pending') timestamp = orderData.createdAt;
      if (status === 'shipped') timestamp = orderData.courierInfo?.sentAt || null;
      if (status === 'delivered') timestamp = orderData.deliveredAt || null;

      return {
        status,
        message:
          status === 'pending' ? 'Order placed successfully' :
            status === 'processing' ? 'Preparing your order' :
              status === 'shipped' ? 'Handed over to courier' :
                'Delivered successfully',
        timestamp,
        completed,
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-maroon"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-pink-50 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card text-center">
            <Package className="h-20 w-20 text-maroon mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-maroon mb-4">Track Order</h1>
            <p className="text-slate mb-8">Track your order using order number and contact information</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleTrack} className="max-w-md mx-auto">
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="Enter Order ID"
                    className="input-field w-full pl-5 py-4 text-lg"
                    required
                  />
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Email used in order"
                    className="input-field w-full pl-5 py-3"
                  />
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Phone used in order"
                    className="input-field w-full pl-5 py-3"
                  />
                </div>
                <button type="submit" className="btn-primary w-full py-3">
                  Track Order
                </button>
              </div>
            </form>

            <div className="mt-12 pt-8 border-t border-slate/20">
              <Link to="/" className="text-maroon font-semibold hover:underline flex items-center justify-center space-x-2">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const contactInfo = order.user || order.guestInfo || {};
  const shipping = order.shippingAddress || {};
  const trackingHistory = buildTrackingHistory(order);
  const lastUpdated = trackingHistory.filter(h => h.timestamp).pop()?.timestamp || order.createdAt;
  const estimatedDelivery = order.deliveredAt || new Date(new Date(order.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000).toISOString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream to-pink-100 py-12 px-4 transition-all duration-500">
      <div className="max-w-6xl mx-auto">
        {/* Header with Animation */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-maroon tracking-tight">
              Order #{order.orderId || order._id}
            </h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Tracking
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Invoice Download Button */}
            <button
              onClick={handleDownloadInvoice}
              disabled={downloading}
              className="flex items-center justify-center gap-2 bg-white border border-maroon/20 text-maroon px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <div className="w-5 h-5 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              <span>{downloading ? 'Downloading...' : 'Download Invoice'}</span>
            </button>

            <a href="tel:+8801851075537" className="flex items-center justify-center gap-2 bg-maroon text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-maroon/20 hover:shadow-xl hover:scale-105 transition-all whitespace-nowrap">
              <Phone className="h-5 w-5 animate-wiggle" />
              <span>Need Help?</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tracking Timeline */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Card with Glassmorphism */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl animate-scale-up">
              <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">Status Timeline</h2>
                  <p className="text-slate-500 text-sm">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
                </div>
                <div className={`${getStatusColor(order.orderStatus)} text-white px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wide shadow-lg animate-pulse`}>
                  {order.orderStatus}
                </div>
              </div>

              {/* Enhanced animated Timeline */}
              <div className="relative pl-4 space-y-12 before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-1 before:bg-gray-100">
                {/* Active Line Animation */}
                <div
                  className="absolute left-[27px] top-2 w-1 bg-gradient-to-b from-maroon to-pink-500 transition-all duration-1000 ease-out rounded-full"
                  style={{
                    height: `${Math.min(((trackingHistory.findIndex(h => h.status === order.orderStatus) + 1) / trackingHistory.length) * 100, 100)}%`
                  }}
                ></div>

                {trackingHistory.map((history, index) => {
                  const isActive = history.completed;
                  const isCurrent = history.status === order.orderStatus;

                  return (
                    <div key={index} className={`relative flex items-start group ${isActive ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                      {/* Animated Dot */}
                      <div className={`
                        relative z-10 flex items-center justify-center w-14 h-14 rounded-full border-4 border-white shadow-lg transition-all duration-500
                        ${isActive ? 'bg-gradient-to-br from-maroon to-pink-600 scale-110' : 'bg-gray-100'}
                        ${isCurrent ? 'ring-4 ring-pink-200 animate-bounce-slow' : ''}
                      `}>
                        {isActive ? (
                          getStatusIcon(history.status)
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                        )}
                      </div>

                      <div className="ml-6 pt-2 transition-all duration-500 group-hover:translate-x-2">
                        <h3 className={`text-lg font-bold ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                          {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                        </h3>
                        <p className={`text-sm mt-1 ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                          {history.message}
                        </p>
                        {history.timestamp && (
                          <span className="inline-block mt-2 text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-500 rounded-md">
                            {new Date(history.timestamp).toLocaleString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items Card */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Package className="text-maroon" />
                <span>Package Contents</span>
                <span className="text-sm font-normal text-gray-400 ml-auto">{order.items.length} items</span>
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl hover:bg-pink-50/50 border border-transparent hover:border-pink-100 transition-all duration-300">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={item.product?.images?.[0] || item.image || 'https://via.placeholder.com/100'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Link to={`/product/${item.product?.slug || item.product?._id || item.product}`} className="font-bold text-gray-800 hover:text-maroon transition-colors line-clamp-1 block">
                        {item.product?.name || item.name}
                      </Link>
                      <p className="text-slate-400 text-sm mt-1">Qty: <span className="text-gray-800 font-semibold">{item.quantity}</span></p>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                      <p className="font-bold text-maroon text-lg">৳{(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-xs text-slate-400">৳{item.price.toLocaleString()} / unit</p>
                    </div>

                    {order.orderStatus === 'delivered' && (
                      <button
                        onClick={() => setReviewingProductId(item.product?._id || item.product)}
                        className="w-full sm:w-auto mt-2 sm:mt-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center gap-2 text-sm font-bold text-maroon bg-white border border-maroon hover:bg-maroon hover:text-white px-4 py-2 rounded-xl transition-all shadow-sm"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Review</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Details */}
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {/* Customer Info Card */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-500" />
                </div>
                Customer Details
              </h2>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3">
                  <Phone className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Phone Number</p>
                    <p className="font-semibold text-slate-700">{contactInfo.phone || shipping.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Email</p>
                    <p className="font-semibold text-slate-700 truncate max-w-[200px]">{contactInfo.email || shipping.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Card */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-orange-500" />
                </div>
                Delivery Address
              </h2>
              <div className="pl-2 border-l-2 border-dashed border-gray-200">
                <p className="font-bold text-gray-800 mb-1">{shipping.name}</p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {shipping.street && <span className="block">{shipping.street}</span>}
                  {shipping.subDistrict && <span>{shipping.subDistrict}, </span>}
                  {shipping.district} - {shipping.postalCode}<br />
                  <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-500 mt-1 inline-block">
                    {shipping.country}
                  </span>
                </p>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="bg-gradient-to-br from-maroon to-pink-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2 opacity-80">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium text-sm">Estimated Delivery</span>
                </div>
                <p className="text-3xl font-black tracking-tight">
                  {new Date(estimatedDelivery).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </p>
                <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center text-sm">
                  <span>Courier Partner</span>
                  <span className="font-bold bg-white/20 px-2 py-1 rounded">Steadfast</span>
                </div>
              </div>
            </div>

            {/* Courier Tracking */}
            {order.courierInfo?.trackingCode && (
              <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-blue-500" />
                  </div>
                  Courier Tracking
                </h2>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-600">Tracking Number</span>
                      <span className="font-mono text-sm bg-white px-2 py-1 rounded border">{order.courierInfo.trackingCode}</span>
                    </div>
                    {order.courierInfo.consignmentId && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-600">Consignment ID</span>
                        <span className="font-mono text-sm bg-white px-2 py-1 rounded border">{order.courierInfo.consignmentId}</span>
                      </div>
                    )}
                  </div>
                  <a
                    href={`https://steadfast.com.bd/t/${order.courierInfo.trackingCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-maroon text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <Truck className="h-5 w-5" />
                    <span>Track on Courier Website</span>
                  </a>
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-500" />
                </div>
                Payment Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-500">Method</span>
                  <span className="font-bold text-gray-800 uppercase flex items-center gap-2">
                    {order.paymentMethod === 'cod' ? 'Cash On Delivery' : order.paymentMethod}
                    {order.paymentMethod === 'cod' && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Payment pending on delivery"></span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {order.paymentStatus}
                  </span>
                </div>

                <div className="pt-4 mt-2 border-t border-dashed border-gray-200 flex justify-between items-end">
                  <span className="text-sm font-bold text-gray-400">Total Amount</span>
                  <span className="text-2xl font-black text-maroon">৳{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation at Bottom */}
        <div className="mt-12 pt-8 border-t border-slate/20">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link to="/dashboard" className="text-maroon/70 font-semibold hover:text-maroon hover:underline flex items-center space-x-2 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Orders</span>
            </Link>
            <Link to="/quick-track" className="text-maroon/70 font-semibold hover:text-maroon hover:underline flex items-center space-x-2 transition-colors">
              <Search className="h-4 w-4" />
              <span>Search Other Orders</span>
            </Link>
            <Link to="/" className="text-maroon/70 font-semibold hover:text-maroon hover:underline flex items-center space-x-2 transition-colors">
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewingProductId && (
        <ReviewForm
          productId={reviewingProductId}
          initialGuestEmail={contactEmail || order.guestInfo?.email}
          initialOrderId={order._id}
          onClose={() => setReviewingProductId(null)}
          onReviewSubmitted={() => {
            toast.success('Thank you for your review!', {
              icon: '💖',
              style: { borderRadius: '10px', background: '#FFF0F5', color: '#BE123C' }
            });
          }}
        />
      )}
    </div>
  );
};

export default OrderTracking;
