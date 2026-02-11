const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Category = require('../models/Category');
const cloudinary = require('../utils/cloudinaryConfig');

const emitEvent = (req, event, payload) => {
  const io = req.app?.get('io');
  if (io) {
    io.emit(event, payload);
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || Number(req.query.pageNumber) || 1;
    const category = req.query.category;
    const subcategory = req.query.subcategory;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const search = req.query.search;
    const sort = req.query.sort || '-createdAt';

    let query = { isActive: true };

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    console.log('📦 Creating new product...');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user ? req.user._id : 'No user');

    // Validate required fields
    const { name, description, price, category, stock } = req.body;
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        message: 'Missing required fields: name, description, price, category are required'
      });
    }

    const productData = {
      ...req.body,
      createdBy: req.user._id,
      stock: stock || 0,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    };

    console.log('Product data to create:', JSON.stringify(productData, null, 2));
    const product = await Product.create(productData);
    console.log('✅ Product created successfully:', product._id);

    emitEvent(req, 'product:created', product);
    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Product creation failed:', error);
    res.status(500).json({
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is admin or product creator
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const previousStock = product.stock;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    emitEvent(req, 'product:updated', updatedProduct);
    if (req.body.stock !== undefined && updatedProduct.stock !== previousStock) {
      emitEvent(req, 'inventory:updated', {
        _id: updatedProduct._id,
        stock: updatedProduct.stock,
      });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is admin or product creator
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    // Delete images from cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.publicId) {
          await cloudinary.uploader.destroy(image.publicId);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    emitEvent(req, 'product:deleted', { _id: req.params.id });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 });

    // Calculate product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          category: category.name,
          isActive: true
        });
        return {
          ...category.toObject(),
          productCount
        };
      })
    );

    res.json(categoriesWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product tags
// @route   GET /api/products/tags
// @access  Public
const getTags = async (req, res) => {
  try {
    const tags = await Product.distinct('tags', { isActive: true });
    res.json(tags.flat());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit a review for a product (must have ordered it)
// @route   POST /api/products/:id/reviews
// @access  Public (allows both logged-in and guest users with order verification)
const submitReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment, guestEmail, orderId } = req.body;

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({ message: 'Comment must be at least 10 characters' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has ordered this product
    let hasOrdered = false;
    let userEmail = null;

    if (req.user) {
      // Logged-in user - check order history
      const userOrders = await Order.find({
        user: req.user._id,
        orderStatus: 'delivered', // Only allow reviews after delivery
        'items.product': productId,
      });
      hasOrdered = userOrders.length > 0;
      userEmail = req.user.email;
    } else if (guestEmail && orderId) {
      // Guest user - verify order with email and orderId
      const guestOrder = await Order.findById(orderId);
      if (
        guestOrder &&
        guestOrder.guestInfo?.email === guestEmail &&
        guestOrder.orderStatus === 'delivered' &&
        guestOrder.items.some((item) => item.product.toString() === productId)
      ) {
        hasOrdered = true;
        userEmail = guestEmail;
      }
    }

    if (!hasOrdered) {
      return res.status(403).json({
        message: 'You can only review products you have ordered and received',
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      $or: [
        { user: req.user?._id },
        { guestName: userEmail },
      ],
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Create review (starts as pending, needs admin approval)
    const review = await Review.create({
      product: productId,
      user: req.user?._id || null,
      guestName: !req.user ? userEmail : null,
      rating,
      title: title || '',
      comment,
      status: 'pending', // Admin must approve
    });

    // Update product review stats
    const stats = await Review.aggregate([
      { $match: { product: product._id, status: 'approved' } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      product.rating = stats[0].avgRating;
      product.reviewCount = stats[0].count;
    } else {
      product.rating = 0;
      product.reviewCount = 0;
    }

    await product.save();

    // Emit real-time event
    emitEvent(req, 'review:submitted', { review, productId });

    // Get user details for email
    const reviewerName = req.user ? req.user.name : (guestName || 'Valued Customer');
    const reviewerEmail = req.user ? req.user.email : guestEmail;

    // Send Thank You Email
    if (reviewerEmail) {
      // We don't await this to avoid blocking the response
      const { sendEmail } = require('../utils/emailService');
      sendEmail(
        reviewerEmail,
        'Thanks for your review! 💖',
        'reviewThankYou',
        {
          name: reviewerName,
          productName: product.name,
          comment: comment
        }
      ).catch(err => console.error('Failed to send review email:', err));
    }

    res.status(201).json({
      message: 'Review submitted! Check your email for a surprise! 🎁',
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a product (only approved)
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await Review.find({
      product: id,
      status: 'approved',
    })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if user can review a product
// @route   GET /api/products/:id/can-review
// @access  Private/Public
const canReviewProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { guestEmail, orderId } = req.query;

    let hasOrdered = false;

    if (req.user) {
      // Logged-in user
      const userOrders = await Order.countDocuments({
        user: req.user._id,
        orderStatus: 'delivered',
        'items.product': id,
      });
      hasOrdered = userOrders > 0;
    } else if (guestEmail && orderId) {
      // Guest user
      const guestOrder = await Order.findById(orderId);
      hasOrdered = !!(
        guestOrder &&
        guestOrder.guestInfo?.email === guestEmail &&
        guestOrder.orderStatus === 'delivered' &&
        guestOrder.items.some((item) => item.product.toString() === id)
      );
    }

    res.json({ canReview: hasOrdered });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, sort = '-createdAt' } = req.query;

    let query = { isActive: true };

    if (q) {
      query.$text = { $search: q };
    }

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query)
      .sort(sort)
      .limit(50);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getTags,
  searchProducts,
  submitReview,
  getProductReviews,
  canReviewProduct,
};