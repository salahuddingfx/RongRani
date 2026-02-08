import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, XCircle, Eye, Search, Download } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data || []);
    } catch {
      // Mock data
      setOrders([
        {
          _id: '1001',
          items: [
            { product: { name: 'Love Combo - Chirkut Special', images: ['https://images.unsplash.com/photo-1518893063132-36e46dbe2428?w=500'] }, quantity: 1, price: 2500 },
            { product: { name: 'Premium Chocolate Gift Box', images: ['https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500'] }, quantity: 2, price: 1500 }
          ],
          totalAmount: 5500,
          status: 'processing',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '1002',
          items: [
            { product: { name: 'Couple Rings Set', images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500'] }, quantity: 1, price: 3500 }
          ],
          totalAmount: 3500,
          status: 'delivered',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '1003',
          items: [
            { product: { name: 'Valentine Special Combo', images: ['https://images.unsplash.com/photo-1464047736614-af63643285bf?w=500'] }, quantity: 1, price: 6500 }
          ],
          totalAmount: 6500,
          status: 'pending',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      // Create a download link
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
      default: return 'bg-slate/20 text-slate border-slate/30';
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
    order._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-maroon"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-maroon mb-2">My Orders</h1>
          <p className="text-slate">Track and manage your beautiful gift orders</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate" />
            <input
              type="text"
              placeholder="Search by order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 w-full"
            />
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="card text-center py-16">
            <Package className="h-20 w-20 text-slate mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-charcoal mb-2">No Orders Found</h3>
            <p className="text-slate mb-8">Start shopping and create your first order!</p>
            <Link to="/shop" className="btn-primary">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="card hover:shadow-large transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Left - Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <h3 className="text-2xl font-bold text-maroon">#{order._id}</h3>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 flex items-center space-x-2 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-3 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-4">
                          <img
                            src={item.product.images?.[0] || 'https://via.placeholder.com/100'}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg shadow-soft"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-charcoal">{item.product.name}</p>
                            <p className="text-sm text-slate">Quantity: {item.quantity} × ৳{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Dates */}
                    <div className="flex flex-wrap gap-4 text-sm text-slate">
                      <div>
                        <span className="font-semibold">Ordered:</span> {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-semibold">Delivery:</span> {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Right - Amount & Actions */}
                  <div className="flex flex-col items-end space-y-4 lg:border-l-2 lg:border-slate/20 lg:pl-8">
                    <div className="text-right">
                      <p className="text-sm text-slate mb-1">Total Amount</p>
                      <p className="text-3xl font-bold text-maroon">৳{order.totalAmount.toLocaleString()}</p>
                    </div>

                    <div className="flex flex-col space-y-2 w-full">
                      <Link
                        to={`/track/${order._id}`}
                        className="btn-primary flex items-center justify-center space-x-2"
                      >
                        <Eye className="h-5 w-5" />
                        <span>Track Order</span>
                      </Link>

                      <button
                        onClick={() => handleDownloadInvoice(order._id)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center space-x-2"
                      >
                        <Download className="h-5 w-5" />
                        <span>Download Invoice</span>
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
