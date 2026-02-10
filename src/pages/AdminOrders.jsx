import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Search, Eye, CheckCircle, XCircle, Clock, Truck } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../contexts/socketContextBase';
import CourierDetailsModal from '../components/CourierDetailsModal';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courierModalOpen, setCourierModalOpen] = useState(false);
  const [courierOrder, setCourierOrder] = useState(null);
  const [courierForm, setCourierForm] = useState({
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    alternatePhone: '',
    addressLine: '',
    union: '',
    subDistrict: '',
    district: '',
    division: '',
    city: '',
    postalCode: '',
    itemDescription: '',
    weightKg: '',
    deliveryType: 'home',
    parcelValue: '',
    codAmount: '',
    invoice: '',
    note: '',
  });
  const { socket } = useSocket() || {};

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: statusFilter !== 'all' ? statusFilter : undefined }
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!socket) return;
    const handleRefresh = () => fetchOrders();

    socket.on('order:new', handleRefresh);
    socket.on('order:updated', handleRefresh);
    socket.on('order:deleted', handleRefresh);
    socket.on('order:sent-to-courier', handleRefresh);

    return () => {
      socket.off('order:new', handleRefresh);
      socket.off('order:updated', handleRefresh);
      socket.off('order:deleted', handleRefresh);
      socket.off('order:sent-to-courier', handleRefresh);
    };
  }, [socket, fetchOrders]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/admin/orders/${orderId}`, {
        orderStatus: newStatus
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch {
      toast.error('Failed to update order status');
    }
  };

  const sendToCourier = async (orderId, details) => {
    const loadingToast = toast.loading('Sending to courier...');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/admin/orders/${orderId}/send-to-courier`,
        { courierDetails: details },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message || 'Order sent to courier successfully!', {
        id: loadingToast,
        duration: 5000,
      });

      if (response.data.courierInfo?.trackingCode) {
        toast.success(
          `Tracking Code: ${response.data.courierInfo.trackingCode}`,
          { duration: 8000 }
        );
      }

      fetchOrders();
    } catch (error) {
      const data = error.response?.data;
      const missing = data?.details?.missingFields?.join(', ');
      const extra = data?.details?.recipientPhone ? `phone: ${data.details.recipientPhone}` : '';
      const message = missing
        ? `${data?.message || 'Missing required shipping info'}: ${missing}`
        : `${data?.message || 'Failed to send to courier'}${extra ? ` (${extra})` : ''}`;
      toast.error(message, { id: loadingToast });
      console.error('Courier error:', data);
    }
  };

  const openCourierModal = (order) => {
    const shipping = order.shippingAddress || {};
    const contact = order.user || order.guestInfo || {};
    const itemDescription = order.items
      .map((item) => `${item.product?.name || item.name || 'Item'} x${item.quantity}`)
      .join(', ');

    setCourierOrder(order);
    setCourierForm({
      recipientName: shipping.name || contact.name || '',
      recipientPhone: shipping.phone || contact.phone || '',
      recipientEmail: shipping.email || contact.email || '',
      alternatePhone: '',
      addressLine: shipping.street || '',
      union: shipping.union || '',
      subDistrict: shipping.subDistrict || '',
      district: shipping.district || '',
      division: shipping.division || '',
      city: shipping.city || '',
      postalCode: shipping.postalCode || shipping.zipCode || '',
      itemDescription,
      weightKg: '',
      deliveryType: 'home',
      parcelValue: '',
      codAmount: order.paymentMethod === 'cod' ? order.total : 0,
      invoice: `CHG-${order._id}`,
      note: order.notes || '',
    });
    setCourierModalOpen(true);
  };

  const handleCourierChange = (e) => {
    const { name, value } = e.target;
    setCourierForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCourierSubmit = (e) => {
    e.preventDefault();
    if (!courierOrder) return;
    setCourierModalOpen(false);
    sendToCourier(courierOrder._id, courierForm);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order deleted successfully');
      fetchOrders();
    } catch {
      toast.error('Failed to delete order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      case 'returned': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'processing': return <Eye className="h-5 w-5" />;
      case 'shipped': return <ShoppingBag className="h-5 w-5" />;
      case 'delivered': return <CheckCircle className="h-5 w-5" />;
      case 'cancelled': return <XCircle className="h-5 w-5" />;
      case 'returned': return <XCircle className="h-5 w-5" />;
      default: return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    const name = order.customerName || order.user?.name || 'Guest';
    const email = order.customerEmail || order.user?.email || '';
    return order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon"></div>
    </div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-maroon flex items-center">
          <ShoppingBag className="mr-3 h-8 w-8" />
          Manage Orders
        </h1>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 w-full"
            />
          </div>

          <div className="flex space-x-3">
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all ${statusFilter === status
                    ? 'bg-maroon text-white shadow-medium'
                    : 'bg-cream-light text-charcoal hover:bg-maroon/10'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order._id} className="card hover:shadow-large transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Order Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <h3 className="text-xl font-bold text-maroon">#{order._id}</h3>
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold border-2 flex items-center space-x-2 ${getStatusColor(order.orderStatus)}`}>
                    {getStatusIcon(order.orderStatus)}
                    <span className="capitalize">{order.orderStatus}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate font-semibold">Customer</p>
                    <p className="text-charcoal font-medium">{order.customerName || order.user?.name || 'Guest'}</p>
                    <p className="text-slate">{order.customerEmail || order.user?.email || 'No email'}</p>
                  </div>

                  <div>
                    <p className="text-slate font-semibold">Shipping Address</p>
                    <p className="text-charcoal font-medium">
                      {order.shippingAddress
                        ? [
                          order.shippingAddress.street,
                          order.shippingAddress.union,
                          order.shippingAddress.subDistrict,
                          order.shippingAddress.district,
                          order.shippingAddress.division,
                          order.shippingAddress.city,
                          order.shippingAddress.postalCode || order.shippingAddress.zipCode,
                        ].filter(Boolean).join(', ')
                        : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate font-semibold">Items</p>
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-charcoal">
                        {item.product?.name || item.name || 'Item'} × {item.quantity}
                      </p>
                    ))}
                  </div>

                  <div>
                    <p className="text-slate font-semibold">Order Date</p>
                    <p className="text-charcoal font-medium">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount & Actions */}
              <div className="flex flex-col items-end space-y-4 lg:pl-6 lg:border-l-2 border-slate/20">
                <div className="text-right">
                  <p className="text-slate text-sm font-semibold">Total Amount</p>
                  <p className="text-3xl font-bold text-maroon">৳{(order.total || 0).toLocaleString()}</p>
                  <p className="text-sm text-slate mt-1 capitalize">{order.paymentMethod}</p>
                </div>

                <div className="flex flex-col items-end space-y-3">
                  {/* Send to Courier Button */}
                  {!order.courierInfo?.consignmentId &&
                    order.orderStatus !== 'delivered' &&
                    order.orderStatus !== 'cancelled' && (
                      <button
                        onClick={() => openCourierModal(order)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-2 border-2 border-emerald-300"
                      >
                        <Truck className="h-4 w-4" />
                        Send to Courier
                      </button>
                    )}

                  {/* Show tracking info if already sent */}
                  {order.courierInfo?.trackingCode && (
                    <div className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border-2 border-blue-300">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span>Tracking: {order.courierInfo.trackingCode}</span>
                      </div>
                      <p className="text-[10px] text-blue-600 mt-1">
                        Sent: {new Date(order.courierInfo.sentAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                    <select
                      value={order.orderStatus}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="input-field text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  )}

                  {/* Payment Status Dropdown for Admin */}
                  <div className="flex items-center space-x-2 w-full justify-end mt-2">
                    <span className="text-xs font-bold text-slate">Payment:</span>
                    <select
                      value={order.paymentStatus || 'pending'}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        const confirmMsg = newStatus === 'paid'
                          ? "Mark this order as PAID? This will count towards revenue."
                          : "Change payment status?";

                        if (window.confirm(confirmMsg)) {
                          try {
                            const token = localStorage.getItem('token');
                            await axios.put(`/api/admin/orders/${order._id}`, {
                              paymentStatus: newStatus
                            }, { headers: { Authorization: `Bearer ${token}` } });
                            toast.success(`Payment marked as ${newStatus}`);
                            fetchOrders();
                          } catch {
                            toast.error('Failed to update payment status');
                          }
                        }
                      }}
                      className={`input-field text-sm py-1 px-2 w-auto border-2 ${order.paymentStatus === 'paid' ? 'border-green-500 text-green-700' : 'border-orange-300 text-orange-700'}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleDeleteOrder(order._id)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    Delete Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="card text-center py-12">
          <ShoppingBag className="h-16 w-16 text-slate mx-auto mb-4 opacity-50" />
          <p className="text-xl font-semibold text-slate">No orders found</p>
        </div>
      )}

      <CourierDetailsModal
        open={courierModalOpen}
        form={courierForm}
        onChange={handleCourierChange}
        onClose={() => setCourierModalOpen(false)}
        onSubmit={handleCourierSubmit}
      />
    </div>
  );
};

export default AdminOrders;
