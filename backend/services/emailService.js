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
// Helper to wrap content in a premium design
const emailBaseTemplate = (title, content, preheader = '') => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://rongrani.vercel.app';
  const logoUrl = `${frontendUrl}/RongRani-Circle.png`;
  const maroon = '#8B2635';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #f8fafc; }
        .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden; border-radius: 16px; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, ${maroon} 0%, #5d1a24 100%); padding: 40px 20px; text-align: center; color: #ffffff; }
        .logo { width: 80px; height: 80px; margin-bottom: 15px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.2); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); }
        .brand-name { font-size: 28px; font-weight: 800; letter-spacing: -0.025em; margin: 0; }
        .content { padding: 40px 30px; }
        .footer { background-color: #f1f5f9; padding: 40px 20px; text-align: center; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px; }
        .social-links { margin: 20px 0; }
        .social-icon { display: inline-block; margin: 0 12px; width: 36px; height: 36px; line-height: 36px; border-radius: 50%; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .btn { display: inline-block; padding: 14px 28px; background-color: ${maroon}; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 700; margin-top: 20px; transition: all 0.3s ease; }
        .order-table { width: 100%; border-collapse: collapse; margin: 25px 0; background: #fafafa; border-radius: 12px; overflow: hidden; }
        .order-table th { background-color: #e2e8f0; color: #475569; padding: 12px; font-size: 13px; text-align: left; text-transform: uppercase; letter-spacing: 0.05em; }
        .order-table td { padding: 15px 12px; border-bottom: 1px solid #edf2f7; }
        .contact-info { font-size: 13px; color: #64748b; margin-top: 20px; line-height: 1.8; }
        .preheader { display: none; max-height: 0px; overflow: hidden; }
      </style>
    </head>
    <body>
      ${preheader ? `<span class="preheader">${preheader}</span>` : ''}
      <div class="wrapper">
        <div class="header">
          <img src="${logoUrl}" alt="RongRani Logo" class="logo">
          <h1 class="brand-name">Rong<span style="color: #e2e8f0;">Rani</span></h1>
          <p style="margin-top: 10px; opacity: 0.9; font-weight: 500;">Handcrafted with Love ✨</p>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <h3 style="margin: 0; color: #334155;">Stay Connected</h3>
          <div class="social-links">
            <a href="https://facebook.com/rongrani.bd" class="social-icon"><img src="https://cdn-icons-png.flaticon.com/512/124/124010.png" width="20" style="vertical-align: middle;"></a>
            <a href="https://instagram.com/rongrani.bd" class="social-icon"><img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" width="20" style="vertical-align: middle;"></a>
            <a href="https://wa.me/8801851075537" class="social-icon"><img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="20" style="vertical-align: middle;"></a>
          </div>
          <div class="contact-info">
            <strong>RongRani Bangladesh</strong><br>
            Chattogram, Bangladesh<br>
            📞 +880 1851-075537 | ✉️ info.rongrani@gmail.com<br>
            <a href="${frontendUrl}" style="color: ${maroon}; text-decoration: none; font-weight: bold;">www.rongrani.com</a>
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin-top: 30px;">
            &copy; ${new Date().getFullYear()} RongRani. All rights reserved.<br>
            You received this email because you ordered from our store.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email templates
const emailTemplates = {
  // 1. Order Confirmation Email
  orderConfirmation: (order) => {
    const products = order.items.map(item => `
      <tr>
        <td style="padding: 15px 12px; border-bottom: 1px solid #edf2f7;">
          <div style="font-weight: bold; color: #1e293b; font-size: 15px;">${item.name}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Qty: ${item.quantity} × ৳ ${item.price}</div>
        </td>
        <td style="padding: 15px 12px; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: 700; color: #1e293b;">
          ৳ ${(item.quantity * item.price).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const shipping = order.shippingAddress || {};
    const address = `${shipping.street || ''} ${shipping.city || ''} ${shipping.zipCode ? '- ' + shipping.zipCode : ''}, Bangladesh`.trim();
    const trackingQuery = order.customerEmail ? `?email=${encodeURIComponent(order.customerEmail)}` : '';

    const content = `
      <h2 style="color: #1e293b; font-size: 24px; font-weight: 800; margin-top: 0;">Order Confirmed! 🎉</h2>
      <p style="font-size: 16px; color: #475569;">Hello <strong>${order.name}</strong>, thank you for shopping with us. We've received your order and we're preparing it with love. ❤️</p>
      
      <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border-left: 4px solid #8B2635; margin: 30px 0;">
        <span style="color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Order ID</span><br>
        <span style="font-size: 20px; font-weight: 900; color: #8B2635;">#${order.orderId}</span>
      </div>

      <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 40px;">Order Summary</h3>
      <table class="order-table">
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${products}
          <tr>
            <td style="padding: 20px 12px 10px; text-align: right; color: #64748b; font-weight: 600;">Subtotal</td>
            <td style="padding: 20px 12px 10px; text-align: right; color: #1e293b; font-weight: 600;">৳ ${order.subtotal?.toFixed(2) || '0.00'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 12px; text-align: right; color: #64748b; font-weight: 600;">Shipping</td>
            <td style="padding: 5px 12px; text-align: right; color: #1e293b; font-weight: 600;">৳ ${order.shipping?.toFixed(2) || '0.00'}</td>
          </tr>
          ${order.discount > 0 ? `
            <tr>
              <td style="padding: 5px 12px; text-align: right; color: #10b981; font-weight: 600;">Discount</td>
              <td style="padding: 5px 12px; text-align: right; color: #10b981; font-weight: 600;">- ৳ ${order.discount?.toFixed(2)}</td>
            </tr>
          ` : ''}
          <tr style="font-size: 20px;">
            <td style="padding: 15px 12px; text-align: right; color: #1e293b; font-weight: 800;">Grand Total</td>
            <td style="padding: 15px 12px; text-align: right; color: #8B2635; font-weight: 900;">৳ ${order.total?.toFixed(2) || '0.00'}</td>
          </tr>
        </tbody>
      </table>

      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin-top: 30px;">
        <h4 style="margin: 0 0 10px 0; color: #92400e;">Shipping To:</h4>
        <p style="margin: 0; color: #b45309; font-size: 14px; line-height: 1.6;">
          <strong>${order.name}</strong><br>
          ${address}<br>
          📞 ${shipping.phone || ''}
        </p>
      </div>

      <center>
        <a href="${process.env.FRONTEND_URL}/order-tracking/${order.orderId}${trackingQuery}" class="btn">Track Your Order 📦</a>
      </center>
    `;

    return emailBaseTemplate(`Order Confirmation #${order.orderId}`, content, `Your order #${order.orderId} from RongRani is confirmed!`);
  },

  // 2. Order Status Update Email
  orderStatusUpdate: (data) => {
    const statusMessages = {
      processing: { emoji: '⏳', title: 'Order is Being Processed', message: 'We are preparing your handcrafted items with care! ❤️' },
      shipped: { emoji: '🚚', title: 'Order Shipped!', message: 'Good news! Your order is on its way to you.' },
      delivered: { emoji: '✅', title: 'Order Delivered!', message: 'Your items have been delivered. We hope you love them!' },
      cancelled: { emoji: '❌', title: 'Order Cancelled', message: 'Your order has been cancelled.' },
    };

    const statusInfo = statusMessages[data.status] || statusMessages.processing;

    const content = `
      <h2 style="color: #1e293b; font-size: 24px; font-weight: 800; margin-top: 0;">${statusInfo.emoji} ${statusInfo.title}</h2>
      <p style="font-size: 16px; color: #475569;">Hello <strong>${data.name}</strong>, ${statusInfo.message}</p>
      
      <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; border: 1px solid #e2e8f0;">
        <span style="color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Current Status</span><br>
        <span style="font-size: 22px; font-weight: 900; color: #8B2635; display: block; margin: 10px 0;">${data.status.toUpperCase()}</span>
        <span style="color: #64748b; font-size: 14px;">Order ID: #${data.orderId}</span>
      </div>

      ${data.trackingNumber ? `
        <div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: center;">
          <p style="margin: 0; color: #065f46; font-size: 14px;"><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
        </div>
      ` : ''}

      <center>
        <a href="${process.env.FRONTEND_URL}/order-tracking/${data.orderId}${data.trackingQuery || ''}" class="btn">View Order Status</a>
      </center>
    `;

    return emailBaseTemplate(`Order ${data.status.toUpperCase()} - #${data.orderId}`, content, `Your order #${data.orderId} status has been updated to ${data.status}.`);
  },

  // 3. Welcome Email
  welcome: (user) => {
    const content = `
      <h2 style="color: #1e293b; font-size: 26px; font-weight: 800; margin-top: 0;">Welcome to the Family! 🎁</h2>
      <p style="font-size: 16px; color: #475569;">Hello <strong>${user.name}</strong>, we're absolutely thrilled to have you here at RongRani.</p>
      
      <p style="font-size: 15px; color: #475569; line-height: 1.8;">
        At RongRani, we believe in the magic of handmade gifts. Every item in our shop is crafted with passion and attention to detail, making them perfect for your special moments.
      </p>

      <div style="background: #fff1f2; border-radius: 16px; padding: 25px; margin: 30px 0; border: 1px dashed #fda4af;">
        <h4 style="margin: 0 0 10px 0; color: #9f1239; font-size: 18px;">Special Welcome Gift! 💝</h4>
        <p style="margin: 0; color: #be123c; font-size: 15px;">Use code <strong>WELCOME10</strong> on your first order to get 10% OFF!</p>
      </div>

      <center>
        <a href="${process.env.FRONTEND_URL}/shop" class="btn">Explore Collections 🌸</a>
      </center>
    `;

    return emailBaseTemplate('Welcome to RongRani!', content, 'Welcome to RongRani family! Here is a special gift for you.');
  },

  // 4. Admin Order Notification
  adminOrderNotification: (data) => {
    const products = (data.items || []).map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #edf2f7; color: #1e293b;">
          <strong>${item.name}</strong> x ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: bold; color: #8B2635;">
          ৳ ${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const content = `
      <h2 style="color: #1e293b; font-size: 22px; font-weight: 800; margin-top: 0;">🚨 New Order Received!</h2>
      
      <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin: 25px 0;">
        <h4 style="margin: 0 0 10px 0; color: #475569; text-transform: uppercase; font-size: 12px;">Customer Details</h4>
        <p style="margin: 0; color: #1e293b;">
          <strong>${data.customerName}</strong><br>
          📧 ${data.customerEmail}<br>
          📞 ${data.customerPhone || 'N/A'}<br>
          📍 ${data.shippingAddress}
        </p>
      </div>

      <table class="order-table">
        <tbody>
          ${products}
          <tr style="font-size: 18px; font-weight: 900;">
            <td style="padding: 15px 12px; text-align: right; color: #475569;">Total Revenue</td>
            <td style="padding: 15px 12px; text-align: right; color: #8B2635;">৳ ${data.total}</td>
          </tr>
        </tbody>
      </table>

      <center>
        <a href="${process.env.FRONTEND_URL}/admin/orders/${data.orderId}" class="btn">Manage Order in Dashboard</a>
      </center>
    `;

    return emailBaseTemplate(`New Order Alert #${data.orderId}`, content, `New order received from ${data.customerName}.`);
  },

  // 5. Review Request Email
  reviewRequest: (data) => {
    const content = `
      <h2 style="color: #1e293b; font-size: 24px; font-weight: 800; margin-top: 0;">How did we do? ⭐</h2>
      <p style="font-size: 16px; color: #475569;">Hello <strong>${data.name}</strong>, we hope you're enjoying your recent purchase from RongRani!</p>
      
      <p style="font-size: 15px; color: #475569;">Would you mind taking 30 seconds to share your experience? Your feedback helps us grow and helps others shop with confidence.</p>

      <center style="margin: 40px 0;">
        <div style="font-size: 40px; margin-bottom: 20px;">⭐⭐⭐⭐⭐</div>
        <a href="${process.env.FRONTEND_URL}/order-tracking/${data.orderId}${data.trackingQuery || ''}" class="btn">Write a Review</a>
      </center>
      
      <p style="font-size: 14px; color: #64748b; text-align: center;">Share a photo in your review for a chance to be featured on our Instagram!</p>
    `;

    return emailBaseTemplate('How was your experience?', content, 'We would love to hear your feedback on your recent purchase.');
  },

  // 6. Low Stock Alert (Admin)
  lowStockAlert: (data) => {
    const content = `
      <h2 style="color: #dc2626; font-size: 22px; font-weight: 800; margin-top: 0;">⚠️ Low Stock Alert</h2>
      <p style="font-size: 16px; color: #475569;">The following product is nearly out of stock and needs your attention.</p>
      
      <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
        <h3 style="margin: 0; color: #991b1b; font-size: 20px;">${data.name}</h3>
        <div style="font-size: 32px; font-weight: 900; color: #dc2626; margin: 15px 0;">${data.stock} Units Left</div>
        <p style="margin: 0; color: #b91c1c; font-size: 14px;">Product ID: ${data._id}</p>
      </div>

      <center>
        <a href="${process.env.FRONTEND_URL}/admin/products" class="btn">Update Stock Level</a>
      </center>
    `;

    return emailBaseTemplate(`Low Stock: ${data.name}`, content, `Warning: ${data.name} has only ${data.stock} units left.`);
  },
};

// Send email function
const sendEmail = async (to, subject, template, data, attachments = []) => {
  try {
    // 🚀 USE BREVO API IF API KEY IS AVAILABLE (Most reliable for Cloud/Render)
    if (process.env.BREVO_API_KEY) {
      console.log(`🚀 Using Brevo API to send email to: ${to} `);
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
      from: `"${fromName}" < ${fromEmail}> `,
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
    `Order Confirmation - ${data.orderId} `,
    'orderConfirmation',
    data,
    attachments
  );
};

const sendOrderStatusUpdate = (email, name, orderId, status, trackingNumber, trackingQuery) => {
  return sendEmail(
    email,
    `Order Status Update - ${orderId} `,
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
  console.log(`⚠️ Sending Low Stock Alert for ${product.name} to ${adminEmail} `);
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
