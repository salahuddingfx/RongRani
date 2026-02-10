const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Allow guest orders
  },
  guestInfo: {
    name: String,
    email: String,
    phone: String,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    image: String,
    attributes: [{
      name: String,
      value: String,
    }],
  }],
  shippingAddress: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    union: {
      type: String,
      required: false,
    },
    subDistrict: {
      type: String,
      required: false,
    },
    district: {
      type: String,
      required: false,
    },
    division: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: false,
    },
    postalCode: {
      type: String,
      required: false,
    },
    zipCode: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: true,
    },
  },
  billingAddress: {
    name: String,
    email: String,
    phone: String,
    street: String,
    union: String,
    subDistrict: String,
    district: String,
    division: String,
    city: String,
    state: String,
    postalCode: String,
    zipCode: String,
    country: String,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'paypal', 'bank', 'cod', 'bkash', 'nagad', 'rocket', 'upay'],
  },
  paymentDetails: {
    transactionId: String,
    senderLastDigits: String,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative'],
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative'],
  },
  shipping: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cannot be negative'],
  },
  delivery: {
    // Centralized delivery information
    charge: {
      type: Number,
      default: 0,
      min: [0, 'Delivery charge cannot be negative'],
    },
    label: String, // Human-readable label (e.g., "Free Delivery (All Bangladesh)")
    isFree: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: ['LOCAL', 'STEADFAST', 'PATHAO'],
      default: 'STEADFAST',
    },
    // Threshold at time of order (for historical reference)
    threshold: {
      type: Number,
      default: 2500,
    },
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
  },
  isGiftWrapped: {
    type: Boolean,
    default: false
  },
  giftWrappingFee: {
    type: Number,
    default: 0
  },
  giftMessage: {
    type: String,
    maxLength: [500, 'Gift message cannot exceed 500 characters'],
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative'],
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
  },
  trackingNumber: String,
  courierInfo: {
    consignmentId: String,
    trackingCode: String,
    courierName: String,
    sentAt: Date,
  },
  courierDetails: {
    recipientName: String,
    recipientPhone: String,
    recipientEmail: String,
    alternatePhone: String,
    addressLine: String,
    union: String,
    subDistrict: String,
    district: String,
    division: String,
    city: String,
    postalCode: String,
    itemDescription: String,
    weightKg: Number,
    deliveryType: String,
    parcelValue: Number,
    invoice: String,
    note: String,
  },
  notes: String,
  deliveredAt: Date,
  cancelledAt: Date,
  cancelledReason: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt on save
orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);