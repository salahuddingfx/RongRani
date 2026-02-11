require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('📦 Nodemailer Import Debug:');
console.log('Type:', typeof nodemailer);
console.log('Keys:', Object.keys(nodemailer));
console.log('Is createTransporter avail?', typeof nodemailer.createTransporter);

const { sendEmail } = require('./services/emailService');

// ... rest of the test code
console.log('🧪 Starting Email Test...');
// ...
