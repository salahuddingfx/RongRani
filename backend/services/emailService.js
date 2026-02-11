const nodemailer = require('nodemailer');

// Email transporter configuration
const createTransporter = () => {
  // Check for Brevo (Sendinblue) Configuration
  const smtpHost = process.env.BREVO_SMTP_HOST || process.env.SMTP_HOST;
  // Use 2525 as default for Brevo/Cloud as 587 is often throttled
  const smtpPort = process.env.BREVO_SMTP_PORT || process.env.SMTP_PORT || 2525;
  const smtpUser = process.env.BREVO_SMTP_USER || process.env.SMTP_USER;
  const smtpPass = process.env.BREVO_SMTP_PASS || process.env.SMTP_PASS;

  console.log('🔍 Checking Email Config:');
  console.log('Host:', smtpHost);
  console.log('Port:', smtpPort);
  console.log('User:', smtpUser);
  console.log('Pass Length:', smtpPass ? smtpPass.length : 0);

  if (smtpHost && smtpUser && smtpPass) {
    console.log(`✅ Configuring Email Service: ${smtpHost.includes('brevo') ? 'Brevo' : 'SMTP'} on Port ${smtpPort}`);
    return nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      },
      family: 4, // Force IPv4 (Fixes some cloud deployment ETIMEDOUT issues)
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 30000,
      socketTimeout: 30000,
      debug: true // Enable debug logs
    });
  }

  // SendGrid Fallback
  else if (process.env.SENDGRID_API_KEY) {
    console.log('✅ Email service configured using: SendGrid API');
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  // Fallback to Gmail SMTP if nothing else matches
  console.log('⚠️ Email service fallback: Gmail SMTP (Check your .env if this is unintentional)');
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER, // fallback
      pass: process.env.SMTP_PASS, // fallback
    },
  });
};

