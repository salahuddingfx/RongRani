const { client } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Redis Cache Middleware
 * @param {Number} duration - Cache duration in seconds
 */
const cache = (duration) => async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
        return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
        const cachedResponse = await client.get(key);

        if (cachedResponse) {
            logger.debug(`Cache Hit: ${key}`);
            return res.status(200).json(JSON.parse(cachedResponse));
        }

        // Intercept res.json to store the response in Redis
        const originalJson = res.json;
        res.json = (body) => {
            // Only cache successful responses
            if (res.statusCode >= 200 && res.statusCode < 300) {
                client.setEx(key, duration, JSON.stringify(body))
                    .then(() => logger.debug(`Cache Set: ${key} for ${duration}s`))
                    .catch(err => logger.error('Redis Cache Set Error', err));
            }
            return originalJson.call(res, body);
        };

        next();
    } catch (error) {
        logger.error('Redis Cache Middleware Error', error);
        next();
    }
};

module.exports = cache;
