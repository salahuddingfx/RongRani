import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useDeliveryCalculation } from '../hooks/useDeliveryCalculation';
import { CreditCard, Truck, MapPin, User } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { delivery, loading: deliveryLoading, fetchDelivery } = useDeliveryCalculation();
  
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponInfo, setCouponInfo] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address?.street || '',
    union: user?.address?.union || '',
    subDistrict: user?.address?.subDistrict || '',
    district: user?.address?.district || '',
    division: user?.address?.division || '',
    city: user?.address?.city || '',
    postalCode: user?.address?.postalCode || '',
    zipCode: user?.address?.zipCode || '',
    transactionId: '',
    senderLastDigits: '',
    paymentMethod: 'cod'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    if (couponInfo) {
      setCouponInfo(null);
      setDiscount(0);
    }
  }, [totalPrice, couponInfo]);

  // Fetch delivery charge from backend when address or total price changes
  useEffect(() => {
    if (totalPrice > 0 && formData.district && formData.city) {
      fetchDelivery(totalPrice, formData.district, formData.city);
    }
  }, [totalPrice, formData.district, formData.city, fetchDelivery]);

  const handleApplyCoupon = async () => {
    if (couponLoading) return;

    const trimmedCode = couponCode.trim().toUpperCase();

    if (!trimmedCode) {
      setCouponInfo(null);
      setDiscount(0);
      setCouponCode('');
      return;
    }

    if (couponInfo) {
      setCouponInfo(null);
      setDiscount(0);
      setCouponCode('');
      return;
    }

    setCouponLoading(true);
    try {
      const response = await axios.post('/api/coupons/validate', {
        code: trimmedCode,
        subtotal: totalPrice,
      });

      setCouponCode(trimmedCode);
      setCouponInfo(response.data);
      setDiscount(response.data.discount || 0);
      toast.success(`Coupon applied! You saved ৳${(response.data.discount || 0).toFixed(0)}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid coupon code';
      setCouponInfo(null);
      setDiscount(0);
      toast.error(message);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) {
      return;
    }
    
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.union || !formData.subDistrict) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (formData.paymentMethod !== 'cod') {
        if (!formData.transactionId || !formData.senderLastDigits) {
          toast.error('Please provide transaction ID and sender last 4 digits');
          setLoading(false);
          return;
        }
        if (!/^[0-9]{4}$/.test(formData.senderLastDigits)) {
          toast.error('Sender last digits must be 4 numbers');
          setLoading(false);
          return;
        }
        if (formData.transactionId.trim().length < 6) {
          toast.error('Transaction ID looks too short');
          setLoading(false);
          return;
        }
      }

      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          product: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        shippingAddress: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          street: formData.address,
          union: formData.union,
          subDistrict: formData.subDistrict,
          district: formData.district,
          division: formData.division,
          city: formData.city,
          state: formData.city,
          postalCode: formData.postalCode,
          zipCode: formData.postalCode || formData.zipCode || '0000',
          country: 'Bangladesh',
        },
        paymentMethod: formData.paymentMethod,
        paymentDetails: formData.paymentMethod !== 'cod' ? {
          transactionId: formData.transactionId,
          senderLastDigits: formData.senderLastDigits,
        } : undefined,
      };

      if (couponInfo?.code) {
        orderData.couponCode = couponInfo.code;
      }

      // Add guest info if not authenticated
      if (!isAuthenticated) {
        orderData.guestInfo = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        };
      }

      // Submit order to backend
      const token = localStorage.getItem('token');
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`
        }
      } : {};
      
      await axios.post('/api/orders', orderData, config);
      
      // Clear cart and show success
      clearCart();
      
      // Show different messages based on payment method
      if (formData.paymentMethod === 'cod') {
        toast.success('Order placed successfully! We will contact you soon.');
      } else {
        toast.success(`Order placed! We'll call you to confirm ${formData.paymentMethod.toUpperCase()} payment.`);
      }
      
      // Navigate based on auth status
      setTimeout(() => {
        if (isAuthenticated) {
          navigate('/orders');
        } else {
          navigate('/');
        }
      }, 2000);
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Your cart is empty
        </h2>
        <Link
          to="/shop"
          className="bg-maroon text-white px-8 py-3 rounded-lg hover:bg-maroon/80 transition-colors inline-block"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Get delivery charge from backend (or 0 while loading)
  const shipping = delivery?.charge || 0;
  const tax = 0; // No tax
  const total = Math.max(0, totalPrice + shipping + tax - discount);

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-maroon mb-2 text-center">
          Checkout
        </h1>
        
        {!isAuthenticated && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-maroon text-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold mb-3 text-center">🎁 Become a Lifetime Customer!</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">💝</div>
                  <p className="font-semibold">Exclusive Deals</p>
                  <p className="text-cream-light text-xs">Member-only discounts</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🚚</div>
                  <p className="font-semibold">Free Shipping</p>
                  <p className="text-cream-light text-xs">On orders above ৳2500</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">📦</div>
                  <p className="font-semibold">Order Tracking</p>
                  <p className="text-cream-light text-xs">Track all your orders</p>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Link
                  to="/login"
                  state={{ from: '/checkout' }}
                  className="bg-white text-maroon px-6 py-2 rounded-full font-bold hover:bg-cream-light transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  state={{ from: '/checkout' }}
                  className="bg-gold text-charcoal px-6 py-2 rounded-full font-bold hover:bg-gold/80 transition-colors"
                >
                  Register
                </Link>
              </div>
              <p className="text-center text-xs text-cream-light mt-3">
                Or continue as guest below
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Order Summary
            </h2>

            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">৳{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <hr className="my-4 border-white/30 dark:border-gray-600/30" />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>৳{totalPrice}</span>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate">
                  Coupon Code
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Enter coupon code"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="bg-maroon text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-60"
                  >
                    {couponInfo ? 'Remove' : couponLoading ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {couponInfo && (
                  <p className="text-xs text-green-700 font-semibold">
                    Applied {couponInfo.code} • Saved ৳{discount.toFixed(0)}
                  </p>
                )}
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{deliveryLoading ? '...' : `৳${shipping}`}</span>
              </div>
              {delivery?.label && (
                <p className="text-xs text-slate">
                  {delivery.label}
                </p>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>Discount</span>
                  <span>-৳{discount.toFixed(0)}</span>
                </div>
              )}
              <hr className="border-white/30 dark:border-gray-600/30" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>৳{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="card p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-maroon mb-6 flex items-center">
            <MapPin className="h-6 w-6 mr-2" />
            Shipping Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Guest Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-slate mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="+880 1XXX-XXXXXX"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-slate mb-2">
                Street Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={2}
                className="input-field"
                placeholder="House/Flat no, Street name"
              />
            </div>

            {/* Division and District */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate mb-2">
                  Division (optional)
                </label>
                <input
                  type="text"
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Chattogram"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate mb-2">
                  District (optional)
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Cox's Bazar"
                />
              </div>
            </div>

            {/* Sub-district and Union */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate mb-2">
                  Sub-district (Upazila) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subDistrict"
                  value={formData.subDistrict}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Cox's Bazar Sadar"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate mb-2">
                  Union / Ward <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="union"
                  value={formData.union}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Union name"
                />
              </div>
            </div>

            {/* City and Postal Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Dhaka"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate mb-2">
                  Postal Code (optional)
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="1200"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-cream-light p-6 rounded-lg">
              <h3 className="text-lg font-bold text-maroon mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Method
              </h3>
              <div className="space-y-3">
                <label className="flex items-center p-3 border-2 border-maroon rounded-lg cursor-pointer hover:bg-maroon/5 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                    className="text-maroon focus:ring-maroon h-4 w-4"
                  />
                  <span className="ml-3 font-semibold text-charcoal">💵 Cash on Delivery</span>
                </label>
                
                <div className="border-2 border-maroon/30 rounded-lg p-4 bg-white/70">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <p className="font-bold text-maroon">📱 Mobile Banking (bKash/Nagad/Rocket)</p>
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-maroon text-white text-sm font-semibold">
                      01764723083
                    </span>
                  </div>
                  <ol className="text-sm text-charcoal space-y-1">
                    <li>1) Send full payment to the number above.</li>
                    <li>2) Use your own number for payment.</li>
                    <li>3) Enter Transaction ID and last 4 digits below.</li>
                  </ol>
                  <div className="space-y-2 ml-3">
                    <label className="flex items-center p-2 rounded cursor-pointer hover:bg-maroon/5 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bkash"
                        checked={formData.paymentMethod === 'bkash'}
                        onChange={handleChange}
                        className="text-maroon focus:ring-maroon h-4 w-4"
                      />
                      <span className="ml-3 text-charcoal">bKash</span>
                    </label>
                    <label className="flex items-center p-2 rounded cursor-pointer hover:bg-maroon/5 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="nagad"
                        checked={formData.paymentMethod === 'nagad'}
                        onChange={handleChange}
                        className="text-maroon focus:ring-maroon h-4 w-4"
                      />
                      <span className="ml-3 text-charcoal">Nagad</span>
                    </label>
                    <label className="flex items-center p-2 rounded cursor-pointer hover:bg-maroon/5 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="rocket"
                        checked={formData.paymentMethod === 'rocket'}
                        onChange={handleChange}
                        className="text-maroon focus:ring-maroon h-4 w-4"
                      />
                      <span className="ml-3 text-charcoal">Rocket</span>
                    </label>
                  </div>
                  {formData.paymentMethod !== 'cod' && (
                    <div className="mt-4 ml-3 space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate mb-2">
                          Transaction ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="transactionId"
                          value={formData.transactionId}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="e.g. 8A7B6C5D"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate mb-2">
                          Sender Number (last 4 digits) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="senderLastDigits"
                          value={formData.senderLastDigits}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="e.g. 2383"
                          maxLength={4}
                        />
                      </div>
                      <p className="text-xs text-slate">You can call admin after payment if needed.</p>
                    </div>
                  )}
                  <p className="text-xs text-slate mt-3 ml-3">⚠️ We'll call you to confirm payment details</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-5 text-lg font-bold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Placing Order...' : 'Place Order - ৳' + total.toFixed(2)}
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Checkout;