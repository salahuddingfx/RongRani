const express = require('express');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getCategories, getTags, searchProducts, submitReview, getProductReviews, canReviewProduct } = require('../controllers/product.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes - Static routes BEFORE dynamic :id routes
router.get('/search', searchProducts);
router.get('/categories', getCategories);
router.get('/tags', getTags);

// Dynamic product routes
router.get('/:id', getProduct);
router.get('/:id/reviews', getProductReviews); // Get all approved reviews
router.get('/:id/can-review', canReviewProduct); // Check if user can review
router.post('/:id/reviews', submitReview); // Submit new review

// List all products
router.get('/', getProducts);

// Admin only routes
router.post('/', auth, authorize(['admin', 'super_admin']), createProduct);
router.put('/:id', auth, authorize(['admin', 'super_admin']), updateProduct);
router.delete('/:id', auth, authorize(['admin', 'super_admin']), deleteProduct);

module.exports = router;