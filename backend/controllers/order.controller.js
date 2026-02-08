const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const DeliverySetting = require('../models/DeliverySetting');
const { sendEmail } = require('../utils/emailService');
const { generateInvoice } = require('../utils/pdfGenerator');

const emitEvent = (req, event, payload) => {
  const io = req.app?.get('io');
  if (io) {
    io.emit(event, payload);
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (allows guest checkout)
const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentDetails,
      couponCode,
      notes,
      guestInfo, // For guest checkout
    } = req.body;

    // Determine if this is a guest order
    const isGuest = !req.user;
    const userId = req.user?._id || null;
    
    // For guest orders, require guestInfo
    if (isGuest && (!guestInfo?.name || !guestInfo?.phone)) {
      return res.status(400).json({
        message: 'Guest information (name and phone) is required for guest checkout',
      });
    }

    // Validate items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Product ${product?.name || 'Unknown'} is not available or insufficient stock`,
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      const firstImage = product.images?.[0];
      const imageUrl = typeof firstImage === 'string' ? firstImage : firstImage?.url;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: imageUrl,
        attributes: item.attributes || [],
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Apply coupon if provided
    let discount = 0;
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (!coupon) {
        return res.status(400).json({ message: 'Invalid or expired coupon' });
      }

      // Check usage limits
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return res.status(400).json({ message: 'Coupon usage limit exceeded' });
      }

      // Check minimum order value
      if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
        return res.status(400).json({
          message: `Minimum order value for this coupon is ${coupon.minOrderValue}`,
        });
      }

      // Calculate discount
      if (coupon.type === 'percentage') {
        discount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = coupon.value;
      }

      // Update coupon usage
      coupon.usageCount += 1;
      await coupon.save();
    }

    // Calculate final totals
    const tax = 0; // No tax
    const deliverySettings = await DeliverySetting.findOne();
    const freeThreshold = deliverySettings?.freeShippingThreshold ?? 2500;
    const baseFee = 150;
    const cityText = (shippingAddress?.city || '').toString().trim().toLowerCase();
    const isCoxBazar = cityText.includes('cox') && cityText.includes('bazar');

    let shipping = isCoxBazar ? 70 : baseFee;
    if (subtotal >= freeThreshold) {
      shipping = 0;
    }
    const total = subtotal + tax + shipping - discount;

    if (paymentMethod !== 'cod') {
      const transactionId = (paymentDetails?.transactionId || '').toString().trim();
      const senderLastDigits = (paymentDetails?.senderLastDigits || '').toString().trim();
      if (!transactionId || !senderLastDigits) {
        return res.status(400).json({
          message: 'Transaction ID and sender last digits are required for mobile banking payments',
        });
      }
      if (!/^\d{4}$/.test(senderLastDigits)) {
        return res.status(400).json({
          message: 'Sender last digits must be 4 numbers',
        });
      }
      if (transactionId.length < 6) {
        return res.status(400).json({
          message: 'Transaction ID looks too short',
        });
      }
    }

    // Create order
    const normalizedShippingAddress = {
      ...shippingAddress,
      email: shippingAddress?.email || guestInfo?.email || '',
      state: shippingAddress?.state || shippingAddress?.city || '',
      zipCode: shippingAddress?.zipCode || shippingAddress?.postalCode || '',
      postalCode: shippingAddress?.postalCode || shippingAddress?.zipCode || '',
    };

    const order = await Order.create({
      user: userId,
      guestInfo: isGuest ? guestInfo : undefined,
      items: orderItems,
      shippingAddress: normalizedShippingAddress,
      billingAddress: billingAddress || normalizedShippingAddress,
      paymentMethod,
      paymentDetails: paymentDetails || {},
      subtotal,
      tax,
      shipping,
      discount,
      total,
      coupon: coupon?._id,
      notes,
    });

    emitEvent(req, 'order:new', {
      _id: order._id,
      total: order.total,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      customerName: isGuest ? guestInfo.name : req.user?.name,
      customerEmail: isGuest ? guestInfo.email : req.user?.email,
      isGuest,
    });

    // Send order confirmation email to customer
    try {
      const recipientEmail = isGuest ? guestInfo.email : req.user.email;
      const recipientName = isGuest ? guestInfo.name : req.user.name;
      const trackingQuery = recipientEmail ? `?email=${encodeURIComponent(recipientEmail)}` : '';
      
      // Generate PDF invoice
      let attachments = [];
      try {
        const pdfBuffer = await generateInvoice(order);
        attachments.push({
          filename: `Invoice-${order._id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        });
      } catch (pdfError) {
        console.error('PDF generation failed:', pdfError);
        // Continue with email even if PDF fails
      }
      
      if (recipientEmail) {
        await sendEmail(
          recipientEmail,
          'Order Confirmation - Chirkut ঘর',
          'orderConfirmation',
          {
            name: recipientName,
            orderId: order._id,
            items: orderItems.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              image: item.image
            })),
            subtotal: subtotal.toFixed(2),
            tax: tax.toFixed(2),
            shipping: shipping.toFixed(2),
            discount: discount > 0 ? discount.toFixed(2) : 0,
            total: total.toFixed(2),
            trackingQuery,
          },
          attachments
        );
      }
    } catch (emailError) {
      console.error('Order confirmation email failed:', emailError);
    }

    // Send order notification to admin
    try {
      const customerEmail = isGuest ? guestInfo.email : req.user.email;
      const customerName = isGuest ? guestInfo.name : req.user.name;
      const customerPhone = isGuest ? guestInfo.phone : req.user.phone || 'Not provided';
      
      console.log('📧 Sending new order notification to admin...');
      await sendEmail(
        process.env.SUPER_ADMIN_EMAIL || 'salauddinkaderappy@gmail.com',
        `🛒 New Order #${order._id} - Chirkut ঘর`,
        'adminNewOrder',
        {
          orderId: order._id,
          customerName,
          customerEmail: customerEmail || 'Not provided',
          customerPhone,
          items: orderItems,
          total: total.toFixed(2),
          paymentMethod,
          shippingAddress: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.zipCode || ''}`,
        }
      );
      console.log('✅ Admin order notification sent');
    } catch (emailError) {
      console.error('❌ Admin notification email failed:', emailError);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'items.product',
      'name images price'
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'super_admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Public order tracking (guest or authenticated)
// @route   GET /api/orders/track/:id
// @access  Public (email/phone) or Private (token)
const getOrderForTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const requester = req.user;
    const email = (req.query.email || '').toString().trim().toLowerCase();
    const phone = (req.query.phone || '').toString().trim().replace(/\s+/g, '');

    const orderEmail = (order.user?.email || order.guestInfo?.email || order.shippingAddress?.email || '').toLowerCase();
    const orderPhone = (order.user?.phone || order.guestInfo?.phone || order.shippingAddress?.phone || '').toString().replace(/\s+/g, '');

    const isOwner = requester && order.user && order.user._id.toString() === requester._id.toString();
    const isAdmin = requester && ['admin', 'super_admin'].includes(requester.role);
    const isVerifiedContact = (!!email && orderEmail && orderEmail === email) || (!!phone && orderPhone && orderPhone === phone);

    if (!isOwner && !isAdmin && !isVerifiedContact) {
      return res.status(403).json({ message: 'Not authorized to track this order' });
    }

    res.json({
      _id: order._id,
      user: order.user ? {
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone,
      } : null,
      guestInfo: order.guestInfo || null,
      items: order.items,
      orderStatus: order.orderStatus,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      total: order.total,
      shippingAddress: order.shippingAddress,
      courierInfo: order.courierInfo || null,
      trackingNumber: order.trackingNumber || null,
      createdAt: order.createdAt,
      deliveredAt: order.deliveredAt || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    if (orderStatus === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    // Send status update email
    try {
      if (order.user) {
        const user = await User.findById(order.user);
        const trackingQuery = user?.email ? `?email=${encodeURIComponent(user.email)}` : '';
        await sendEmail(
          user.email,
          'Order Status Update - Chirkut ঘর',
          'orderStatusUpdate',
          {
            name: user.name,
            orderId: order._id,
            status: orderStatus,
            trackingNumber,
            trackingQuery,
          }
        );
      } else if (order.guestInfo) {
        const trackingQuery = order.guestInfo?.email ? `?email=${encodeURIComponent(order.guestInfo.email)}` : '';
        await sendEmail(
          order.guestInfo.email,
          'Order Status Update - Chirkut ঘর',
          'orderStatusUpdate',
          {
            name: order.guestInfo.name,
            orderId: order._id,
            status: orderStatus,
            trackingNumber,
            trackingQuery,
          }
        );
      }
    } catch (emailError) {
      console.error('Status update email failed:', emailError);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    if (order.orderStatus !== 'pending' && order.orderStatus !== 'processing') {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelledReason = reason;
    await order.save();

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const pageSize = 20;
    const page = Number(req.query.pageNumber) || 1;
    const status = req.query.status;
    const paymentStatus = req.query.paymentStatus;

    let query = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const count = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate invoice
// @route   GET /api/orders/:id/invoice
// @access  Private
const generateOrderInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email address phone')
      .populate('items.product', 'name price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'super_admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }

    const invoiceBuffer = await generateInvoice(order);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);
    res.send(invoiceBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderForTracking,
  updateOrderStatus,
  cancelOrder,
  getOrders,
  generateOrderInvoice,
};