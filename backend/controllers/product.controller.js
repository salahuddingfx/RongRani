const mongoose = require('mongoose');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Category = require('../models/Category');
const ImageAsset = require('../models/ImageAsset');
const { deleteFromCloudinary } = require('../utils/cloudinaryConfig');
const { sendLowStockAlert } = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const emitEvent = (req, event, payload) => {
  const io = req.app?.get('io');
  if (io) {
    io.emit(event, payload);
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
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

  // Normalize products for frontend compatibility
  const normalizedProducts = products.map(product => {
    const p = product.toObject();

    // Ensure images is an array of objects
    if (Array.isArray(p.images)) {
      p.images = p.images.map(img => {
        if (typeof img === 'string') return { url: img };
        return img;
      }).filter(img => img && img.url);
    } else {
      p.images = [];
    }

    // Ensure singular image is an object
    if (p.images.length > 0) {
      p.image = p.images[0];
    } else if (typeof p.image === 'string') {
      p.image = { url: p.image };
    }

    return p;
  });

  res.status(200).json(
    new ApiResponse(200, {
      products: normalizedProducts,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    }, "Products fetched successfully")
  );
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const identifier = req.params.id;
  let product;
  
  // Check if it's a valid MongoDB ObjectId
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
  
  if (isObjectId) {
    product = await Product.findById(identifier);
  } else {
    product = await Product.findOne({ slug: identifier.toLowerCase() });
  }
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  
  if (!product.isActive) {
    throw new ApiError(404, 'Product is currently unavailable');
  }

  const p = product.toObject();

  // Normalize images
  if (Array.isArray(p.images)) {
    p.images = p.images.map(img => {
      if (typeof img === 'string') return { url: img };
      return img;
    }).filter(img => img && img.url);
  } else {
    p.images = [];
  }

  if (p.images.length > 0) {
    p.image = p.images[0];
  } else if (typeof p.image === 'string') {
    p.image = { url: p.image };
  }

  res.status(200).json(new ApiResponse(200, p));
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock } = req.body;
  if (!name || !description || !price || !category) {
    throw new ApiError(400, 'Missing required fields: name, description, price, category are required');
  }

  const normalizedImages = (req.body.images || []).map(img => {
    if (typeof img === 'string') return { url: img.trim() };
    return img;
  }).filter(img => img.url);

  const productData = {
    ...req.body,
    images: normalizedImages,
    image: normalizedImages.length > 0 ? normalizedImages[0] : undefined,
    createdBy: req.user._id,
    stock: stock || 0,
    isActive: req.body.isActive !== undefined ? req.body.isActive : true,
  };

  const product = await Product.create(productData);

  emitEvent(req, 'product:created', product);
  res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Auth check
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && product.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to update this product');
  }

  const previousStock = product.stock;

  let updateData = { ...req.body };
  if (req.body.images) {
    updateData.images = req.body.images.map(img => {
      if (typeof img === 'string') return { url: img.trim() };
      return img;
    }).filter(img => img.url);
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      ...updateData,
      image: updateData.images && updateData.images.length > 0 ? updateData.images[0] : undefined
    },
    { new: true, runValidators: true }
  );

  emitEvent(req, 'product:updated', updatedProduct);
  
  if (req.body.stock !== undefined && updatedProduct.stock !== previousStock) {
    emitEvent(req, 'inventory:updated', {
      _id: updatedProduct._id,
      stock: updatedProduct.stock,
    });

    if (updatedProduct.stock <= 5 && updatedProduct.stock < previousStock) {
      sendLowStockAlert(updatedProduct).catch(err => console.error('Low stock alert error:', err));
    }
  }

  res.status(200).json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && product.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to delete this product');
  }

  if (product.images && product.images.length > 0) {
    for (const image of product.images) {
      if (!image?.publicId) continue;

      if (mongoose.Types.ObjectId.isValid(image.publicId)) {
        await ImageAsset.findByIdAndDelete(image.publicId);
        continue;
      }

      try {
        await deleteFromCloudinary(image.publicId);
      } catch (error) {
        console.warn(`Failed to delete cloud image ${image.publicId}:`, error.message);
      }
    }
  }

  await Product.findByIdAndDelete(req.params.id);
  emitEvent(req, 'product:deleted', { _id: req.params.id });
  res.status(200).json(new ApiResponse(200, {}, 'Product deleted successfully'));
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort({ order: 1, name: 1 });

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

  res.status(200).json(new ApiResponse(200, categoriesWithCount));
});

