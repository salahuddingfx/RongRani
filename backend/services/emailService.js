import nodemailer from 'nodemailer';

// Email transporter configuration
const createTransporter = () => {
    // Using SendGrid (Recommended for production)
    if (process.env.SENDGRID_API_KEY) {
        return nodemailer.createTransporter({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY,
            },
        });
    }

    // Fallback to Gmail SMTP
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

// Email templates
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
            <h2>Hello ${order.customer.name}!</h2>
            <p>Your order has been successfully placed. We're excited to prepare your handmade gifts with love! ❤️</p>
            
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-BD')}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
            
            <h3>Items</h3>
            <table>
              ${products}
              <tr style="background: #f9f9f9; font-weight: bold;">
                <td style="padding: 15px;">Total</td>
                <td style="padding: 15px; text-align: right;">৳${order.totalAmount}</td>
              </tr>
            </table>
            
            <h3>Shipping Address</h3>
            <p>
              ${order.shippingAddress.name}<br/>
              ${order.shippingAddress.phone}<br/>
              ${order.shippingAddress.address}<br/>
              ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}
            </p>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/profile/orders/${order._id}" class="button">
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
    orderStatusUpdate: (order, status) => {
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
            <h2>Hello ${order.customer.name}!</h2>
            <p>${statusInfo.message}</p>
            
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Order Status:</strong> <span class="status-badge">${status.toUpperCase()}</span></p>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/profile/orders/${order._id}" class="button">
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
          
          <p>At RongRani, we create beautiful handmade gifts, surprise boxes, jewelry, and decor with love and care. Every item is crafted to make your special moments even more memorable!</p>
          
          <h3>What's Next?</h3>
          <ul>
            <li>🛍️ Browse our amazing collection of handmade products</li>
            <li>❤️ Add items to your wishlist</li>
            <li>🎉 Get exclusive offers and deals</li>
            <li>📦 Fast delivery across Bangladesh</li>
          </ul>
          
          <center>
            <a href="${process.env.FRONTEND_URL}/shop" class="button">
              Start Shopping
            </a>
          </center>
        </div>
        <div class="footer">
          <p><strong>Need Assistance?</strong></p>
          <p>📞 01851075537 | 📧 info@rongrani.com</p>
          <p>💬 WhatsApp: +8801851075537</p>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            © ${new Date().getFullYear()} RongRani. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,

    // Password Reset Email
    passwordReset: (user, resetToken) => `
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
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name}!</h2>
          <p>We received a request to reset your RongRani account password.</p>
          
          <center>
            <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}" class="button">
              Reset Password
            </a>
          </center>
          
          <div class="warning">
            <strong>⚠️ Security Note:</strong><br/>
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link:<br/>
            ${process.env.FRONTEND_URL}/reset-password/${resetToken}
          </p>
        </div>
        <div class="footer">
          <p>📞 01851075537 | 📧 info@rongrani.com</p>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            © ${new Date().getFullYear()} RongRani. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
};

// Send email function
export const sendEmail = async ({ to, subject, template, data }) => {
    try {
        const transporter = createTransporter();

        const htmlContent = typeof template === 'function'
            ? template(data)
            : emailTemplates[template]?.(data) || template;

        const mailOptions = {
            from: {
                name: process.env.EMAIL_FROM_NAME || 'RongRani',
                address: process.env.EMAIL_FROM || 'noreply@rongrani.com',
            },
            to,
            subject,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error: error.message };
    }
};

// Helper functions for specific emails
export const sendOrderConfirmation = (order) => {
    return sendEmail({
        to: order.customer.email,
        subject: `Order Confirmation - ${order.orderNumber}`,
        template: 'orderConfirmation',
        data: order,
    });
};

export const sendOrderStatusUpdate = (order, status) => {
    return sendEmail({
        to: order.customer.email,
        subject: `Order Status Update - ${order.orderNumber}`,
        template: 'orderStatusUpdate',
        data: { order, status },
    });
};

export const sendWelcomeEmail = (user) => {
    return sendEmail({
        to: user.email,
        subject: 'Welcome to RongRani! 🎁',
        template: 'welcome',
        data: user,
    });
};

export const sendPasswordResetEmail = (user, resetToken) => {
    return sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        template: 'passwordReset',
        data: { user, resetToken },
    });
};

export default {
    sendEmail,
    sendOrderConfirmation,
    sendOrderStatusUpdate,
    sendWelcomeEmail,
    sendPasswordResetEmail,
};
