const nodemailer = require('nodemailer');

// Email transporter configuration
const createTransporter = () => {
  // Check for Brevo (Sendinblue) Configuration
  const smtpHost = process.env.SMTP_HOST || process.env.BREVO_SMTP_HOST;
  let smtpPort = process.env.SMTP_PORT || process.env.BREVO_SMTP_PORT || 587;

  // Gmail detection
  if (smtpHost && smtpHost.includes('gmail.com')) {
    console.log('📧 Gmail detected, applying Gmail optimization...');
    smtpPort = 587;
  }
  // FORCE PORT 2525 for Brevo on Cloud environments
  else if (smtpHost && smtpHost.includes('brevo.com')) {
    console.log('🚀 Brevo detected, forcing Port 2525 for better reliability...');
    smtpPort = 2525;
  }

  const smtpUser = process.env.SMTP_USER || process.env.BREVO_SMTP_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.BREVO_SMTP_PASS;

  console.log('🔍 Checking Email Config:');
  console.log('Host:', smtpHost);
  console.log('Port:', smtpPort);
  console.log('User:', smtpUser);

  if (smtpHost && smtpUser && smtpPass) {
    const isGmail = smtpHost.includes('gmail.com');
    console.log(`✅ Configuring Email Service: ${isGmail ? 'Gmail' : 'SMTP'} on Port ${smtpPort}`);

    return nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: isGmail ? false : (smtpPort == 465), // Gmail usually uses 587/false or 465/true
      service: isGmail ? 'gmail' : undefined, // Explicitly set gmail service if detected
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
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <div style="font-weight: bold; color: #333;">${item.name}</div>
          ৳ ${(item.quantity * item.price).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const shipping = order.shippingAddress || {};
    const address = `${shipping.street}, ${shipping.city}${shipping.zipCode ? ' - ' + shipping.zipCode : ''}, ${shipping.country || 'Bangladesh'}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; padding: 0; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
          .header { background: #8B1538; color: white; padding: 40px 20px; text-align: center; }
          .content { background: #fff; padding: 30px; }
          .footer { background: #f9f9f9; padding: 30px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #eee; }
          .order-box { background: #fff9fa; border: 1px solid #ffebeb; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .button { display: inline-block; padding: 14px 35px; background: #8B1538; color: white !important; text-decoration: none; border-radius: 50px; font-weight: bold; margin: 25px 0; }
          .total-table { width: 100%; margin-top: 20px; border-top: 2px solid #8B1538; }
          .total-row td { padding: 10px 0; }
          .grand-total { font-size: 18px; color: #8B1538; font-weight: 800; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${process.env.FRONTEND_URL || 'https://rongrani.com'}/RongRani-Circle.png" alt="RongRani Logo" style="width: 80px; height: 80px; margin-bottom: 15px;" />
            <h1 style="margin:0; font-size: 28px;">Thank You!</h1>
            <p style="margin:5px 0 0; opacity: 0.9;">Your order #${(order.orderNumber || order._id).toString().substring(0, 8).toUpperCase()} is confirmed</p>
          </div>
          <div class="content">
            <h2 style="color: #8B1538; margin-top: 0;">Hello ${order.name || 'Customer'},</h2>
            <p>We've received your order and our team is already working on preparing it with love. Here's a summary of your purchase:</p>
            
            <div class="order-box">
              <h3 style="margin-top:0; border-bottom: 1px solid #eee; padding-bottom: 10px; font-size: 16px;">Delivery Address</h3>
              <p style="margin: 5px 0;"><strong>${shipping.name}</strong></p>
              <p style="margin: 5px 0; font-size: 14px; color: #555;">${address}</p>
              <p style="margin: 5px 0; font-size: 14px; color: #555;">📞 ${shipping.phone}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="color: #8B1538; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                  <th style="text-align: left; padding: 10px 0;">Product</th>
                  <th style="text-align: right; padding: 10px 0;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${products}
              </tbody>
            </table>

            <table class="total-table">
              <tr class="total-row">
                <td style="color: #666;">Subtotal</td>
                <td style="text-align: right; font-weight: bold;">৳ ${order.subtotal?.toFixed(2) || order.total}</td>
              </tr>
              ${order.shipping > 0 ? `
              <tr class="total-row">
                <td style="color: #666;">Shipping Fee</td>
                <td style="text-align: right; font-weight: bold;">৳ ${order.shipping.toFixed(2)}</td>
              </tr>` : ''}
              ${order.discount > 0 ? `
              <tr class="total-row">
                <td style="color: #666;">Discount</td>
                <td style="text-align: right; font-weight: bold; color: #16a34a;">-৳ ${order.discount.toFixed(2)}</td>
              </tr>` : ''}
              <tr class="total-row grand-total">
                <td>Total Amount</td>
                <td style="text-align: right;">৳ ${order.total.toFixed(2)}</td>
              </tr>
            </table>
            
            <p style="font-size: 14px; margin-top: 20px; color: #666;"><strong>Payment Method:</strong> ${order.paymentMethod?.toUpperCase()}</p>

            <center>
              <a href="${process.env.FRONTEND_URL}/track/${order._id}${order.trackingQuery || ''}" class="button">
                Track My Parcel 🚚
              </a>
            </center>
          </div>
          <div class="footer">
            <p style="font-weight: bold; margin-bottom: 10px;">RongRani - Premium Handcrafted Gifts</p>
            <p>Cox's Bazar, Bangladesh</p>
            <p>📞 01851075537 | 📧 info.rongrani@gmail.com</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
               <p>© ${new Date().getFullYear()} RongRani. All rights reserved.</p>
               <div style="margin-top: 15px;">
                  <a href="https://facebook.com/rongrani" style="text-decoration: none; margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/32/733/733547.png" alt="Facebook" width="24" height="24"></a>
                  <a href="https://instagram.com/rongrani" style="text-decoration: none; margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/32/2111/2111463.png" alt="Instagram" width="24" height="24"></a>
                  <a href="https://wa.me/8801851075537" style="text-decoration: none; margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/32/733/733585.png" alt="WhatsApp" width="24" height="24"></a>
               </div>
            </div>
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
            <img src="${process.env.FRONTEND_URL || 'https://rongrani.com'}/RongRani-Circle.png" alt="RongRani Logo" style="width: 80px; height: 80px; margin-bottom: 10px;" />
            <h1>${statusInfo.emoji} ${statusInfo.title}</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.name || 'Customer'}!</h2>
            <p>${statusInfo.message}</p>
            
            <p><strong>Order Number:</strong> ${data.orderId}</p>
            <p><strong>Order Status:</strong> <span class="status-badge">${status.toUpperCase()}</span></p>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/track/${data.orderId}${data.trackingQuery || ''}" class="button">
                View Order Details
              </a>
            </center>
          </div>
          <div class="footer">
            <p><strong>Questions?</strong></p>
            <p>📞 01851075537 | 📧 info.rongrani@gmail.com</p>
            <p style="margin-top: 20px; color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} RongRani. All rights reserved.
            </p>
            <div style="margin-top: 15px;">
              <a href="https://facebook.com/rongrani" style="text-decoration: none; margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/32/733/733547.png" alt="Facebook" width="24" height="24"></a>
              <a href="https://instagram.com/rongrani" style="text-decoration: none; margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/32/2111/2111463.png" alt="Instagram" width="24" height="24"></a>
              <a href="https://wa.me/8801851075537" style="text-decoration: none; margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/32/733/733585.png" alt="WhatsApp" width="24" height="24"></a>
            </div>
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
          <img src="${process.env.FRONTEND_URL || 'https://rongrani.com'}/RongRani-Circle.png" alt="RongRani Logo" style="width: 100px; height: 100px; margin-bottom: 20px;" />
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
          <p>📞 01851075537 | 📧 info.rongrani@gmail.com</p>
          <div style="margin-top: 15px;">
            <a href="https://facebook.com/rongrani" style="text-decoration: none; margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/32/733/733547.png" alt="Facebook" width="24" height="24"></a>
            <a href="https://instagram.com/rongrani" style="text-decoration: none; margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/32/2111/2111463.png" alt="Instagram" width="24" height="24"></a>
            <a href="https://wa.me/8801851075537" style="text-decoration: none; margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/32/733/733585.png" alt="WhatsApp" width="24" height="24"></a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  // Admin New Order Notification
  adminOrderNotification: (data) => {
    const products = (data.items || []).map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong> x ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ৳ ${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; color: #333; line-height: 1.5; }
          .container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
          .header { background: #8B1538; color: white; padding: 20px; text-align: center; }
          .content { padding: 25px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .info-card { background: #f9f9f9; padding: 15px; border-radius: 5px; }
          .label { font-size: 12px; color: #8B1538; font-weight: bold; text-transform: uppercase; }
          .value { font-size: 14px; margin-top: 5px; font-weight: bold; }
          .btns { text-align: center; margin-top: 20px; }
          .btn { background: #8B1538; color: white !important; padding: 10px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🚨 New Order Received!</h2>
            <p>Order ID: #${data.orderId}</p>
          </div>
          <div class="content">
            <div style="background: #fff4f6; border: 1px solid #ffd6de; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #8B1538;">Customer Information</h3>
              <p><strong>Name:</strong> ${data.customerName}</p>
              <p><strong>Email:</strong> ${data.customerEmail}</p>
              <p><strong>Phone:</strong> ${data.customerPhone}</p>
            </div>

            <h3 style="color: #8B1538;">Delivery Summary</h3>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
               <p><strong>Address:</strong><br/>${data.shippingAddress}</p>
               ${data.giftMessage ? `<p><strong>Gift Message:</strong><br/><em>"${data.giftMessage}"</em></p>` : ''}
            </div>

            <h3 style="color: #8B1538;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${products}
              <tr>
                <td style="padding: 10px; color: #666;">Subtotal</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">৳ ${data.subtotal}</td>
              </tr>
              ${data.shipping > 0 ? `
              <tr>
                <td style="padding: 10px; color: #666;">Shipping Fee</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">৳ ${data.shipping}</td>
              </tr>` : ''}
              ${data.discount > 0 ? `
              <tr>
                <td style="padding: 10px; color: #16a34a;">Discount</td>
                <td style="padding: 10px; text-align: right; font-weight: bold; color: #16a34a;">-৳ ${data.discount}</td>
              </tr>` : ''}
              <tr style="font-weight: bold; font-size: 18px; border-top: 2px solid #8B1538;">
                <td style="padding: 15px 10px;">TOTAL AMOUNT</td>
                <td style="padding: 15px 10px; text-align: right; color: #8B1538;">৳ ${data.total}</td>
              </tr>
            </table>

            <div style="margin: 20px 0; background: #eee; padding: 15px; text-align: center;">
              <p><strong>Payment Method:</strong> ${data.paymentMethod?.toUpperCase()}</p>
              ${data.paymentDetails && (data.paymentDetails.transactionId || data.paymentDetails.senderLastDigits) ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ccc;">
                  ${data.paymentDetails.transactionId ? `<p><strong>TrxID:</strong> ${data.paymentDetails.transactionId}</p>` : ''}
                  ${data.paymentDetails.senderLastDigits ? `<p><strong>Sender:</strong> ...${data.paymentDetails.senderLastDigits}</p>` : ''}
                </div>
              ` : ''}
            </div>

            <div class="btns">
              <a href="${process.env.FRONTEND_URL}/admin/orders/${data.orderId}" class="btn">
                Ship This Order Now 🚀
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  },

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
          <img src="${process.env.FRONTEND_URL || 'https://rongrani.com'}/RongRani-Circle.png" alt="RongRani Logo" style="width: 60px; height: 60px;" />
          <h1>⭐ How was your experience?</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.name || 'Customer'}!</h2>
          <p>We hope you are loving your items from RongRani! ❤️</p>
          <p>Your feedback means the world to us and helps others shop with confidence. Would you mind taking a moment to review your purchase?</p>
          
          <center>
            <p class="star">★★★★★</p>
            <a href="${process.env.FRONTEND_URL}/track/${data.orderId}${data.trackingQuery || ''}" class="button">
              Write a Review
            </a>
          </center>
        </div>
        <div class="footer">
          <p>Thank you for supporting handmade!</p>
          <p>📞 01851075537 | 📧 info.rongrani@gmail.com</p>
        </div>
        <div class="footer">
          <p>Thank you for supporting handmade!</p>
          <p>📞 01851075537 | 📧 info.rongrani@gmail.com</p>
          <div style="margin-top: 15px;">
            <a href="https://facebook.com/rongrani" style="text-decoration: none; margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/32/733/733547.png" alt="Facebook" width="24" height="24"></a>
            <a href="https://instagram.com/rongrani" style="text-decoration: none; margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/32/2111/2111463.png" alt="Instagram" width="24" height="24"></a>
            <a href="https://wa.me/8801851075537" style="text-decoration: none; margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/32/733/733585.png" alt="WhatsApp" width="24" height="24"></a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
  // Low Stock Alert (Admin)
  lowStockAlert: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; }
        .header { background: #fee2e2; color: #991b1b; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; }
        .product-box { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
        .btn { display: inline-block; padding: 10px 20px; background: #991b1b; color: white !important; text-decoration: none; border-radius: 5px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Low Stock Alert</h1>
        </div>
        <div class="content">
          <p>The following product is running low on stock:</p>
          
          <div class="product-box">
            <h3>${data.name}</h3>
            <p><strong>Remaining Stock:</strong> <span style="color: #dc2626; font-weight: bold; font-size: 18px;">${data.stock}</span></p>
            <p><strong>Product ID:</strong> ${data._id}</p>
          </div>

          <p>Please restock this item soon to avoid losing sales.</p>
          
          <center>
            <a href="${process.env.FRONTEND_URL}/admin/products" class="btn">Manage Inventory</a>
          </center>
        </div>
      </div>
    </body>
    </html>
  `
};

// Send email function
const sendEmail = async (to, subject, template, data, attachments = []) => {
  try {
    // 🚀 USE BREVO API IF API KEY IS AVAILABLE (Most reliable for Cloud/Render)
    if (process.env.BREVO_API_KEY) {
      console.log(`🚀 Using Brevo API to send email to: ${to}`);
      const axios = require('axios');

      let htmlContent;
      if (typeof template === 'string' && emailTemplates[template]) {
        htmlContent = emailTemplates[template](data);
      } else {
        htmlContent = typeof template === 'function' ? template(data) : template;
      }

      // Convert attachments to Brevo API format (Base64)
      const formattedAttachments = attachments.map(att => ({
        content: att.content.toString('base64'),
        name: att.filename
      }));

      const adminEmail = process.env.SUPER_ADMIN_EMAIL;

      const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: {
          name: process.env.FROM_NAME || 'RongRani',
          email: process.env.FROM_EMAIL || 'info@rongrani.com'
        },
        to: [{ email: to }],
        bcc: adminEmail ? [{ email: adminEmail }] : undefined, // Add BCC to admin
        subject: subject,
        htmlContent: htmlContent,
        attachment: formattedAttachments.length > 0 ? formattedAttachments : undefined
      }, {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Email sent successfully via Brevo API:', response.data.messageId);
      return { success: true, messageId: response.data.messageId };
    }

    // 🕊️ FALLBACK TO SMTP (Current method)
    console.log('🕊️ No API key found, falling back to SMTP...');
    const transporter = createTransporter();

    // Verify connection configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('⚠️ SMTP Verify failed, attempting to send anyway...');
    }

    let htmlContent;
    if (typeof template === 'string' && emailTemplates[template]) {
      htmlContent = emailTemplates[template](data);
    } else {
      htmlContent = typeof template === 'function' ? template(data) : template;
    }

    const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@rongrani.com';
    const fromName = process.env.FROM_NAME || process.env.EMAIL_FROM_NAME || 'RongRani';

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html: htmlContent,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent via SMTP:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email failed:', error.response?.data || error.message);
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
    ...order,
    name: customerName,
    orderId: order.orderNumber || order._id,
    total: order.total,
    subtotal: order.subtotal,
    shipping: order.shipping,
    discount: order.discount,
    items: order.items || [],
    shippingAddress: order.shippingAddress
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

const sendOrderStatusUpdate = (email, name, orderId, status, trackingNumber, trackingQuery) => {
  return sendEmail(
    email,
    `Order Status Update - ${orderId}`,
    'orderStatusUpdate',
    { name, orderId, status, trackingNumber, trackingQuery }
  );
};


const sendReviewRequest = (email, name, orderId, trackingQuery) => {
  return sendEmail(
    email,
    `Rate your experience with RongRani! ⭐`,
    'reviewRequest',
    { name, orderId, trackingQuery }
  );
};

const sendLowStockAlert = (product) => {
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || process.env.SMTP_USER || 'info.rongrani@gmail.com';
  console.log(`⚠️ Sending Low Stock Alert for ${product.name} to ${adminEmail}`);
  return sendEmail(
    adminEmail,
    `⚠️ Low Stock: ${product.name} (${product.stock} left)`,
    'lowStockAlert',
    product
  );
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendReviewRequest,
  sendLowStockAlert
};