// @desc    Get product tags
// @route   GET /api/products/tags
// @access  Public
const getTags = asyncHandler(async (req, res) => {
  const tags = await Product.distinct('tags', { isActive: true });
  res.status(200).json(new ApiResponse(200, tags.flat()));
});

// @desc    Submit a review for a product
// @route   POST /api/products/:id/reviews
// @access  Public
const submitReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, title, comment, guestEmail, orderId } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5');
  }

  if (!comment || comment.trim().length < 10) {
    throw new ApiError(400, 'Comment must be at least 10 characters');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  let hasOrdered = false;
  let userEmail = guestEmail || req.user?.email || null;
  let userName = req.body.guestName || req.user?.name || 'Valued Guest';

  if (req.user) {
    const userOrders = await Order.find({
      user: req.user._id,
      orderStatus: 'delivered',
      'items.product': productId,
    });
    hasOrdered = userOrders.length > 0;
  } else if (guestEmail && orderId) {
    const guestOrder = await Order.findById(orderId);
    if (
      guestOrder &&
      (guestOrder.guestInfo?.email === guestEmail || guestOrder.shippingAddress?.email === guestEmail) &&
      guestOrder.orderStatus === 'delivered' &&
      guestOrder.items.some((item) => item.product.toString() === productId)
    ) {
      hasOrdered = true;
      userName = guestOrder.guestInfo?.name || guestOrder.shippingAddress?.name || userName;
    }
  }

  const review = await Review.create({
    product: productId,
    user: req.user?._id || null,
    guestName: !req.user ? userName : null,
    guestEmail: !req.user ? userEmail : null,
    isVerifiedPurchase: hasOrdered,
    rating,
    title: title || '',
    comment,
    status: 'approved',
  });

  // Update product stats
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

  emitEvent(req, 'review:submitted', { review, productId });

  if (userEmail) {
    sendEmail(
      userEmail,
      'Thanks for your review! 💖',
      'reviewThankYou',
      { name: userName, productName: product.name, comment: comment }
    ).catch(err => console.error('Failed to send review email:', err));
  }

  res.status(201).json(new ApiResponse(201, review, 'Review submitted successfully! ✨'));
});

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

  let productId = id;
  if (!isObjectId) {
    const product = await Product.findOne({ slug: id.toLowerCase() }).select('_id').lean();
    if (!product) {
      return res.status(200).json(new ApiResponse(200, []));
    }
    productId = product._id;
  }

  const reviews = await Review.find({
    product: productId,
    status: 'approved',
  })
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(new ApiResponse(200, reviews));
});

// @desc    Check if user can review
// @route   GET /api/products/:id/can-review
// @access  Public
const canReviewProduct = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { canReview: true }));
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
  const { q, category, minPrice, maxPrice, sort = '-createdAt' } = req.query;

  let query = { isActive: true };

  if (q) query.$text = { $search: q };
  if (category) query.category = category;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const products = await Product.find(query)
    .sort(sort)
    .limit(50);

  res.status(200).json(new ApiResponse(200, products));
});

// @desc    Upload image
// @route   POST /api/products/upload
// @access  Private/Admin
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  const imageAsset = await ImageAsset.create({
    data: req.file.buffer,
    contentType: req.file.mimetype,
    filename: req.file.originalname,
    size: req.file.size,
    uploadedBy: req.user?._id,
  });

  const imageUrl = `${req.protocol}://${req.get('host')}/api/images/${imageAsset._id}`;

  res.status(201).json(new ApiResponse(201, {
    url: imageUrl,
    publicId: imageAsset._id.toString(),
    storage: 'mongodb',
  }));
});

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
  uploadImage,
};