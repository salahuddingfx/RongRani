#!/usr/bin/env node

/**
 * Keep-Alive Script for Render Free Tier
 * Run this locally or on a cron job to keep your Render server alive
 * Usage: node keepalive.js
 */

const https = require('https');
const http = require('http');

const SERVER_URL = process.env.SERVER_URL || 'https://rongrani-backend.onrender.com';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes (Render free tier sleeps after ~15 min inactivity)
const ENDPOINTS = ['/api/keepalive/ping', '/api/keepalive/health'];

console.log('🚀 Starting Keep-Alive Service for Render');
console.log(`📡 Target Server: ${SERVER_URL}`);
console.log(`⏰ Ping Interval: ${PING_INTERVAL / 1000 / 60} minutes`);
console.log('─'.repeat(50));

function pingServer(endpoint = '/api/keepalive/ping') {
  const url = SERVER_URL + endpoint;
  const client = url.startsWith('https') ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            status: res.statusCode,
            endpoint,
            response
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            endpoint,
            response: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject({
        endpoint,
        error: err.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject({
        endpoint,
        error: 'Request timeout'
      });
    });
  });
}

async function keepAlive() {
  const timestamp = new Date().toLocaleString();

  try {
    // Ping multiple endpoints to ensure server stays awake
    const results = await Promise.allSettled(
      ENDPOINTS.map(endpoint => pingServer(endpoint))
    );

    console.log(`[${timestamp}] Keep-Alive Check:`);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { status, endpoint, response } = result.value;
        console.log(`  ✅ ${endpoint} - Status: ${status} - ${response.status || 'OK'}`);
      } else {
        const { endpoint, error } = result.reason;
        console.log(`  ❌ ${endpoint} - Error: ${error}`);
      }
    });

  } catch (error) {
    console.error(`[${timestamp}] Keep-Alive failed:`, error.message);
  }
}

// Initial ping
keepAlive();

// Set up interval
setInterval(keepAlive, PING_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Keep-Alive service stopped');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Keep-Alive service stopped');
  process.exit(0);
});

console.log('✅ Keep-Alive service is running...');
console.log('💡 Press Ctrl+C to stop');