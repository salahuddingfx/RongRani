const { createClient } = require('redis');
const logger = require('../utils/logger');
const env = require('./env');

let isRedisConnected = false;

const client = createClient({
    url: env.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 5) {
                logger.warn('Redis reconnection limit reached. Caching will be disabled.');
                return false; // Stop reconnecting after 5 attempts
            }
            return 5000; // Try reconnecting every 5 seconds
        }
    }
});

client.on('error', (err) => {
    if (!isRedisConnected) {
        // Suppress repeated logs if it never connected
        return;
    }
    logger.error('Redis Error', err.message);
});

client.on('connect', () => {
    isRedisConnected = true;
    logger.success('Redis Connected Successfully');
});

client.on('end', () => {
    isRedisConnected = false;
    logger.warn('Redis Connection Closed');
});

const connectRedis = async () => {
    try {
        await client.connect();
    } catch (error) {
        logger.warn('Redis Connection Failed: Caching is currently disabled. (Run Redis to enable)');
        isRedisConnected = false;
    }
};

module.exports = { 
    client, 
    connectRedis, 
    getIsRedisConnected: () => isRedisConnected 
};
