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
// Helper to wrap content in a premium design with animations
const emailBaseTemplate = (title, content, preheader = '') => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://rongrani.vercel.app';
  const logoUrl = `${frontendUrl}/RongRani-Circle.png`;
  const maroon = '#8B2635';
  const gold = '#D4AF37';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
        
        body { 
          font-family: 'Outfit', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
          line-height: 1.6; 
          color: #1e293b; 
          margin: 0; 
          padding: 0; 
          background-color: #f1f5f9; 
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .wrapper { 
          width: 100%; 
          max-width: 600px; 
          margin: 40px auto; 
          background-color: #ffffff; 
          overflow: hidden; 
          border-radius: 24px; 
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: fadeIn 0.8s ease-out;
        }

        .header { 
          background: linear-gradient(135deg, ${maroon} 0%, #4a0e16 100%); 
          padding: 60px 20px; 
          text-align: center; 
          color: #ffffff;
          position: relative;
        }

        .logo { 
          width: 90px; 
          height: 90px; 
          margin-bottom: 20px; 
          border-radius: 50%; 
          border: 4px solid rgba(255,255,255,0.3); 
          box-shadow: 0 15px 30px rgba(0,0,0,0.3);
          animation: pulse 3s infinite ease-in-out;
        }

        .brand-name { 
          font-size: 32px; 
          font-weight: 800; 
          letter-spacing: -0.05em; 
          margin: 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .content { 
          padding: 50px 40px; 
          background: radial-gradient(circle at top right, rgba(139, 38, 53, 0.03), transparent 300px);
        }

        .footer { 
          background-color: #f8fafc; 
          padding: 50px 20px; 
          text-align: center; 
          border-top: 1px solid #e2e8f0;
        }

        .social-links { margin: 30px 0; }
        .social-icon { 
          display: inline-block; 
          margin: 0 15px; 
          width: 44px; 
          height: 44px; 
          line-height: 44px; 
          border-radius: 14px; 
          background-color: #ffffff; 
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          transition: transform 0.2s ease;
        }

        .btn { 
          display: inline-block; 
          padding: 16px 36px; 
          background: linear-gradient(to right, ${maroon}, #5d1a24); 
          color: #ffffff !important; 
          text-decoration: none; 
          border-radius: 16px; 
          font-weight: 700; 
          margin-top: 30px; 
          box-shadow: 0 10px 15px -3px rgba(139, 38, 53, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 14px;
        }

        .order-table { 
          width: 100%; 
          border-collapse: separate; 
          border-spacing: 0 8px;
          margin: 30px 0; 
        }

        .order-table th { 
          color: #64748b; 
          padding: 0 12px 12px; 
          font-size: 12px; 
          text-align: left; 
          text-transform: uppercase; 
          letter-spacing: 0.1em;
          font-weight: 800;
        }

        .order-table td { 
          padding: 20px 15px; 
          background-color: #f8fafc;
          border: none;
        }
        
        .order-table tr td:first-child { border-radius: 12px 0 0 12px; }
        .order-table tr td:last-child { border-radius: 0 12px 12px 0; }

        .contact-info { 
          font-size: 14px; 
          color: #64748b; 
          margin-top: 25px; 
          line-height: 1.8;
          font-weight: 500;
        }

        .preheader { display: none; max-height: 0px; overflow: hidden; }
        
        .badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .badge-maroon { background-color: rgba(139, 38, 53, 0.1); color: ${maroon}; }
      </style>
    </head>
    <body>
      ${preheader ? `<span class="preheader">${preheader}</span>` : ''}
      <div class="wrapper">
        <div class="header">
          <img src="${logoUrl}" alt="RongRani Logo" class="logo">
          <h1 class="brand-name">Rong<span style="color: ${gold};">Rani</span></h1>
          <p style="margin-top: 12px; opacity: 0.9; font-weight: 600; font-size: 16px; letter-spacing: 0.1em;">PREMIUM HANDCRAFTED GIFTS ✨</p>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <h3 style="margin: 0; color: #1e293b; font-weight: 800; font-size: 20px;">Join Our Community</h3>
          <p style="color: #64748b; font-size: 14px; margin-top: 8px;">Follow us for daily inspiration and exclusive offers</p>
          <div class="social-links">
            <a href="https://facebook.com/rongrani" class="social-icon"><img src="https://cdn-icons-png.flaticon.com/512/124/124010.png" width="22" style="vertical-align: middle;"></a>
            <a href="https://instagram.com/rongrani" class="social-icon"><img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" width="22" style="vertical-align: middle;"></a>
            <a href="https://wa.me/8801851075537" class="social-icon"><img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="22" style="vertical-align: middle;"></a>
          </div>
          <div class="contact-info">
            <strong style="color: #1e293b; font-size: 16px;">RongRani Bangladesh</strong><br>
            Chattogram, Bangladesh<br>
            <div style="margin-top: 15px;">
              <span style="margin: 0 10px;">📞 +880 1851-075537</span> | <span style="margin: 0 10px;">✉️ info.rongrani@gmail.com</span>
            </div>
            <a href="${frontendUrl}" style="color: ${maroon}; text-decoration: none; font-weight: 800; font-size: 15px; display: block; margin-top: 15px;">www.rongrani.com</a>
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin-top: 40px; font-weight: 500; letter-spacing: 0.05em;">
            &copy; ${new Date().getFullYear()} RongRani. All rights reserved.<br>
            Crafted with passion for your special moments.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email templates
const emailTemplates = {
  // Order Confirmation Email
  orderConfirmation: (order) => {
    const products = order.items.map(item => `
      <tr>
        <td>
          <div style="font-weight: 600; color: #1e293b; font-size: 15px;">${item.name}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Quantity: ${item.quantity}</div>
        </td>
        <td style="text-align: right; font-weight: 800; color: #1e293b;">
          ৳ ${(item.quantity * item.price).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const shipping = order.shippingAddress || {};
    const address = `${shipping.street || ''} ${shipping.city || ''} ${shipping.zipCode ? '- ' + shipping.zipCode : ''}, Bangladesh`.trim();
    const trackingQuery = order.customerEmail ? `?email=${encodeURIComponent(order.customerEmail)}` : '';

    const content = `
      <div style="text-align: center; margin-bottom: 40px;">
        <div class="badge badge-maroon" style="margin-bottom: 15px;">Success</div>
        <h2 style="color: #1e293b; font-size: 28px; font-weight: 800; margin: 0;">Order Confirmed! 🎉</h2>
        <p style="font-size: 16px; color: #64748b; margin-top: 10px;">Hello ${order.name}, we've received your order and we're getting it ready.</p>
      </div>
      
      <div style="background-color: #f8fafc; border-radius: 20px; padding: 30px; text-align: center; border: 1px solid #e2e8f0;">
        <div style="color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em; margin-bottom: 5px;">Tracking Number</div>
        <div style="font-size: 24px; font-weight: 900; color: #8B2635;">#${order.orderId}</div>
      </div>

      <h3 style="color: #1e293b; font-size: 18px; font-weight: 800; margin-top: 50px; margin-bottom: 20px;">What's inside:</h3>
      <table class="order-table">
        <thead>
          <tr>
            <th>Item Details</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${products}
        </tbody>
      </table>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px dashed #e2e8f0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #64748b; font-weight: 600;">Subtotal</span>
          <span style="color: #1e293b; font-weight: 700;">৳ ${order.subtotal?.toFixed(2) || '0.00'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #64748b; font-weight: 600;">Shipping</span>
          <span style="color: #1e293b; font-weight: 700;">৳ ${order.shipping?.toFixed(2) || '0.00'}</span>
        </div>
        ${order.discount > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #10b981;">
            <span style="font-weight: 600;">Discount</span>
            <span style="font-weight: 700;">- ৳ ${order.discount?.toFixed(2)}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; margin-top: 20px; font-size: 24px;">
          <span style="color: #1e293b; font-weight: 800;">Total</span>
          <span style="color: #8B2635; font-weight: 900;">৳ ${order.total?.toFixed(2) || '0.00'}</span>
        </div>
      </div>

      <div style="background: linear-gradient(to bottom right, #ffffff, #f8fafc); border: 1px solid #e2e8f0; border-radius: 20px; padding: 25px; margin-top: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <h4 style="margin: 0 0 15px 0; color: #1e293b; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Shipping Details</h4>
        <p style="margin: 0; color: #475569; font-size: 15px; line-height: 1.8;">
          <strong style="color: #1e293b;">${order.name}</strong><br>
          ${address}<br>
          <span style="color: #8B2635; font-weight: 600;">📞 ${shipping.phone || ''}</span>
        </p>
      </div>

      <center style="margin-top: 50px;">
        <a href="${process.env.FRONTEND_URL}/order-tracking/${order.orderId}${trackingQuery}" class="btn">Track Package �</a>
      </center>
    `;

    return emailBaseTemplate(`Order Confirmation #${order.orderId}`, content, `Exciting news! Your order #${order.orderId} is confirmed.`);
  },

  // 2. Order Status Update Email
  orderStatusUpdate: (data) => {
    const statusMessages = {
      processing: {
        emoji: '⏳',
        badge: 'Preparation',
        title: 'We are crafting your order',
        message: 'Great news! Your handcrafted items are now in production. We are paying attention to every detail! ❤️'
      },
      shipped: {
        emoji: '🚚',
        badge: 'In Transit',
        title: 'Your parcel is on its way!',
        message: 'Good news! Your order has been shipped and is heading towards your doorstep.'
      },
      delivered: {
        emoji: '✅',
        badge: 'Delivered',
        title: 'Package Delivered!',
        message: 'Your items have been delivered safely. We can\'t wait for you to see them!'
      },
      cancelled: {
        emoji: '❌',
        badge: 'Cancelled',
        title: 'Order Cancelled',
        message: 'Your order has been cancelled. If this was a mistake, please contact us.'
      },
    };

    const statusInfo = statusMessages[data.status] || statusMessages.processing;

    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div class="badge badge-maroon">${statusInfo.badge}</div>
        <h2 style="color: #1e293b; font-size: 26px; font-weight: 800; margin: 15px 0;">${statusInfo.emoji} ${statusInfo.title}</h2>
        <p style="font-size: 16px; color: #64748b;">Hello <strong>${data.name}</strong>, ${statusInfo.message}</p>
      </div>
      
      <div style="background-color: #f8fafc; border-radius: 20px; padding: 35px; margin: 30px 0; text-align: center; border: 1px solid #e2e8f0; position: relative; overflow: hidden;">
        <div style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.15em;">Current Status</div>
        <div style="font-size: 28px; font-weight: 900; color: #8B2635; margin: 10px 0; text-transform: uppercase;">${data.status}</div>
        <div style="height: 2px; width: 40px; background: #8B2635; margin: 15px auto;"></div>
        <div style="color: #64748b; font-size: 14px; font-weight: 600;">Ref: #${data.orderId}</div>
      </div>

      ${data.trackingNumber ? `
        <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #10b981; border-radius: 20px; padding: 25px; margin-bottom: 30px; text-align: center;">
          <p style="margin: 0; color: #065f46; font-size: 15px; font-weight: 700;">
            <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" width="20" style="vertical-align: middle; margin-right: 10px;">
            Tracking: ${data.trackingNumber}
          </p>
        </div>
      ` : ''}

      <center>
        <a href="${process.env.FRONTEND_URL}/order-tracking/${data.orderId}${data.trackingQuery || ''}" class="btn">View Live Progress</a>
      </center>
    `;

    return emailBaseTemplate(`Order Update - #${data.orderId}`, content, `Your order status has been updated to ${data.status}.`);
  },

  // 3. Welcome Email
  welcome: (user) => {
    const content = `
      <div style="text-align: center; margin-bottom: 35px;">
        <div class="badge badge-maroon">Join The Family</div>
        <h2 style="color: #1e293b; font-size: 30px; font-weight: 800; margin: 15px 0;">Welcome to RongRani! 🎁</h2>
        <p style="font-size: 16px; color: #64748b;">Hello <strong>${user.name}</strong>, we're absolutely thrilled to have you here.</p>
      </div>

      <div style="background-color: #ffffff; border: 2px solid #f1f5f9; border-radius: 24px; padding: 30px; margin-bottom: 40px;">
        <p style="font-size: 15px; color: #475569; line-height: 1.8; margin-bottom: 20px;">
          At RongRani, every piece is more than just a gift—it's a story. We handcraft each item with passion, ensuring your special moments are celebrated with elegance.
        </p>

        <div style="background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%); border-radius: 20px; padding: 30px; border: 1px dashed #fda4af; text-align: center;">
          <div style="font-size: 12px; font-weight: 800; color: #9f1239; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;">Your Welcome Gift</div>
          <div style="font-size: 18px; color: #be123c; font-weight: 700; margin-bottom: 15px;">Get 10% OFF your first order!</div>
          <div style="display: inline-block; background-color: #ffffff; padding: 12px 25px; border-radius: 12px; font-family: monospace; font-size: 22px; font-weight: 800; color: #8B2635; border: 2px solid #8B2635;">WELCOME10</div>
        </div>
      </div>

      <center>
        <a href="${process.env.FRONTEND_URL}/shop" class="btn">Start Your Story 🌸</a>
      </center>
    `;

    return emailBaseTemplate('Welcome to the Family! 💖', content, 'Welcome to RongRani family! Claim your 10% discount inside.');
  },

  // 4. Admin Order Notification
  adminOrderNotification: (data) => {
    const products = (data.items || []).map(item => `
      <tr>
        <td style="padding: 15px; background: #ffffff;">
          <div style="font-weight: 700; color: #1e293b;">${item.name}</div>
          <div style="font-size: 12px; color: #64748b;">Qty: ${item.quantity} units</div>
        </td>
        <td style="padding: 15px; text-align: right; font-weight: 800; color: #8B2635; background: #ffffff;">
          ৳ ${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const content = `
      <div style="background: #fff4f6; border-radius: 16px; padding: 20px; border-left: 5px solid #8B2635; margin-bottom: 30px;">
        <h2 style="color: #8B2635; font-size: 22px; font-weight: 800; margin: 0;">🚨 New Order Received!</h2>
        <p style="margin-top: 5px; color: #475569; font-weight: 600;">Time to ship: Order #${data.orderId}</p>
      </div>
      
      <div style="background-color: #f8fafc; border-radius: 20px; padding: 25px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
        <h4 style="margin: 0 0 15px 0; color: #64748b; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em; font-weight: 800;">Customer Information</h4>
        <div style="color: #1e293b; line-height: 1.8;">
          <div style="font-weight: 800; font-size: 16px;">${data.customerName}</div>
          <div>📧 ${data.customerEmail}</div>
          <div>📞 ${data.customerPhone || 'N/A'}</div>
          <div style="margin-top: 10px; color: #475569; font-size: 13px;">📍 ${data.shippingAddress}</div>
        </div>
      </div>

      <table class="order-table" style="background-color: #e2e8f0;">
        <thead>
          <tr>
            <th style="padding: 12px; color: #475569;">Item</th>
            <th style="padding: 12px; text-align: right; color: #475569;">Revenue</th>
          </tr>
        </thead>
        <tbody>
          ${products}
        </tbody>
      </table>
      
      <div style="text-align: right; padding: 20px; background: #f8fafc; border-radius: 0 0 20px 20px; border: 1px solid #e2e8f0;">
        <span style="color: #64748b; font-weight: 700; font-size: 14px;">Total Order Value</span><br>
        <span style="color: #8B2635; font-size: 28px; font-weight: 900;">৳ ${data.total}</span>
      </div>

      <center style="margin-top: 40px;">
        <a href="${process.env.FRONTEND_URL}/admin/orders/${data.orderId}" class="btn">Manage Order</a>
      </center>
    `;

    return emailBaseTemplate(`Alert: New Order #${data.orderId}`, content, `New order received from ${data.customerName}.`);
  },

  // 5. Review Request Email
  reviewRequest: (data) => {
    const content = `
      <div style="text-align: center; margin-bottom: 35px;">
        <div class="badge badge-maroon">Feedback</div>
        <h2 style="color: #1e293b; font-size: 28px; font-weight: 800; margin: 15px 0;">How did we do? ⭐</h2>
        <p style="font-size: 16px; color: #64748b;">Hello <strong>${data.name}</strong>, we hope you're loving your purchase!</p>
      </div>
      
      <p style="font-size: 15px; color: #475569; line-height: 1.8; text-align: center; max-width: 400px; margin: 0 auto;">
        Your feedback is the heart of RongRani. It helps us grow and helps others shop with confidence. Would you mind sharing your experience?
      </p>

      <center style="margin: 50px 0;">
        <div style="font-size: 48px; letter-spacing: 10px; margin-bottom: 30px; text-shadow: 0 4px 6px rgba(0,0,0,0.1);">⭐⭐⭐⭐⭐</div>
        <a href="${process.env.FRONTEND_URL}/order-tracking/${data.orderId}${data.trackingQuery || ''}" class="btn">Share Your Story</a>
      </center>
      
      <div style="background-color: #f1f5f9; border-radius: 16px; padding: 20px; text-align: center;">
        <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 600;">
          📸 Share a photo in your review for a chance to be featured on our Instagram!
        </p>
      </div>
    `;

    return emailBaseTemplate('Your feedback matters! ❤️', content, 'We would love to hear your feedback on your recent purchase.');
  },

  // 6. Low Stock Alert (Admin)
  lowStockAlert: (data) => {
    const content = `
      <div style="background: #fef2f2; border-radius: 16px; padding: 20px; border-left: 5px solid #dc2626; margin-bottom: 30px;">
        <h2 style="color: #dc2626; font-size: 22px; font-weight: 800; margin: 0;">⚠️ Low Stock Alert</h2>
        <p style="margin-top: 5px; color: #991b1b; font-weight: 600;">Inventory needs attention!</p>
      </div>
      
      <div style="background-color: #ffffff; border: 2px solid #fee2e2; border-radius: 24px; padding: 40px; text-align: center; margin: 30px 0;">
        <div style="color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em; margin-bottom: 10px;">Product Name</div>
        <h3 style="margin: 0; color: #1e293b; font-size: 22px; font-weight: 800;">${data.name}</h3>
        
        <div style="font-size: 48px; font-weight: 900; color: #dc2626; margin: 25px 0;">${data.stock}</div>
        <div style="font-size: 14px; color: #991b1b; font-weight: 700; text-transform: uppercase;">Units Remaining</div>
        
        <div style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #fee2e2; color: #64748b; font-size: 13px;">
          Product ID: <span style="font-family: monospace;">${data._id}</span>
        </div>
      </div>

      <center>
        <a href="${process.env.FRONTEND_URL}/admin/products" class="btn" style="background: #dc2626; box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.4);">Restock Inventory</a>
      </center>
    `;

    return emailBaseTemplate(`Critical: Low Stock [${data.name}]`, content, `Action required: ${data.name} has only ${data.stock} units left.`);
  },
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
