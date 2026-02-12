import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, MapPin, Calendar, DollarSign, ArrowLeft, Phone, Mail } from 'lucide-react';
import axios from 'axios';

import io from 'socket.io-client';

const OrderTracking = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingInput, setTrackingInput] = useState(orderId || '');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize Socket
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

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
      const token = localStorage.getItem('token'); // Optional for public tracking
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
            status === 'processing' ? 'We are preparing your order' :
              status === 'shipped' ? 'Handed to courier for delivery' :
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
            <h1 className="text-3xl font-bold text-maroon mb-4">Track Your Order</h1>
            <p className="text-slate mb-8">Enter your order ID to track your beautiful gifts</p>

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
                  Track
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
    <div className="min-h-screen bg-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link to="/dashboard" className="text-maroon font-semibold hover:underline flex items-center space-x-2 mb-4">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Orders</span>
          </Link>
          <h1 className="text-4xl font-bold text-maroon">Track Order #{order._id}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tracking Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-charcoal mb-2">Order Status</h2>
                  <p className="text-slate">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
                </div>
                <div className={`${getStatusColor(order.orderStatus)} text-white px-6 py-3 rounded-xl font-bold text-lg capitalize shadow-lg`}>
                  {order.orderStatus}
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                {trackingHistory.map((history, index) => (
                  <div key={index} className="flex items-start mb-8 last:mb-0">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-14 h-14 rounded-full ${history.completed ? getStatusColor(history.status) : 'bg-slate/20'} flex items-center justify-center text-white relative z-10 shadow-lg`}>
                      {history.completed ? (
                        getStatusIcon(history.status)
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                      )}
                    </div>

                    {/* Line */}
                    {index < trackingHistory.length - 1 && (
                      <div className={`absolute left-7 top-14 w-0.5 h-16 ${history.completed ? 'bg-maroon' : 'bg-slate/20'}`}></div>
                    )}

                    {/* Content */}
                    <div className="ml-6 flex-1">
                      <h3 className={`text-lg font-bold ${history.completed ? 'text-charcoal' : 'text-slate'} capitalize`}>
                        {history.status}
                      </h3>
                      <p className={`${history.completed ? 'text-slate' : 'text-slate/50'} mb-1`}>
                        {history.message}
                      </p>
                      {history.timestamp && (
                        <p className="text-sm text-slate/70">
                          {new Date(history.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Items Card */}
            <div className="card">
              <h2 className="text-2xl font-bold text-maroon mb-6 flex items-center">
                <Package className="mr-3 h-7 w-7" />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-cream-light rounded-xl">
                    <img
                      src={item.product?.images?.[0] || item.image || 'https://via.placeholder.com/100'}
                      alt={item.product?.name || item.name}
                      className="w-20 h-20 object-cover rounded-lg shadow-soft"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-charcoal">{item.product?.name || item.name}</h3>
                      <p className="text-slate text-sm">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-maroon text-lg">৳{item.price * item.quantity}</p>
                      <p className="text-sm text-slate">৳{item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Details */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="card">
              <h2 className="text-xl font-bold text-maroon mb-4">Customer Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-maroon mt-0.5" />
                  <div>
                    <p className="text-slate">Phone</p>
                    <p className="font-semibold text-charcoal">{contactInfo.phone || shipping.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-maroon mt-0.5" />
                  <div>
                    <p className="text-slate">Email</p>
                    <p className="font-semibold text-charcoal">{contactInfo.email || shipping.email || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card">
              <h2 className="text-xl font-bold text-maroon mb-4 flex items-center">
                <MapPin className="mr-2 h-6 w-6" />
                Delivery Address
              </h2>
              <div className="text-sm text-charcoal leading-relaxed">
                <p className="font-semibold">{contactInfo.name || 'Customer'}</p>
                <p>{shipping.street}</p>
                <p>{shipping.union}</p>
                <p>{shipping.subDistrict}</p>
                <p>{shipping.district}, {shipping.division}</p>
                <p>{shipping.city} - {shipping.postalCode || shipping.zipCode}</p>
                <p>{shipping.country}</p>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="card bg-maroon text-white">
              <div className="flex items-center space-x-3 mb-3">
                <Calendar className="h-6 w-6" />
                <h2 className="text-lg font-bold">Estimated Delivery</h2>
              </div>
              <p className="text-2xl font-bold">
                {new Date(estimatedDelivery).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Payment Info */}
            <div className="card">
              <h2 className="text-xl font-bold text-maroon mb-4 flex items-center">
                <DollarSign className="mr-2 h-6 w-6" />
                Payment Details
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate">Method</span>
                  <span className="font-semibold text-charcoal uppercase">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate/20">
                  <span className="font-bold text-charcoal">Total</span>
                  <span className="font-bold text-maroon text-xl">৳{order.total}</span>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="card bg-cream-light">
              <h3 className="font-bold text-charcoal mb-2">Need Help?</h3>
              <p className="text-sm text-slate mb-4">Contact our support team for any queries</p>
              <div className="space-y-2 text-sm">
                <a href="tel:+8801851075537" className="flex items-center space-x-2 text-maroon hover:underline">
                  <Phone className="h-4 w-4" />
                  <span>+880 18510-75537</span>
                </a>
                <a href="mailto:info.rongrani@gmail.com" className="flex items-center space-x-2 text-maroon hover:underline">
                  <Mail className="h-4 w-4" />
                  <span>info.rongrani@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