// ... Email templates code below (keeping it same)
const emailTemplates = {
  // Order Confirmation Email
  orderConfirmation: (order) => {
    const products = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br/>
          Quantity: ${item.quantity} × ৳${item.price}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ৳${item.quantity * item.price}
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #7b1230 0%, #c41e3a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #7b1230; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for shopping at RongRani</p>
          </div>
          <div class="content">
            <h2>Hello ${order.name || 'Customer'}!</h2>
            <p>Your order has been successfully placed. We're excited to prepare your handmade gifts with love! ❤️</p>
            
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderId}</p>
            <p><strong>Total Amount:</strong> ৳${order.total}</p>
            
            <h3>Items</h3>
            <table>
              ${products}
              <tr style="background: #f9f9f9; font-weight: bold;">
                <td style="padding: 15px;">Total</td>
                <td style="padding: 15px; text-align: right;">৳${order.total}</td>
              </tr>
            </table>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/profile/orders/${order.orderId}" class="button">
                Track Your Order
              </a>
            </center>
          </div>
          <div class="footer">
            <p><strong>Need Help?</strong></p>
            <p>📞 Call us: 01851075537</p>
            <p>📧 Email: info@rongrani.com</p>
            <p>💬 WhatsApp: +8801851075537</p>
            <p style="margin-top: 20px; color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} RongRani. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  // Order Status Update Email
  orderStatusUpdate: (data) => {
    const { order, status } = data;
    const statusMessages = {
      processing: { emoji: '⏳', title: 'Order is Being Processed', message: 'We are preparing your order with care!' },
      shipped: { emoji: '🚚', title: 'Order Shipped!', message: 'Your order is on its way to you!' },
      delivered: { emoji: '✅', title: 'Order Delivered!', message: 'Your order has been delivered. Enjoy!' },
      cancelled: { emoji: '❌', title: 'Order Cancelled', message: 'Your order has been cancelled.' },
    };

    const statusInfo = statusMessages[status] || statusMessages.processing;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #7b1230 0%, #c41e3a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #7b1230; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          .status-badge { display: inline-block; padding: 10px 20px; background: #7b1230; color: white; border-radius: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${statusInfo.emoji} ${statusInfo.title}</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.name || 'Customer'}!</h2>
            <p>${statusInfo.message}</p>
            
            <p><strong>Order Number:</strong> ${data.orderId}</p>
            <p><strong>Order Status:</strong> <span class="status-badge">${status.toUpperCase()}</span></p>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/profile/orders/${data.orderId}" class="button">
                View Order Details
              </a>
            </center>
          </div>
          <div class="footer">
            <p><strong>Questions?</strong></p>
            <p>📞 01851075537 | 📧 info@rongrani.com</p>
            <p style="margin-top: 20px; color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} RongRani. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  // Welcome Email
  welcome: (user) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7b1230 0%, #c41e3a 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #7b1230; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎁 Welcome to RongRani!</h1>
          <p>Bangladesh's Favorite Handmade Gift Shop</p>
        </div>
        <div class="content">
          <h2>Hello ${user.name}!</h2>
          <p>Thank you for joining RongRani family! We're thrilled to have you here. ❤️</p>
          
          <center>
            <a href="${process.env.FRONTEND_URL}/shop" class="button">
              Start Shopping
            </a>
          </center>
        </div>
        <div class="footer">
          <p>📞 01851075537 | 📧 info@rongrani.com</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Review Request Email
  reviewRequest: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7b1230 0%, #c41e3a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #7b1230; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .star { color: #FFD700; font-size: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⭐ How was your experience?</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.name || 'Customer'}!</h2>
          <p>We hope you are loving your items from RongRani! ❤️</p>
          <p>Your feedback means the world to us and helps others shop with confidence. Would you mind taking a moment to review your purchase?</p>
          
          <center>
            <p class="star">★★★★★</p>
            <a href="${process.env.FRONTEND_URL}/profile/orders/${data.orderId}" class="button">
              Write a Review
            </a>
          </center>
        </div>
        <div class="footer">
          <p>Thank you for supporting handmade!</p>
          <p>📞 01851075537 | 📧 info@rongrani.com</p>
        </div>
      </div>
    </body>
    </html>
  `
};

// Send email function
const sendEmail = async (to, subject, template, data, attachments = []) => {
  try {
    const transporter = createTransporter();

    // Verify connection configuration
    try {
      await transporter.verify();
      console.log('✅ Email Server is ready to take our messages');
    } catch (verifyError) {
      console.error('❌ Email Server Verify Error:', verifyError);
      // Don't return here, try sending anyway as verify might fail on some providers but send still works
    }

    // Handle template selection
    let htmlContent;
    if (typeof template === 'string' && emailTemplates[template]) {
      htmlContent = emailTemplates[template](data);
    } else {
      // If template is not found, assume 'template' is the message body or handle error
      htmlContent = typeof template === 'function' ? template(data) : template;
    }

    // Ensure we have a valid FROM field
    // Brevo requires a verified sender
    const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@rongrani.com';
    const fromName = process.env.FROM_NAME || process.env.EMAIL_FROM_NAME || 'RongRani';

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html: htmlContent,
      attachments
    };

    console.log(`📧 Attempting to send email to: ${to} from: ${fromEmail}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    // Log detailed error for debugging
    if (error.response) {
      console.error('Response:', error.response);
    }
    return { success: false, error: error.message };
  }
};

// Helper functions for specific emails (Using CommonJS exports)
const sendOrderConfirmation = (orderData, attachments = []) => {
  // Normalize data structure if needed
  // Handle Mongoose document (toObject) or plain object
  const order = orderData.toObject ? orderData.toObject() : orderData;

  const customerName = order.user?.name || order.guestInfo?.name || order.billingAddress?.name || 'Customer';
  const customerEmail = order.user?.email || order.guestInfo?.email || order.billingAddress?.email || order.shippingAddress?.email;

  const data = {
    name: customerName,
    orderId: order.orderNumber || order._id,
    total: order.total,
    items: order.items || []
  };

  if (!customerEmail) {
    console.error('❌ No email found for order:', order._id);
    return Promise.resolve({ success: false, error: 'No email found' });
  }

  return sendEmail(
    customerEmail,
    `Order Confirmation - ${data.orderId}`,
    'orderConfirmation',
    data,
    attachments
  );
};

const sendOrderStatusUpdate = (email, name, orderId, status, trackingNumber) => {
  return sendEmail(
    email,
    `Order Status Update - ${orderId}`,
    'orderStatusUpdate',
    { name, orderId, status, trackingNumber }
  );
};


const sendReviewRequest = (email, name, orderId) => {
  return sendEmail(
    email,
    `Rate your experience with RongRani! ⭐`,
    'reviewRequest',
    { name, orderId }
  );
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendReviewRequest
};
