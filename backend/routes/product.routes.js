const express = require('express');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getCategories, getTags, searchProducts } = require('../controllers/product.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/categories', getCategories);
router.get('/tags', getTags);
router.get('/:id', getProduct);

// Admin only routes
router.post('/', auth, authorize(['admin', 'super_admin']), createProduct);
router.put('/:id', auth, authorize(['admin', 'super_admin']), updateProduct);
router.delete('/:id', auth, authorize(['admin', 'super_admin']), deleteProduct);

module.exports = router;