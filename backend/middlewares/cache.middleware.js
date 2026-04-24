const NodeCache = require('node-cache');
const logger = require('../utils/logger');

// Initialize in-memory cache
// stdTTL: 5 minutes default, checkperiod: 120 seconds
const localCache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

logger.success('In-Memory Caching System Initialized');

/**
 * In-Memory Cache Middleware
 * @param {Number} duration - Cache duration in seconds
 */
const cache = (duration) => (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
        return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
        const cachedResponse = localCache.get(key);

        if (cachedResponse) {
            logger.debug(`Cache Hit: ${key}`);
            return res.status(200).json(cachedResponse);
        }

        // Intercept res.json to store the response in memory
        const originalJson = res.json;
        res.json = (body) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                localCache.set(key, body, duration);
                logger.debug(`Cache Set: ${key} for ${duration}s`);
            }
            return originalJson.call(res, body);
        };

        next();
    } catch (error) {
        logger.error('Cache Middleware Error', error);
        next();
    }
};

module.exports = cache;
