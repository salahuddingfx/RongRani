const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const DeliverySetting = require('../models/DeliverySetting');
const { sendOrderConfirmation, sendOrderStatusUpdate, sendEmail } = require('../services/emailService');
const { generateInvoice } = require('../utils/pdfGenerator');
const { calculateDelivery, getDeliveryDisplay } = require('../utils/deliveryCalculator');

const emitEvent = (req, event, payload) => {
  const io = req.app?.get('io');
  if (io) {
    io.emit(event, payload);
  }
};

/**
 * @desc    Calculate delivery charge for checkout preview
 * @route   POST /api/orders/calc-delivery
 * @access  Public (allows guest and authenticated users)
 */
const calculateDeliveryCharge = async (req, res) => {
  try {
    const { subtotal, district = '', city = '' } = req.body;

    // Validate subtotal
    if (typeof subtotal !== 'number' || subtotal < 0) {
      return res.status(400).json({
        message: 'Valid subtotal (number >= 0) is required',
      });
    }

    // Calculate delivery
    const delivery = calculateDelivery({
      subtotal,
      district,
      city,
    });

    // Return delivery info
    return res.status(200).json({
      success: true,
      delivery,
      display: getDeliveryDisplay(delivery),
    });
  } catch (error) {
    console.error('Delivery calculation error:', error);
    return res.status(500).json({ message: 'Error calculating delivery charge' });
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
      giftMessage,
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

      // Update product stock (Ensure atomic update if possible, but simple save is okay for now)
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

    // Calculate final totals using centralized delivery calculator
    const tax = 0; // No tax
    const deliveryResult = calculateDelivery({
      subtotal,
      district: shippingAddress?.district || '',
      city: shippingAddress?.city || '',
    });

    const shipping = deliveryResult.charge;
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
      delivery: {
        charge: deliveryResult.charge,
        label: deliveryResult.label,
        isFree: deliveryResult.isFree,
        provider: deliveryResult.provider,
        threshold: deliveryResult.threshold,
      },
      discount,
      total,
      coupon: coupon?._id,
      notes,
      giftMessage,
    });

    // Send response IMMEDIATELY
    res.status(201).json(order);

    // BACKGROUND TASKS (Non-blocking)
    // 1. Emit Socket Event
    try {
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
    } catch (socketError) {
      console.error('Socket emit failed:', socketError);
    }

    // 2. Generate PDF & Send Emails
    (async () => {
      try {
        const recipientEmail = isGuest ? guestInfo.email : req.user?.email;
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
          // Prepare robust data object for email template
          const emailOrderData = {
            ...order.toObject(),
            user: req.user ? req.user.toObject() : undefined,
            guestInfo: isGuest ? guestInfo : undefined,
            items: orderItems,
            billingAddress: billingAddress || normalizedShippingAddress,
            shippingAddress: normalizedShippingAddress,
            total,
            subtotal,
            shipping,
            discount,
            trackingQuery
          };

          console.log(`📧 Sending order confirmation to: ${recipientEmail}`);
          // Async call, no await to block if we were outside IIFE, but here we are in background IIFE so await is fine/good for logging
          await sendOrderConfirmation(emailOrderData, attachments);
        }

        // Send order notification to admin
        const customerEmail = isGuest ? guestInfo.email : req.user?.email;
        const customerName = isGuest ? guestInfo.name : req.user?.name;
        const customerPhone = shippingAddress.phone || (isGuest ? guestInfo.phone : req.user?.phone) || 'Not provided';

        console.log('📧 Sending new order notification to admin...');
        await sendEmail(
          process.env.SUPER_ADMIN_EMAIL || 'salauddinkaderappy@gmail.com',
          `🛒 New Order #${order._id} - RongRani`,
          'adminOrderNotification', // Ensure this template exists or handle logic in emailService
          {
            orderId: order._id,
            customerName,
            customerEmail: customerEmail || 'Not provided',
            customerPhone,
            items: orderItems,
            total: total.toFixed(2),
            paymentMethod,
            shippingAddress: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.zipCode || ''}`,
            giftMessage: giftMessage || 'No gift message',
          }
        );
        console.log('✅ Admin order notification sent');

      } catch (backgroundError) {
        console.error('❌ Background task failed (Email/PDF):', backgroundError);
      }
    })();

  } catch (error) {
    // If response was maintained (res.headersSent check not strictly needed if we structure correctly, 
    // but safety first if the error happened BEFORE res.json)
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    } else {
      console.error('Error after response sent:', error);
    }
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
    const { orderStatus, trackingNumber, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update Order Status
    if (orderStatus) {
      order.orderStatus = orderStatus;
      if (orderStatus === 'delivered' && !order.deliveredAt) {
        order.deliveredAt = new Date();
        // Often, delivered COD orders are implicitly paid, but let's keep it manual as requested unless admin sets it
      }
    }

    // Update Tracking
    if (trackingNumber) order.trackingNumber = trackingNumber;

    // Update Payment Status (User Request: "parcel deliverd hoya gele oita admin change kore dite parbe paid hisebe")
    // This allows admin to verify payment and mark it as 'paid'
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;

      // If status becomes PAID, mark isPaid=true so it counts in revenue
      if (paymentStatus === 'paid' && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
      }
      // Allow reverting to unpaid if needed (e.g. error)
      else if (paymentStatus !== 'paid' && order.isPaid) {
        order.isPaid = false;
        order.paidAt = null;
      }
    }

    await order.save();

    // Send status update email in BACKGROUND
    (async () => {
      try {
        const recipientEmail = order.user ? (await User.findById(order.user))?.email : order.guestInfo?.email;
        const recipientName = order.user ? (await User.findById(order.user))?.name : order.guestInfo?.name;

        if (recipientEmail) {
          const trackingQuery = recipientEmail ? `?email=${encodeURIComponent(recipientEmail)}` : '';
          await sendEmail(
            recipientEmail,
            'Order Update - RongRani',
            'orderStatusUpdate',
            {
              name: recipientName || 'Customer',
              orderId: order._id,
              status: orderStatus || order.orderStatus, // show current status
              paymentStatus: paymentStatus || order.paymentStatus,
              trackingNumber: trackingNumber || order.trackingNumber,
              trackingQuery,
            }
          );
        }
      } catch (emailError) {
        console.error('Status update email failed (background):', emailError);
      }
    })();

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
  calculateDeliveryCharge,
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderForTracking,
  updateOrderStatus,
  cancelOrder,
  getOrders,
  generateOrderInvoice,
};