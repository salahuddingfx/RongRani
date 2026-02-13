const nodemailer = require('nodemailer');

// 🏁 INITIALIZATION LOGS
const hasBrevoKey = !!process.env.BREVO_API_KEY;
const smtpHost = process.env.SMTP_HOST || process.env.BREVO_SMTP_HOST;
const smtpUser = process.env.SMTP_USER || process.env.BREVO_SMTP_USER;

if (hasBrevoKey) {
  console.log('✅ Brevo (Sendinblue) API Email Service configured');
} else if (smtpHost && smtpUser) {
  const isGmail = smtpHost.includes('gmail.com');
  console.log(`✅ ${isGmail ? 'Gmail' : 'SMTP'} Email Service configured`);
} else {
  console.log('⚠️  Email Service NOT configured (Missing environment variables)');
}

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
  const gold = '#C5A059'; // Sophisticated muted gold

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        
        body { 
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
          line-height: 1.6; 
          color: #1e293b; 
          margin: 0; 
          padding: 0; 
          background-color: #fcfaf7; 
        }
        
        @keyframes revealUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        .wrapper { 
          width: 100%; 
          max-width: 600px; 
          margin: 40px auto; 
          background-color: #ffffff; 
          overflow: hidden; 
          border-radius: 32px; 
          box-shadow: 0 40px 80px -20px rgba(139, 38, 53, 0.12);
          animation: revealUp 1.2s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(226, 232, 240, 0.6);
        }

        .header { 
          background: linear-gradient(180deg, #2a0a0d 0%, #4a0e16 100%); 
          padding: 60px 20px 40px; 
          text-align: center; 
          color: #ffffff;
          position: relative;
        }

        .logo { 
          width: 80px; 
          height: 80px; 
          margin-bottom: 20px; 
          border-radius: 50%; 
          border: 2px solid ${gold}; 
          background: #ffffff;
          padding: 3px;
          animation: float 4s infinite ease-in-out;
        }

        .brand-name { 
          font-family: 'Playfair Display', serif;
          font-size: 34px; 
          margin: 0;
          letter-spacing: -0.01em;
        }

        .luxury-accent {
          width: 50px;
          height: 1px;
          background: ${gold};
          margin: 15px auto;
        }

        .content { 
          padding: 45px 40px; 
          background: white;
        }

        .h-premium {
          font-family: 'Playfair Display', serif;
          color: #0f172a;
          font-size: 28px;
          margin-bottom: 20px;
          line-height: 1.2;
        }

        .footer { 
          background-color: #0f172a; 
          padding: 50px 30px; 
          text-align: center; 
          color: #f8fafc;
        }

        .social-links { margin: 40px 0; }
        .social-icon { 
          display: inline-block; 
          margin: 0 12px; 
        }

        .btn { 
          display: inline-block; 
          padding: 20px 48px; 
          background: #8B2635; 
          color: #ffffff !important; 
          text-decoration: none; 
          border-radius: 100px; 
          font-weight: 600; 
          margin-top: 40px; 
          box-shadow: 0 20px 30px -10px rgba(139, 38, 53, 0.35);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-size: 13px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .gold-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, ${gold}, transparent);
          margin: 40px 0;
        }

        .contact-info { 
          font-size: 15px; 
          color: #94a3b8; 
          margin-top: 35px; 
          line-height: 2;
        }

        .signature-text {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 18px;
          color: ${gold};
          margin-top: 30px;
        }
        
        .verified-badge {
          display: inline-flex;
          align-items: center;
          background: rgba(197, 160, 89, 0.1);
          color: ${gold};
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 30px;
          border: 1px solid rgba(197, 160, 89, 0.2);
        }
      </style>
    </head>
    <body>
      ${preheader ? `<span style="display:none; max-height:0; overflow:hidden;">${preheader}</span>` : ''}
      <div class="wrapper">
        <div class="header">
          <img src="${logoUrl}" alt="RongRani Logo" class="logo">
          <h1 class="brand-name">Rong<span style="color: ${gold};">Rani</span></h1>
          <div class="luxury-accent"></div>
          <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 4px; opacity: 0.8; font-weight: 300;">The Art of Bespoke Gifting</p>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <div class="verified-badge">✨ Curated for Excellence</div>
          <h3 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 26px; color: #ffffff;">Experience the Extraordinary</h3>
          <p style="color: #64748b; font-size: 15px; margin-top: 12px; font-weight: 300;">Crafting memories through the timeless beauty of handmade art.</p>
          
          <div class="social-links">
            <a href="https://facebook.com/rongrani" class="social-icon"><img src="https://cdn-icons-png.flaticon.com/512/124/124010.png" width="24" style="filter: invert(1);"></a>
            <a href="https://instagram.com/rongrani" class="social-icon"><img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" width="24" style="filter: invert(1);"></a>
            <a href="https://wa.me/8801851075537" class="social-icon"><img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="24" style="filter: invert(1);"></a>
          </div>
          
          <div class="contact-info">
            <div style="margin-bottom: 20px; color: ${gold}; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; font-weight: 800;">Contact Us</div>
            📞 +880 1851-075537<br>
            ✉️ info.rongrani@gmail.com<br>
            <a href="${frontendUrl}" style="color: ${gold}; text-decoration: none; font-weight: 700; font-size: 16px; margin-top: 20px; display: inline-block;">www.rongrani.com</a>
          </div>
          
          <p style="font-size: 11px; color: #475569; margin-top: 60px; letter-spacing: 0.1em; text-transform: uppercase;">
            &copy; ${new Date().getFullYear()} RongRani Store. All rights reserved.
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
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 24px 0;">
          <div style="font-weight: 600; color: #0f172a; font-size: 16px;">${item.name}</div>
          <div style="font-size: 13px; color: #94a3b8; margin-top: 6px;">Edition: Artisan Crafted  |  Qty: ${item.quantity}</div>
        </td>
        <td style="text-align: right; font-weight: 600; color: #0f172a; font-size: 16px; padding: 24px 0;">
          ৳ ${(item.quantity * item.price).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const shipping = order.shippingAddress || {};
    const address = `${shipping.street || ''} ${shipping.city || ''} ${shipping.zipCode ? '- ' + shipping.zipCode : ''}, Bangladesh`.trim();
    const trackingQuery = order.customerEmail ? `?email=${encodeURIComponent(order.customerEmail)}` : '';

    const content = `
      <h2 class="h-premium">Thank you for letting us be part of your story.</h2>
      <p style="font-size: 17px; color: #475569; font-weight: 300;">Hello ${order.name}, your curated selection has been reserved and is now entering the hands of our artisans.</p>
      
      <div style="margin: 50px 0; text-align: left; background: #fafafa; border-radius: 20px; padding: 35px; border: 1px solid #f1f5f9;">
        <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800; margin-bottom: 8px;">Order Reference</div>
        <div style="font-size: 26px; font-weight: 400; color: #0f172a; font-family: 'Playfair Display', serif;">${order.orderId}</div>
      </div>

      <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: 800; margin-bottom: 10px;">Selection Summary</h3>
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tbody>
          ${products}
        </tbody>
      </table>

      <div style="margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; padding: 10px 0;">
          <span style="color: #64748b; font-weight: 400;">Subtotal</span>
          <span style="color: #0f172a; font-weight: 600;">৳ ${order.subtotal?.toFixed(2) || '0.00'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 10px 0;">
          <span style="color: #64748b; font-weight: 400;">Bespoke Shipping</span>
          <span style="color: #0f172a; font-weight: 600;">৳ ${order.shipping?.toFixed(2) || '0.00'}</span>
        </div>
        ${order.discount > 0 ? `
          <div style="display: flex; justify-content: space-between; padding: 10px 0; color: #10b981;">
            <span style="font-weight: 600;">Preferred Client Discount</span>
            <span style="font-weight: 600;">- ৳ ${order.discount?.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="gold-divider"></div>
        <div style="display: flex; justify-content: space-between; font-size: 28px; font-family: 'Playfair Display', serif;">
          <span style="color: #0f172a;">Total</span>
          <span style="color: #8B2635;">৳ ${order.total?.toFixed(2) || '0.00'}</span>
        </div>
      </div>

      <div style="margin-top: 60px; border-top: 1px solid #f1f5f9; padding-top: 40px;">
        <h4 style="margin: 0 0 15px 0; color: #0f172a; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Delivery Destination</h4>
        <div style="font-size: 17px; line-height: 1.8; color: #475569; font-weight: 300;">
          <strong style="color: #0f172a; font-weight: 600;">${order.name}</strong><br>
          ${address}<br>
          <span style="color: #C5A059; font-weight: 600;">📞 ${shipping.phone || ''}</span>
        </div>
      </div>

      <center>
        <a href="${process.env.FRONTEND_URL}/order-tracking/${order.orderId}${trackingQuery}" class="btn">Monitor Status</a>
      </center>
      
      <div class="signature-text" style="text-align: center; margin-top: 40px;">- The RongRani Team</div>
    `;

    return emailBaseTemplate(`Confirmation of Reservation #${order.orderId}`, content, `We have received your selection for order #${order.orderId}.`);
  },

  // 2. Order Status Update Email
  orderStatusUpdate: (data) => {
    const statusMessages = {
      processing: {
        emoji: '✨',
        badge: 'Bespoke Preparation',
        title: 'Your selection is being masterfully prepared',
        message: 'It is our pleasure to inform you that your handcrafted items have entered the final stages of refinement. We are ensuring every detail meets our standards of excellence. ❤️'
      },
      shipped: {
        emoji: '🌍',
        badge: 'Concierge Transit',
        title: 'In pursuit of your doorstep',
        message: 'Good news! Your curated parcel has been released for delivery and is currently in transit to your location.'
      },
      delivered: {
        emoji: '🎁',
        badge: 'Exquisitely Delivered',
        title: 'Masterpiece Delivered',
        message: 'Your items have arrived safely. We trust they will bring a touch of elegance to your special moment.'
      },
      cancelled: {
        emoji: '⚖️',
        badge: 'Curation Revoked',
        title: 'Order Status Notification',
        message: 'Your order has been cancelled. If this was not by your request, please contact our concierge immediately.'
      },
    };

    const statusInfo = statusMessages[data.status] || statusMessages.processing;

    const content = `
      <div style="text-align: center; margin-bottom: 40px;">
        <div class="verified-badge">${statusInfo.badge}</div>
        <h2 class="h-premium" style="margin-top: 20px;">${statusInfo.emoji} ${statusInfo.title}</h2>
        <p style="font-size: 17px; color: #64748b; font-weight: 300;">Hello <strong>${data.name}</strong>, ${statusInfo.message}</p>
      </div>
      
      <div style="background-color: #fafafa; border-radius: 24px; padding: 45px; margin: 40px 0; text-align: center; border: 1px solid #f1f5f9;">
        <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.2em; margin-bottom: 12px;">Current Status</div>
        <div style="font-size: 32px; font-weight: 400; color: #0f172a; margin: 10px 0; font-family: 'Playfair Display', serif;">${data.status}</div>
        <div style="height: 1px; width: 40px; background: #C5A059; margin: 25px auto;"></div>
        <div style="color: #94a3b8; font-size: 14px; letter-spacing: 1px;">ID: #${data.orderId}</div>
      </div>

      ${data.trackingNumber ? `
        <div style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 20px; padding: 30px; margin-bottom: 40px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
          <div style="color: #94a3b8; font-size: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 2px; margin-bottom: 8px;">Manifest Number</div>
          <div style="font-size: 16px; color: #0f172a; font-weight: 600; letter-spacing: 1px;">${data.trackingNumber}</div>
        </div>
      ` : ''}

      <center>
        <a href="${process.env.FRONTEND_URL}/order-tracking/${data.orderId}${data.trackingQuery || ''}" class="btn">Monitor Curation</a>
      </center>
    `;

    return emailBaseTemplate(`Artisan Update - #${data.orderId}`, content, `Your order status has been masterfully updated.`);
  },

  // 3. Welcome Email
  welcome: (user) => {
    const content = `
      <div style="text-align: center; margin-bottom: 40px;">
        <div class="verified-badge">Welcome to the Inner Circle</div>
        <h2 class="h-premium" style="margin-top: 20px;">Your journey into the world of artisan gifting begins.</h2>
        <p style="font-size: 17px; color: #64748b; font-weight: 300;">Hello <strong>${user.name}</strong>, it is a privilege to have you join our curated community.</p>
      </div>

      <div style="background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 24px; padding: 40px; margin-bottom: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
        <p style="font-size: 16px; color: #475569; line-height: 2; margin-bottom: 30px; font-weight: 300;">
          At RongRani, we believe that a gift is not merely an object, but a vessel of emotion. Each piece you discover here is handcrafted by masters of their craft, ensuring that your most cherished moments are marked with unparalleled elegance.
        </p>

        <div style="background: linear-gradient(135deg, #2a0a0d 0%, #4a0e16 100%); border-radius: 20px; padding: 40px; text-align: center; color: white;">
          <div style="font-size: 11px; font-weight: 800; color: #C5A059; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 15px;">A Token of Appreciation</div>
          <div style="font-family: 'Playfair Display', serif; font-size: 24px; margin-bottom: 25px;">The Privilege of First Choice</div>
          <div style="font-size: 14px; opacity: 0.8; margin-bottom: 20px;">Use this invitation code for 10% off your initial curation</div>
          <div style="display: inline-block; background-color: transparent; padding: 15px 35px; border-radius: 0; font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #C5A059; border: 1px solid #C5A059;">WELCOME10</div>
        </div>
      </div>

      <center>
        <a href="${process.env.FRONTEND_URL}/shop" class="btn">Explore the Collection</a>
      </center>
      
      <div class="signature-text" style="text-align: center; margin-top: 40px;">- Authenticity Guaranteed</div>
    `;

    return emailBaseTemplate('Welcome to the Privilege of RongRani', content, 'You are cordially invited to explore our world of artisan crafts.');
  },

  // 4. Admin Order Notification
  adminOrderNotification: (data) => {
    const products = (data.items || []).map(item => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 20px 0;">
          <div style="font-weight: 700; color: #0f172a;">${item.name}</div>
          <div style="font-size: 12px; color: #94a3b8;">Ref Code: Artisan Selection | ${item.quantity} units</div>
        </td>
        <td style="padding: 20px 0; text-align: right; font-weight: 700; color: #0f172a;">
          ৳ ${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const content = `
      <div style="border-left: 3px solid #8B2635; padding-left: 25px; margin-bottom: 40px;">
        <h2 class="h-premium" style="font-size: 24px; margin: 0; color: #8B2635;">New Masterpiece Reservation</h2>
        <p style="margin-top: 8px; color: #475569; font-weight: 400; font-size: 15px;">Order #${data.orderId} awaits fulfillment.</p>
      </div>
      
      <div style="background-color: #fafafa; border-radius: 20px; padding: 30px; margin-bottom: 40px; border: 1px solid #f1f5f9;">
        <h4 style="margin: 0 0 20px 0; color: #94a3b8; text-transform: uppercase; font-size: 10px; letter-spacing: 2px; font-weight: 800;">Client Dossier</h4>
        <div style="color: #0f172a; line-height: 2; font-size: 15px;">
          <div style="font-weight: 600; font-size: 18px; font-family: 'Playfair Display', serif;">${data.customerName}</div>
          <div>📧 ${data.customerEmail}</div>
          <div>📞 ${data.customerPhone || 'N/A'}</div>
          <div style="margin-top: 15px; color: #64748b; font-size: 14px; border-top: 1px solid #f1f5f9; padding-top: 15px;">📍 ${data.shippingAddress}</div>
        </div>
      </div>

      <h4 style="margin: 0 0 10px 0; color: #94a3b8; text-transform: uppercase; font-size: 10px; letter-spacing: 2px; font-weight: 800;">Artisan Summary</h4>
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tbody>
          ${products}
        </tbody>
      </table>
      
      <div style="text-align: right; padding: 30px 0; border-top: 1px solid #f1f5f9; margin-top: 10px;">
        <span style="color: #94a3b8; font-weight: 400; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Estimated Allocation</span><br>
        <span style="color: #0f172a; font-size: 32px; font-family: 'Playfair Display', serif;">৳ ${data.total}</span>
      </div>

      <center>
        <a href="${process.env.FRONTEND_URL}/admin/orders/${data.orderId}" class="btn" style="background: #0f172a;">Review Dossier</a>
      </center>
    `;

    return emailBaseTemplate(`Priority Alert: Reservation #${data.orderId}`, content, `A new curation has been requested by ${data.customerName}.`);
  },

  // 5. Review Request Email
  reviewRequest: (data) => {
    const content = `
      <div style="text-align: center; margin-bottom: 45px;">
        <div class="verified-badge">Client Experience</div>
        <h2 class="h-premium" style="margin-top: 25px;">How did our craftsmanship speak to you?</h2>
        <p style="font-size: 17px; color: #64748b; font-weight: 300;">Hello <strong>${data.name}</strong>, we hope your new curation brings you joy.</p>
      </div>
      
      <p style="font-size: 16px; color: #475569; line-height: 2; text-align: center; max-width: 450px; margin: 0 auto; font-weight: 300;">
        Your feedback is the soul of RongRani. It inspires our artisans and guides our community. We would be honored if you shared your experience.
      </p>

      <center style="margin: 60px 0;">
        <div style="font-size: 44px; letter-spacing: 15px; margin-bottom: 40px; color: #C5A059; text-shadow: 0 2px 4px rgba(0,0,0,0.05);">⭐⭐⭐⭐⭐</div>
        <a href="${process.env.FRONTEND_URL}/order-tracking/${data.orderId}${data.trackingQuery || ''}" class="btn">Share Your Impression</a>
      </center>
      
      <div style="background-color: #fcfaf7; border-radius: 24px; padding: 30px; text-align: center; border: 1px solid #f1f5f9;">
        <p style="margin: 0; color: #C5A059; font-size: 14px; font-weight: 400; font-style: italic; font-family: 'Playfair Display', serif;">
          "Every review is a story shared."
        </p>
      </div>
    `;

    return emailBaseTemplate('Our artisans value your perspective', content, 'We invite you to share your thoughts on your recent RongRani acquisition.');
  },

  // 6. Low Stock Alert (Admin)
  lowStockAlert: (data) => {
    const content = `
      <div style="background: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid #fee2e2; text-align: center;">
        <div style="display: inline-block; background: #dc2626; color: white; padding: 8px 16px; border-radius: 100px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 25px;">Inventory Integrity</div>
        <h2 class="h-premium" style="color: #0f172a; margin: 0;">Supply Scarcity Alert</h2>
        
        <div class="gold-divider"></div>
        
        <p style="color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800; margin-bottom: 10px;">Masterpiece</p>
        <h3 style="margin: 0 0 30px 0; color: #0f172a; font-size: 24px; font-family: 'Playfair Display', serif;">${data.name}</h3>
        
        <div style="font-size: 64px; font-weight: 400; color: #dc2626; font-family: 'Playfair Display', serif;">${data.stock}</div>
        <div style="font-size: 12px; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 3px;">Units Remaining in Vault</div>
        
        <div style="margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 30px; color: #94a3b8; font-size: 12px; font-weight: 300;">
          REFERENCE Dossier: <span style="font-family: monospace; color: #0f172a;">${data._id}</span>
        </div>
      </div>

      <center>
        <a href="${process.env.FRONTEND_URL}/admin/products" class="btn" style="background: #dc2626;">Execute Restock</a>
      </center>
    `;

    return emailBaseTemplate(`Critical Alert: Scarcity of [${data.name}]`, content, `Immediate action: ${data.name} is nearly depleted.`);
  },

  // 7. Newsletter Welcome Email
  newsletterWelcome: (data) => {
    const content = `
      <div style="text-align: center; margin-bottom: 40px;">
        <div class="verified-badge">Subscription Confirmed</div>
        <h2 class="h-premium" style="margin-top: 20px;">Welcome to the RongRani Inner Circle.</h2>
        <p style="font-size: 17px; color: #64748b; font-weight: 300;">It is a pleasure to have you with us.</p>
      </div>

      <div style="background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 24px; padding: 40px; margin-bottom: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
        <p style="font-size: 16px; color: #475569; line-height: 2; margin-bottom: 30px; text-align: center; font-weight: 300;">
          As a member of our curated community, you will be the first to witness our newest masterpieces, exclusive artisan stories, and private collection releases.
        </p>

        <div style="background: linear-gradient(135deg, #2a0a0d 0%, #4a0e16 100%); border-radius: 20px; padding: 40px; text-align: center; color: white;">
          <div style="font-size: 11px; font-weight: 800; color: #C5A059; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 15px;">A Welcome Gesture</div>
          <div style="font-family: 'Playfair Display', serif; font-size: 24px; margin-bottom: 25px;">The Privilege of an Insider</div>
          <div style="font-size: 14px; opacity: 0.8; margin-bottom: 20px;">Enjoy an exclusive 10% off your next curated acquisition</div>
          <div style="display: inline-block; background-color: transparent; padding: 15px 35px; border-radius: 0; font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #C5A059; border: 1px solid #C5A059;">WELCOME10</div>
        </div>
      </div>

      <center>
        <a href="${process.env.FRONTEND_URL}/shop" class="btn">Begin Your Exploration</a>
      </center>
      
      <div class="signature-text" style="text-align: center; margin-top: 40px;">- Curated with Passion</div>
    `;

    return emailBaseTemplate('Welcome to the World of RongRani', content, 'Thank you for joining our exclusive circle of art and craftsmanship.');
  },

  // 8. Password Reset Email
  passwordReset: (data) => {
    const content = `
      <div style="text-align: center; margin-bottom: 40px;">
        <div class="verified-badge">Security Protocol</div>
        <h2 class="h-premium" style="margin-top: 20px;">Requested Access Restoration</h2>
        <p style="font-size: 17px; color: #64748b; font-weight: 300;">Hello <strong>${data.name}</strong>, we received a request to reset your vault credentials.</p>
      </div>

      <div style="background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 24px; padding: 40px; margin-bottom: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.02); text-align: center;">
        <p style="font-size: 16px; color: #475569; line-height: 2; margin-bottom: 30px; font-weight: 300;">
          If you did not initiate this request, please disregard this message. For your security, this invitation will expire in exactly 60 minutes.
        </p>

        <center>
          <a href="${data.resetLink}" class="btn">Reset Credentials</a>
        </center>
      </div>

      <div class="signature-text" style="text-align: center; margin-top: 40px;">- Security Guaranteed</div>
    `;

    return emailBaseTemplate('Credential Restoration - RongRani', content, 'Securely reset your account password.');
  },

  // 9. Admin: New User Notification
  adminNewUser: (data) => {
    const content = `
      <div style="border-left: 3px solid #8B2635; padding-left: 25px; margin-bottom: 40px;">
        <h2 class="h-premium" style="font-size: 24px; margin: 0; color: #8B2635;">New Member Registered</h2>
        <p style="margin-top: 8px; color: #475569; font-weight: 400; font-size: 15px;">A new account has been established in the RongRani registry.</p>
      </div>
      
      <div style="background-color: #fafafa; border-radius: 20px; padding: 35px; border: 1px solid #f1f5f9;">
        <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800; margin-bottom: 20px;">Identity Details</div>
        <div style="color: #0f172a; line-height: 2.5; font-size: 16px;">
          <div style="font-weight: 600; font-size: 20px; font-family: 'Playfair Display', serif;">${data.userName}</div>
          <div style="color: #64748b;">📧 ${data.userEmail}</div>
          <div style="color: #64748b; font-size: 14px;">📅 Joined: ${data.registeredAt}</div>
        </div>
      </div>

      <center style="margin-top: 40px;">
        <a href="${process.env.FRONTEND_URL}/admin/users" class="btn" style="background: #0f172a;">Review Registry</a>
      </center>
    `;

    return emailBaseTemplate('Priority: New User Membership', content, `A new member, ${data.userName}, has joined the community.`);
  },

  // 10. Admin: Payment Received Notification
  adminPaymentReceived: (data) => {
    const content = `
      <div style="border-left: 3px solid #10b981; padding-left: 25px; margin-bottom: 40px;">
        <h2 class="h-premium" style="font-size: 24px; margin: 0; color: #10b981;">Funds Successfully Acquired</h2>
        <p style="margin-top: 8px; color: #475569; font-weight: 400; font-size: 15px;">Payment for Reservation #${data.orderId} has been verified.</p>
      </div>
      
      <div style="background-color: #fafafa; border-radius: 20px; padding: 35px; border: 1px solid #f1f5f9;">
        <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800; margin-bottom: 20px;">Transaction Dossier</div>
        <div style="color: #0f172a; font-size: 16px;">
          <div style="display: flex; justify-content: space-between; padding: 10px 0;">
            <span style="color: #64748b;">Client</span>
            <span style="font-weight: 600;">${data.customerName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0;">
            <span style="color: #64748b;">Amount Acquired</span>
            <span style="font-weight: 600; color: #10b981;">৳${data.amount}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0;">
            <span style="color: #64748b;">Portal</span>
            <span style="font-weight: 600;">${data.paymentMethod}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 1px solid #f1f5f9; margin-top: 10px; padding-top: 20px;">
            <span style="color: #64748b;">Reference</span>
            <span style="font-family: monospace; font-size: 14px;">${data.transactionId || 'N/A'}</span>
          </div>
        </div>
      </div>

      <center style="margin-top: 40px;">
        <a href="${process.env.FRONTEND_URL}/admin/orders/${data.orderId}" class="btn" style="background: #10b981;">Review Transaction</a>
      </center>
    `;

    return emailBaseTemplate('Priority: Payment Verification Received', content, `Payment of ৳${data.amount} received for order #${data.orderId}.`);
  },

  // 11. Review Thank You Email
  reviewThankYou: (data) => {
    const content = `
      <div style="text-align: center; margin-bottom: 40px;">
        <div class="verified-badge">Gratitude Expressed</div>
        <h2 class="h-premium" style="margin-top: 20px;">Your voice resonates with us.</h2>
        <p style="font-size: 17px; color: #64748b; font-weight: 300;">Dear <strong>${data.name}</strong>, thank you for sharing your experience.</p>
      </div>

      <div style="background-color: #fcfaf7; border: 1px solid #f1f5f9; border-radius: 24px; padding: 40px; margin-bottom: 40px; text-align: center;">
        <p style="font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 800; margin-bottom: 15px;">Your Impression</p>
        <p style="font-style: italic; color: #475569; font-size: 18px; font-family: 'Playfair Display', serif; line-height: 1.8;">
          "${data.comment.length > 120 ? data.comment.substring(0, 120) + '...' : data.comment}"
        </p>
      </div>

      <div style="background: linear-gradient(135deg, #2a0a0d 0%, #4a0e16 100%); border-radius: 20px; padding: 40px; text-align: center; color: white;">
        <div style="font-size: 11px; font-weight: 800; color: #C5A059; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 15px;">A token of our Appreciation</div>
        <div style="font-family: 'Playfair Display', serif; font-size: 24px; margin-bottom: 25px;">The Honor of a Recurring Guest</div>
        <div style="font-size: 14px; opacity: 0.8; margin-bottom: 20px;">Enjoy 5% off your next curated selection</div>
        <div style="display: inline-block; background-color: transparent; padding: 15px 35px; border-radius: 0; font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #C5A059; border: 1px solid #C5A059;">GUEST5</div>
      </div>

      <center>
        <a href="${process.env.FRONTEND_URL}/shop" class="btn">Explore Again</a>
      </center>
    `;

    return emailBaseTemplate('Our Gratitude for Your Feedback', content, 'Thank you for sharing your perspective on your recent RongRani acquisition.');
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
