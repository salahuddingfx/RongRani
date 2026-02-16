import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useDeliveryCalculation } from '../hooks/useDeliveryCalculation';
import { CreditCard, Truck, MapPin, User } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { delivery, loading: deliveryLoading, fetchDelivery } = useDeliveryCalculation();
  const { t, language } = useLanguage();
  const { state } = useLocation();
  const giftWrapping = state?.giftWrapping || false;
  const giftWrappingFee = 50;

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
    paymentMethod: 'cod', // Default to COD
    giftMessage: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Show warning toast for COD
    if (name === 'paymentMethod' && value === 'cod') {
      toast('Please pay delivery charge in advance for confirmation.', {
        icon: '⚠️',
        style: {
          borderRadius: '10px',
          background: '#FFFBEB',
          color: '#B45309',
          border: '1px solid #FCD34D',
        },
        duration: 4000,
      });
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Reset coupon only if the cart subtotal changes (items added/removed)
  useEffect(() => {
    if (couponInfo) {
      setCouponInfo(null);
      setDiscount(0);
    }
  }, [totalPrice]);

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

      // Validate Transaction ID for all manual payment methods (Mobile Banking, COD Advance, Full Payment)
      const manualMethods = ['bkash_manual', 'nagad_manual', 'rocket', 'upay', 'cod', 'full_payment'];
      if (manualMethods.includes(formData.paymentMethod)) {
        if (!formData.transactionId || !formData.senderLastDigits) {
          let errorMsg = 'Please provide transaction ID and sender last 4 digits';
          if (formData.paymentMethod === 'cod') errorMsg = 'Please pay delivery charge & enter TrxID';
          if (formData.paymentMethod === 'full_payment') errorMsg = 'Please pay full amount & enter TrxID';

          toast.error(errorMsg);
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
        paymentDetails: manualMethods.includes(formData.paymentMethod) ? {
          transactionId: formData.transactionId,
          senderLastDigits: formData.senderLastDigits,
        } : undefined,
        isGiftWrapped: giftWrapping,
        giftWrappingFee: giftWrapping ? giftWrappingFee : 0,
        giftMessage: formData.giftMessage,
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

      const response = await axios.post('/api/orders', orderData, config);
      const newOrder = response.data; // Assuming backend returns the created order object directly or in data property

      // Clear cart
      clearCart();

      // Handle Payment Redirection
      // Handle Automatic Payment Redirection (bkash, nagad, sslcommerz)
      const gatewayMethods = ['sslcommerz', 'bkash', 'nagad'];
      if (gatewayMethods.includes(formData.paymentMethod)) {
        try {
          const paymentResponse = await axios.post('/api/payment/init', {
            orderId: newOrder._id || newOrder.order?._id
          }, config);

          if (paymentResponse.data.url) {
            window.location.replace(paymentResponse.data.url);
            return; // Stop further execution
          }
        } catch (paymentError) {
          console.error('Payment init failed:', paymentError);
          toast.error('Payment initialization failed. Please check your order in dashboard.');
          navigate('/orders');
          return;
        }
      }

      // Show different messages based on payment method
      if (formData.paymentMethod === 'cod') {
        toast.success('Order placed successfully! We will contact you soon.');
      } else if (!gatewayMethods.includes(formData.paymentMethod)) {
        toast.success(`Order placed! We'll call you to confirm ${formData.paymentMethod.toUpperCase().replace('_MANUAL', '')} payment.`);
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
  const total = Math.max(0, totalPrice + shipping + tax + (giftWrapping ? giftWrappingFee : 0) - discount);

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-maroon mb-2 text-center">
          {t('checkout_title')}
        </h1>

        {!isAuthenticated && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-maroon text-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold mb-3 text-center">🎁 Become a Lifetime Customer!</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">💝</div>
                  <p className="font-semibold">{t('exclusive_deals')}</p>
                  <p className="text-cream-light text-xs">{t('exclusive_discounts')}</p>
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
                {t('order_summary')}
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
                <div className="space-y-3 bg-white/50 dark:bg-gray-700/50 p-4 rounded-xl border border-maroon/10">
                  <label className="block text-sm font-bold text-maroon dark:text-pink-600">
                    Apply Coupon Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-white border-2 border-maroon/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-maroon transition-all"
                      placeholder="Enter code (e.g. WELCOME10)"
                      disabled={couponInfo}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || (!couponCode.trim() && !couponInfo)}
                      className={`px-6 py-2 rounded-xl font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 ${couponInfo
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-maroon hover:bg-maroon/90 text-white disabled:opacity-50'
                        }`}
                    >
                      {couponLoading ? '...' : couponInfo ? 'Remove' : 'Apply'}
                    </button>
                  </div>
                  {couponInfo && (
                    <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-100 animate-fade-in">
                      <span className="text-lg">🎉</span>
                      <p className="text-xs font-bold">
                        Coupon "{couponInfo.code}" applied! You saved ৳{discount.toFixed(0)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600 font-medium">Shipping Charge</span>
                  <span className={`font-bold ${shipping === 0 && !deliveryLoading ? 'text-green-600' : ''}`}>
                    {deliveryLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
                        Calculating...
                      </span>
                    ) : (!formData.district || !formData.city) ? (
                      <span className="text-xs text-slate-400 font-normal italic">Enter address to calculate</span>
                    ) : shipping === 0 ? 'FREE' : `৳${shipping}`}
                  </span>
                </div>
                {giftWrapping && (
                  <div className="flex justify-between text-amber-600">
                    <span className="flex items-center gap-1">🎁 Gift Wrapping</span>
                    <span>৳{giftWrappingFee}</span>
                  </div>
                )}
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

          {/* Checkout Form Container - Using custom style instead of .card to avoid global hover transform */}
          <div className="bg-white rounded-3xl shadow-xl border border-maroon/10 p-6 lg:p-8 hover:shadow-2xl transition-all duration-300">
            <h2 className="text-2xl font-bold text-maroon mb-6 flex items-center">
              <MapPin className="h-6 w-6 mr-2" />
              {t('shipping_info')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Guest Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">
                    {t('full_name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder={t('name_placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">
                    {t('email_address')}
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
                  {t('phone_number')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder={t('phone_placeholder')}
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-slate mb-2">
                  {t('street_address')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="input-field"
                  placeholder={t('address_placeholder')}
                />
              </div>

              {/* Division and District */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">
                    {t('division')} {t('optional')}
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
                    {t('district')} {t('optional')}
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
                    {t('sub_district')} <span className="text-red-500">*</span>
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
                    {t('union_ward')} <span className="text-red-500">*</span>
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
                    {t('city_label')} <span className="text-red-500">*</span>
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
                    {t('postal_code')} {t('optional')}
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
                  {t('payment_method')}
                </h3>

                {/* Gift Message Block */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate mb-2">
                    {t('gift_message')} {t('optional')}
                  </label>
                  <textarea
                    name="giftMessage"
                    value={formData.giftMessage}
                    onChange={handleChange}
                    rows={3}
                    maxLength={500}
                    className="input-field bg-white"
                    placeholder={t('gift_message_placeholder')}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Maximum 500 characters</p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center p-3 border-2 border-slate-200 rounded-lg cursor-pointer hover:bg-maroon/5 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                      className="text-maroon focus:ring-maroon h-4 w-4"
                    />
                    <span className="ml-3 font-semibold text-charcoal">💵 {t('cod_label')}</span>
                  </label>

                  <label className="flex items-center p-3 border-2 border-maroon rounded-lg cursor-pointer hover:bg-maroon/5 transition-colors shadow-sm">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="full_payment"
                      checked={formData.paymentMethod === 'full_payment'}
                      onChange={handleChange}
                      className="text-maroon focus:ring-maroon h-4 w-4"
                    />
                    <div className="ml-3">
                      <span className="font-bold text-maroon block text-sm">💰 {t('full_prepayment')}</span>
                      <span className="text-[10px] text-slate-500 font-medium">Pay 100% upfront to skip delivery charge queues</span>
                    </div>
                  </label>

                  {/* Payment Warning Messages */}
                  {formData.paymentMethod === 'cod' && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg animate-fade-in my-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-bold text-amber-800">Advance Delivery Charge Required</h3>
                          <div className="mt-2 text-sm text-amber-700">
                            <p>To secure your order and prevent fake bookings, please pay <strong>৳{shipping}</strong> (Delivery Charge) in advance.</p>
                            <div className="mt-3 mb-2 font-mono bg-white p-2 rounded border border-amber-200 inline-block select-all">
                              Send Money to: <strong>01851075537</strong> (bKash/Nagad Personal)
                            </div>
                            <p className="text-xs font-semibold text-amber-900 mt-1">
                              After sending, enter your Transaction ID below to place the order.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === 'full_payment' && (
                    <div className="bg-maroon/5 border-l-4 border-maroon p-4 rounded-r-lg animate-fade-in my-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <CreditCard className="h-5 w-5 text-maroon" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-bold text-maroon">Full Prepayment Required</h3>
                          <div className="mt-2 text-sm text-maroon/80">
                            <p>Please pay the full amount <strong>৳{total.toFixed(2)}</strong> to confirm your order.</p>
                            <div className="mt-3 mb-2 font-mono bg-white p-2 rounded border border-maroon/20 inline-block select-all text-maroon">
                              Send Money to: <strong>01851075537</strong> (bKash/Nagad Personal)
                            </div>
                            <p className="text-xs font-semibold text-maroon mt-1">
                              Enter your TrxID and last 4 digits below. We will verify and process your order immediately.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Manual Mobile Banking Options */}
                  <div className="border-2 border-maroon/10 rounded-2xl p-5 bg-white shadow-sm overflow-visible">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Other Manual Methods</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      {['bkash_manual', 'nagad_manual', 'rocket', 'upay'].map((method) => (
                        <label
                          key={method}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all cursor-pointer ${formData.paymentMethod === method ? 'border-maroon bg-maroon/5' : 'border-slate-100 hover:border-maroon/30'}`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method}
                            checked={formData.paymentMethod === method}
                            onChange={handleChange}
                            className="hidden"
                          />
                          <span className="text-[10px] font-bold text-charcoal capitalize">{method.replace('_manual', '')}</span>
                        </label>
                      ))}
                    </div>

                    {/* Transaction Fields - Visible for COD, Full Payment, and Manual Methods */}
                    {['bkash_manual', 'nagad_manual', 'rocket', 'upay', 'cod', 'full_payment'].includes(formData.paymentMethod) && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 animate-slide-up">
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                          {formData.paymentMethod === 'cod'
                            ? '✅ Please enter the TrxID for the ৳' + shipping + ' delivery charge payment:'
                            : formData.paymentMethod === 'full_payment'
                              ? '✅ Please enter the TrxID for the ৳' + total.toFixed(0) + ' full payment:'
                              : '✅ Please enter your payment verification details:'}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-black text-slate-600 mb-1 uppercase tracking-tight">Transaction ID <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              name="transactionId"
                              value={formData.transactionId}
                              onChange={handleChange}
                              required
                              className="w-full bg-white border-2 border-maroon/20 rounded-xl px-4 py-2.5 text-sm font-bold text-charcoal focus:border-maroon focus:ring-4 focus:ring-maroon/10 outline-none transition-all uppercase placeholder:text-slate-300"
                              placeholder="e.g. 8A7B6C5D"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-600 mb-1 uppercase tracking-tight">Sender Number (Last 4) <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              name="senderLastDigits"
                              value={formData.senderLastDigits}
                              onChange={handleChange}
                              required
                              maxLength={4}
                              className="w-full bg-white border-2 border-maroon/20 rounded-xl px-4 py-2.5 text-sm font-bold text-charcoal focus:border-maroon focus:ring-4 focus:ring-maroon/10 outline-none transition-all placeholder:text-slate-300"
                              placeholder="e.g. 2383"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Automatic Merchant PGW - FUTURE USE */}
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Automatic Payment (Coming Soon)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {['bkash', 'nagad', 'sslcommerz'].map((method) => (
                        <label key={method} className="opacity-50 grayscale cursor-not-allowed flex items-center justify-center p-3 border border-gray-200 rounded-xl relative group">
                          <span className="text-[10px] font-bold text-gray-500 capitalize">{method}</span>
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[8px] font-bold text-maroon">API PENDING</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 md:py-5 text-sm md:text-lg font-bold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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