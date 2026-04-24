const { client, getIsRedisConnected } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Redis Cache Middleware
 * @param {Number} duration - Cache duration in seconds
 */
const cache = (duration) => async (req, res, next) => {
    // Only cache GET requests and only if Redis is connected
    if (req.method !== 'GET' || !getIsRedisConnected()) {
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
            // Check connection again before setting
            if (res.statusCode >= 200 && res.statusCode < 300 && getIsRedisConnected()) {
                client.setEx(key, duration, JSON.stringify(body))
                    .then(() => logger.debug(`Cache Set: ${key}`))
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
