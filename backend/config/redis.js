const { createClient } = require('redis');
const logger = require('../utils/logger');
const env = require('./env');

const client = createClient({
    url: env.REDIS_URL
});

client.on('error', (err) => logger.error('❌ Redis Error', err));
client.on('connect', () => logger.success('🚀 Redis Connected Successfully'));

const connectRedis = async () => {
    try {
        await client.connect();
    } catch (error) {
        logger.error('❌ Redis Connection Failed (Make sure Redis is running)', error.message);
        // We don't exit the process here because Redis might be optional in dev
    }
};

module.exports = { client, connectRedis };
