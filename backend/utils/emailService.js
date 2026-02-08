const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog');

// Check if email service is configured
const isEmailConfigured = !!(process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASS);

if (!isEmailConfigured) {
  console.log('⚠️  Email service not configured - emails will be logged to console only');
  console.log('   To enable: Set BREVO_SMTP_USER and BREVO_SMTP_PASS in .env');
}

// Create transporter with Brevo SMTP (only if configured)
const transporter = isEmailConfigured ? nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: process.env.BREVO_SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS
  }
}) : null;

async function sendEmail(to, subject, template, data, attachments = []) {
  try {
    console.log('📧 Email Service - Starting send to:', to);
    console.log('   Subject:', subject);
    console.log('   Template:', template);
    
    const htmlContent = getTemplateContent(template, data);
    
    // If email not configured, just log to console
    if (!isEmailConfigured) {
      console.log('⚠️  Email not sent (no SMTP configured)');
      console.log('   To:', to);
      console.log('   Subject:', subject);
      console.log('   Template:', template);
      console.log('   Data:', JSON.stringify(data, null, 2));
      
      // Still log to database
      await EmailLog.create({
        to,
        subject,
        template,
        data,
        status: 'skipped',
        error: 'Email service not configured',
        sentAt: new Date(),
      });
      
      return { messageId: 'console-only', skipped: true };
    }
    
    // Prepare email options
    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Chirkut ঘর'}" <${process.env.FROM_EMAIL || process.env.BREVO_SMTP_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    console.log('   From:', mailOptions.from);
    console.log('   SMTP User:', process.env.BREVO_SMTP_USER);
    console.log('   SMTP Host:', process.env.BREVO_SMTP_HOST);

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }
    
    // Send email using nodemailer
    console.log('   Sending via SMTP...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully! Message ID:', result.messageId);

    // Log successful email
    await EmailLog.create({
      to,
      subject,
      template,
      data,
      status: 'sent',
      sentAt: new Date(),
    });

    return result;
  } catch (error) {
    console.error('❌ Email sending failed:');
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Full error:', error);
    
    // Log failed email
    await EmailLog.create({
      to,
      subject,
      template,
      data,
      status: 'failed',
      error: error.message,
      sentAt: new Date(),
    });

    console.error('Email sending failed:', error);
    throw error;
  }
};

