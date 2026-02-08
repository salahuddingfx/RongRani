const express = require('express');
const { getChatResponse } = require('../controllers/ai.controller');
const { apiLimiter } = require('../middlewares/rateLimit.middleware');

const router = express.Router();

// Rate limiting for AI chat
const aiLimiter = apiLimiter;

router.post('/chat', aiLimiter, getChatResponse);

module.exports = router;