const Product = require('../models/Product');
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
    const categories = await Product.distinct('category', { isActive: true });
    res.json(categories);
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
};