const getTemplateContent = (template, data) => {
  const templates = {
    welcome: () => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff6f6; border-radius: 10px;">
        <h1 style="color: #8B1538;">Welcome to Chirkut ঘর! 💝</h1>
        <p>Dear ${data.name},</p>
        <p>Thank you for joining Chirkut ঘর. We're excited to have you as part of our community!</p>
        <p style="color: #8B1538; font-weight: bold;">As a lifetime customer, you'll enjoy:</p>
        <ul style="color: #444;">
          <li>💝 Exclusive offers and discounts</li>
          <li>🚚 Free shipping on orders over ৳2000</li>
          <li>📦 Order tracking and priority support</li>
        </ul>
        <a href="${process.env.FRONTEND_URL}/shop" style="background-color: #8B1538; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">Start Shopping</a>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <p style="color: #8B1538; font-weight: bold; font-size: 16px; margin-bottom: 10px;">✨ Chirkut ঘর ✨</p>
          <p style="color: #666; font-size: 13px; margin: 5px 0;">Your trusted gift & lifestyle store</p>
          <div style="margin: 15px 0;">
            <a href="https://facebook.com/chirkutghor" style="display: inline-block; margin: 0 8px; text-decoration: none;">📘 Facebook</a>
            <a href="https://instagram.com/chirkutghor" style="display: inline-block; margin: 0 8px; text-decoration: none;">📷 Instagram</a>
            <a href="https://wa.me/8801234567890" style="display: inline-block; margin: 0 8px; text-decoration: none;">💬 WhatsApp</a>
          </div>
          <p style="color: #888; font-size: 12px; margin: 5px 0;">📧 ${process.env.SUPER_ADMIN_EMAIL}</p>
          <p style="color: #888; font-size: 12px; margin: 5px 0;">📞 +880 1234-567890</p>
        </div>
      </div>
    `,
    orderConfirmation: () => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff6f6; border-radius: 10px;">
        <div style="text-align: center; background: #8B1538; color: white; padding: 20px; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px;">Thank you for shopping with Chirkut ঘর</p>
        </div>
        
        <p>Dear <strong>${data.name}</strong>,</p>
        <p>Your order has been successfully placed! 🎊</p>
        
        <div style="background: white; padding: 15px; border-radius: 10px; border: 2px dashed #8B1538; margin: 20px 0;">
          <h2 style="color: #8B1538; margin: 0 0 10px 0; font-size: 18px;">📋 Order Receipt</h2>
          <p style="margin: 5px 0;"><strong>Order ID:</strong> #${data.orderId}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
        </div>
        
        <h3 style="color: #8B1538; margin-top: 25px;">🛒 Order Items:</h3>
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden;">
          <thead>
            <tr style="background: #8B1538; color: white;">
              <th style="padding: 12px; text-align: left;">Product</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${(data.items || []).map((item, i) => `
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px;">
                  <div style="display: flex; align-items: center;">
                    ${item.image ? `<img src="${item.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; margin-right: 12px;" />` : '📦'}
                    <span>${item.name}</span>
                  </div>
                </td>
                <td style="padding: 12px; text-align: center; font-weight: bold;">${item.quantity}</td>
                <td style="padding: 12px; text-align: right; font-weight: bold;">৳${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="background: white; padding: 20px; border-radius: 10px; margin-top: 20px;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Subtotal:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold;">৳${data.subtotal || data.total}</td>
            </tr>
            ${data.tax && data.tax > 0 ? `<tr>
              <td style="padding: 8px 0; color: #666;">Tax:</td>
              <td style="padding: 8px 0; text-align: right;">৳${data.tax}</td>
            </tr>` : ''}
            ${data.shipping !== undefined ? `<tr>
              <td style="padding: 8px 0; color: #666;">Shipping:</td>
              <td style="padding: 8px 0; text-align: right;">${data.shipping > 0 ? '৳' + data.shipping : 'FREE 🎉'}</td>
            </tr>` : ''}
            ${data.discount && data.discount > 0 ? `<tr>
              <td style="padding: 8px 0; color: #16a34a;">Discount:</td>
              <td style="padding: 8px 0; text-align: right; color: #16a34a;">-৳${data.discount}</td>
            </tr>` : ''}
            <tr style="border-top: 2px solid #8B1538;">
              <td style="padding: 12px 0; font-size: 20px; color: #8B1538; font-weight: bold;">Total:</td>
              <td style="padding: 12px 0; text-align: right; font-size: 20px; color: #8B1538; font-weight: bold;">৳${data.total}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50; margin-top: 20px;">
          <p style="margin: 0; font-weight: bold;">📄 Invoice Attached</p>
          <p style="margin: 5px 0 0 0; font-size: 13px;">Your detailed invoice is attached to this email for your records.</p>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 15px;">
          <p style="margin: 0; font-weight: bold;">📦 What's Next?</p>
          <p style="margin: 5px 0 0 0; font-size: 13px;">We're preparing your order for shipment. You'll receive a tracking number via email once your order ships.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/track/${data.orderId}${data.trackingQuery || ''}" style="background-color: #8B1538; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Track Your Order</a>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <p style="color: #8B1538; font-weight: bold; font-size: 16px; margin-bottom: 10px;">✨ Chirkut ঘর ✨</p>
          <p style="color: #666; font-size: 13px; margin: 5px 0;">Your trusted gift & lifestyle store</p>
          <div style="margin: 15px 0;">
            <a href="https://facebook.com/chirkutghor" style="display: inline-block; margin: 0 8px; text-decoration: none;">📘 Facebook</a>
            <a href="https://instagram.com/chirkutghor" style="display: inline-block; margin: 0 8px; text-decoration: none;">📷 Instagram</a>
            <a href="https://wa.me/8801234567890" style="display: inline-block; margin: 0 8px; text-decoration: none;">💬 WhatsApp</a>
          </div>
          <p style="color: #888; font-size: 12px; margin: 5px 0;">📧 ${process.env.SUPER_ADMIN_EMAIL}</p>
          <p style="color: #888; font-size: 12px; margin: 5px 0;">📞 +880 1234-567890</p>
          <p style="color: #999; font-size: 11px; margin-top: 15px;">Need help? Contact us anytime!</p>
        </div>
      </div>
    `,
    adminOrderNotification: () => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f0f9ff; border-radius: 10px;">
        <h1 style="color: #1e40af;">🔔 New Order Received!</h1>
        <p>A new order has been placed:</p>
        <p><strong>Order ID:</strong> #${data.orderId}</p>
        <p><strong>Customer:</strong> ${data.customerName}</p>
        <p><strong>Email:</strong> ${data.customerEmail}</p>
        <p><strong>Phone:</strong> ${data.customerPhone}</p>
        <h3 style="color: #1e40af;">Order Items:</h3>
        <ul style="list-style: none; padding: 0;">
          ${(data.items || []).map(item => `<li style="padding: 10px; background: white; margin: 5px 0; border-radius: 5px;">📦 ${item.name} x ${item.quantity} - ৳${item.price}</li>`).join('')}
        </ul>
        <p style="font-size: 18px; font-weight: bold; color: #1e40af;">Total: ৳${data.total}</p>
        <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
        <p><strong>Shipping Address:</strong> ${data.shippingAddress}</p>
        <p style="margin-top: 20px; color: #ef4444; font-weight: bold;">⚡ Please process this order as soon as possible.</p>
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <p style="color: #888; font-size: 13px; margin: 5px 0;">Chirkut ঘর - Admin Notification</p>
        </div>
      </div>
    `,
    passwordReset: () => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff6f6; border-radius: 10px;">
        <h1 style="color: #8B1538;">Password Reset 🔐</h1>
        <p>Dear ${data.name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${data.resetLink}" style="background-color: #8B1538; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">Reset Password</a>
        <p style="color: #dc2626;">⚠️ This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <p style="color: #8B1538; font-weight: bold; font-size: 16px; margin-bottom: 10px;">✨ Chirkut ঘর ✨</p>
          <p style="color: #666; font-size: 13px; margin: 5px 0;">Your trusted gift & lifestyle store</p>
          <div style="margin: 15px 0;">
            <a href="https://facebook.com/chirkutghor" style="display: inline-block; margin: 0 8px; text-decoration: none;">📘 Facebook</a>
            <a href="https://instagram.com/chirkutghor" style="display: inline-block; margin: 0 8px; text-decoration: none;">📷 Instagram</a>
            <a href="https://wa.me/8801234567890" style="display: inline-block; margin: 0 8px; text-decoration: none;">💬 WhatsApp</a>
          </div>
          <p style="color: #888; font-size: 12px; margin: 5px 0;">📧 ${process.env.SUPER_ADMIN_EMAIL}</p>
          <p style="color: #888; font-size: 12px; margin: 5px 0;">📞 +880 1234-567890</p>
        </div>
      </div>
    `,
    orderStatusUpdate: () => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff6f6; border-radius: 10px;">
        <h1 style="color: #8B1538;">Order Status Update 📦</h1>
        <p>Dear ${data.name},</p>
        <p>Your order <strong>#${data.orderId}</strong> status has been updated to: <strong style="color: #8B1538;">${data.status}</strong></p>
        ${data.trackingNumber ? `<p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>` : ''}
        <a href="${process.env.FRONTEND_URL}/track/${data.orderId}${data.trackingQuery || ''}" style="background-color: #8B1538; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">Track Order</a>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <p style="color: #8B1538; font-weight: bold; font-size: 16px; margin-bottom: 10px;">✨ Chirkut ঘর ✨</p>
          <p style="color: #666; font-size: 13px; margin: 5px 0;">Your trusted gift & lifestyle store</p>
          <div style="margin: 15px 0;">
            <a href="https://facebook.com/chirkutghor" style="display: inline-block; margin: 0 8px; text-decoration: none;">📘 Facebook</a>
            <a href="https://instagram.com/chirkutghor" style="display: inline-block; margin: 0 8px; text-decoration: none;">📷 Instagram</a>
            <a href="https://wa.me/8801234567890" style="display: inline-block; margin: 0 8px; text-decoration: none;">💬 WhatsApp</a>
          </div>
          <p style="color: #888; font-size: 12px; margin: 5px 0;">📧 ${process.env.SUPER_ADMIN_EMAIL}</p>
          <p style="color: #888; font-size: 12px; margin: 5px 0;">📞 +880 1234-567890</p>
        </div>
      </div>
    `,
    newsletterWelcome: () => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #8B1538 0%, #ec4899 100%); border-radius: 15px;">
        <div style="background: white; padding: 30px; border-radius: 10px;">
          <h1 style="color: #8B1538; text-align: center; font-size: 32px;">🎉 Welcome to Chirkut ঘর Newsletter!</h1>
          <p style="text-align: center; color: #444; font-size: 18px;">Thank you for subscribing! We're thrilled to have you.</p>
          <div style="background: #fff6f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #8B1538; text-align: center; margin-bottom: 15px;">🎁 Your Welcome Gift</h2>
            <div style="text-align: center; background: #8B1538; color: white; padding: 20px; border-radius: 10px; margin: 10px 0;">
              <p style="font-size: 24px; font-weight: bold; margin: 0;">GET 10% OFF</p>
              <p style="font-size: 16px; margin: 10px 0;">Use code: <strong style="font-size: 20px; background: white; color: #8B1538; padding: 5px 15px; border-radius: 5px;">WELCOME10</strong></p>
              <p style="font-size: 14px; margin: 0;">Valid on your first order</p>
            </div>
          </div>
          <p style="color: #444;">As a subscriber, you'll enjoy:</p>
          <ul style="color: #444; padding-left: 20px;">
            <li>✨ Exclusive discounts and early access to sales</li>
            <li>🎉 Special birthday gifts and surprises</li>
            <li>💝 New product launches before everyone else</li>
            <li>🚚 Free shipping offers and promo codes</li>
          </ul>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/shop" style="background-color: #8B1538; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px;">Start Shopping Now</a>
          </div>
          <p style="text-align: center; color: #888; font-size: 12px; margin-top: 30px;">
            You're receiving this email because you subscribed to Chirkut ঘর newsletter.<br/>
            Don't want these emails? <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #8B1538;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `,
    adminNewUser: () => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f0f9ff; border-radius: 10px;">
        <h1 style="color: #1e40af;">🆕 New User Registered!</h1>
        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p><strong>Name:</strong> ${data.userName}</p>
          <p><strong>Email:</strong> ${data.userEmail}</p>
          <p><strong>Registered At:</strong> ${data.registeredAt}</p>
        </div>
        <p style="color: #666;">This user has joined Chirkut ঘর platform. Welcome email has been sent to their inbox.</p>
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <p style="color: #888; font-size: 13px; margin: 5px 0;">Chirkut ঘর - Admin Notification</p>
        </div>
      </div>
    `,
    adminNewOrder: () => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f0f9ff; border-radius: 10px;">
        <h1 style="color: #1e40af;">🛒 New Order Received!</h1>
        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p><strong>Order ID:</strong> #${data.orderId}</p>
          <p><strong>Customer:</strong> ${data.customerName}</p>
          <p><strong>Email:</strong> ${data.customerEmail}</p>
          <p><strong>Phone:</strong> ${data.customerPhone}</p>
          <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
          <h3 style="color: #1e40af; margin-top: 20px;">Order Items:</h3>
          <ul style="list-style: none; padding: 0;">
            ${(data.items || []).map(item => `<li style="padding: 10px; background: #f9fafb; margin: 5px 0; border-radius: 5px;">📦 ${item.name} x ${item.quantity} - ৳${item.price}</li>`).join('')}
          </ul>
          <p style="font-size: 20px; font-weight: bold; color: #1e40af; margin-top: 15px;">Total: ৳${data.total}</p>
          <div style="background: #fef3c7; padding: 12px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 15px;">
            <p style="margin: 0;"><strong>Shipping Address:</strong></p>
            <p style="margin: 5px 0 0 0;">${data.shippingAddress}</p>
          </div>
        </div>
        <p style="color: #ef4444; font-weight: bold; text-align: center;">⚡ Please process this order immediately!</p>
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <p style="color: #888; font-size: 13px; margin: 5px 0;">Chirkut ঘর - Admin Notification</p>
        </div>
      </div>
    `,
    adminPaymentReceived: () => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f0fdf4; border-radius: 10px;">
        <h1 style="color: #16a34a;">💰 Payment Received!</h1>
        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p><strong>Order ID:</strong> #${data.orderId}</p>
          <p><strong>Customer:</strong> ${data.customerName}</p>
          <p><strong>Amount:</strong> ৳${data.amount}</p>
          <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
          <p><strong>Transaction ID:</strong> ${data.transactionId || 'N/A'}</p>
          <p><strong>Date:</strong> ${data.paymentDate}</p>
        </div>
        <p style="background: #d1fae5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
          ✅ Payment has been successfully processed. You can now proceed with order fulfillment.
        </p>
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <p style="color: #888; font-size: 13px; margin: 5px 0;">Chirkut ঘর - Admin Notification</p>
        </div>
      </div>
    `,
  };
  
  const templateFn = templates[template];
  return templateFn ? templateFn() : '<p>Email content</p>';
};

module.exports = {
  sendEmail,
};