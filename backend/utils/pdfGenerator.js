const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Decorative header background
      doc.rect(0, 0, 595, 150).fill('#8B1538');
      doc.rect(0, 150, 595, 5).fill('#D4AF37');

      // Add Logo if exists
      const logoPath = path.join(__dirname, '../../public/RongRani-Circle.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 30, { width: 60 });
        doc.fillColor('#FFFFFF');
        doc.fontSize(24).font('Helvetica-Bold').text('RongRani', 120, 45);
        doc.fontSize(12).font('Helvetica').text('Premium Handcrafted Gifts', 120, 75);
      } else {
        doc.fillColor('#FFFFFF');
        doc.fontSize(32).font('Helvetica-Bold').text('RongRani', 50, 40);
        doc.fontSize(14).font('Helvetica').text('Premium Handcrafted Gifts', 50, 75);
      }

      doc.fontSize(9).fillColor('#FFFFFF').text('Cox\'s Bazar, Bangladesh', 120, 95);
      doc.fontSize(9).text('Email: info.rongrani@gmail.com', 120, 108);
      doc.fontSize(9).text('Phone: +880 1851-075537', 120, 121);

      // Invoice title on the right
      doc.fillColor('#FFFFFF');
      doc.fontSize(24).font('Helvetica-Bold').text('TAX INVOICE', 350, 60, { align: 'right', width: 195 });

      // Move to content area
      doc.fillColor('#000000');
      doc.font('Helvetica');

      // Invoice details box
      const invoiceBoxY = 180;
      doc.roundedRect(50, invoiceBoxY, 495, 80, 5).stroke('#8B1538');

      // Left side - Order details
      doc.fontSize(10).fillColor('#666666').text('INVOICE NUMBER', 60, invoiceBoxY + 15);
      doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold').text(`#${order._id.toString().substring(0, 8).toUpperCase()}`, 60, invoiceBoxY + 32);

      doc.fontSize(10).fillColor('#666666').font('Helvetica').text('ORDER DATE', 60, invoiceBoxY + 52);
      doc.fontSize(12).fillColor('#000000').text(new Date(order.createdAt).toLocaleDateString('en-BD', {
        year: 'numeric', month: 'long', day: 'numeric'
      }), 60, invoiceBoxY + 67);

      // Right side - Payment details
      doc.fontSize(10).fillColor('#666666').text('PAYMENT METHOD', 350, invoiceBoxY + 15);
      doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold').text(order.paymentMethod.toUpperCase(), 350, invoiceBoxY + 32);

      doc.fontSize(10).fillColor('#666666').font('Helvetica').text('PAYMENT STATUS', 350, invoiceBoxY + 52);
      const statusColor = order.paymentStatus === 'paid' ? '#10b981' : '#f59e0b';
      doc.fontSize(12).fillColor(statusColor).font('Helvetica-Bold').text(
        order.paymentStatus?.toUpperCase() || 'PENDING',
        350,
        invoiceBoxY + 67
      );

      // Customer details section
      let yPos = 290;
      doc.fontSize(10).font('Helvetica-Bold').text('SHIP TO:', 50, yPos);
      doc.fillColor('#000000').font('Helvetica');

      yPos += 20;
      const shipping = order.shippingAddress || {};

      doc.fontSize(12).font('Helvetica-Bold').text(shipping.name || '', 50, yPos);
      yPos += 18;
      doc.fontSize(10).font('Helvetica').text(`Phone: ${shipping.phone || ''}`, 50, yPos);
      yPos += 15;
      if (shipping.email) {
        doc.text(`Email: ${shipping.email}`, 50, yPos);
        yPos += 15;
      }

      doc.fontSize(10).font('Helvetica-Bold').text('Address:', 50, yPos);
      yPos += 14;
      doc.font('Helvetica');

      const addressLine1 = [
        shipping.street,
        shipping.union
      ].filter(Boolean).join(', ');

      const addressLine2 = [
        shipping.subDistrict,
        shipping.district
      ].filter(Boolean).join(', ');

      const addressLine3 = [
        shipping.city,
        shipping.zipCode || shipping.postalCode
      ].filter(Boolean).join(' - ');

      if (addressLine1) { doc.text(addressLine1, 50, yPos, { width: 250 }); yPos += 14; }
      if (addressLine2) { doc.text(addressLine2, 50, yPos, { width: 250 }); yPos += 14; }
      if (addressLine3) { doc.text(addressLine3, 50, yPos, { width: 250 }); yPos += 14; }
      doc.text(shipping.country || 'Bangladesh', 50, yPos);

      // Items table
      yPos += 45;
      const tableTop = yPos;

      // Table header background
      doc.roundedRect(50, tableTop, 495, 30, 3).fill('#8B1538');

      // Table headers
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF');
      doc.text('PRODUCT', 65, tableTop + 10, { width: 220 });
      doc.text('QTY', 290, tableTop + 10, { width: 40, align: 'center' });
      doc.text('UNIT PRICE', 340, tableTop + 10, { width: 90, align: 'right' });
      doc.text('AMOUNT', 440, tableTop + 10, { width: 95, align: 'right' });

      // Table rows
      yPos = tableTop + 40;
      doc.font('Helvetica').fontSize(10).fillColor('#000000');

      order.items.forEach((item, index) => {
        // Stripe rows
        if (index % 2 === 0) {
          doc.rect(50, yPos - 5, 495, 25).fill('#f8f9fa');
          doc.fillColor('#000000');
        }

        doc.text(item.name || 'Product', 65, yPos, { width: 220 });
        doc.text(item.quantity.toString(), 290, yPos, { width: 40, align: 'center' });
        doc.text(`Tk ${item.price.toLocaleString()}`, 340, yPos, { width: 90, align: 'right' });
        doc.font('Helvetica-Bold').text(`Tk ${(item.price * item.quantity).toLocaleString()}`, 440, yPos, { width: 95, align: 'right' });
        doc.font('Helvetica');
        yPos += 25;

        // Check for page break
        if (yPos > 680) {
          doc.addPage();
          yPos = 50;
        }
      });

      // Separator line
      yPos += 10;
      doc.moveTo(50, yPos).lineTo(545, yPos).stroke('#8B1538');

      // Totals section
      yPos += 20;
      const totalsX = 330;

      doc.fontSize(10).fillColor('#666666');
      doc.text('Subtotal:', totalsX, yPos, { width: 100, align: 'right' });
      doc.fillColor('#000000').text(`Tk ${order.subtotal.toLocaleString()}`, 440, yPos, { width: 95, align: 'right' });
      yPos += 18;

      if (order.tax && order.tax > 0) {
        doc.fillColor('#666666').text('Tax:', totalsX, yPos, { width: 100, align: 'right' });
        doc.fillColor('#000000').text(`Tk ${order.tax.toLocaleString()}`, 440, yPos, { width: 95, align: 'right' });
        yPos += 18;
      }

      const shippingCharge = order.shipping || order.delivery?.charge || 0;
      if (shippingCharge > 0) {
        doc.fillColor('#666666').text('Shipping:', totalsX, yPos, { width: 100, align: 'right' });
        doc.fillColor('#000000').text(`Tk ${shippingCharge.toLocaleString()}`, 440, yPos, { width: 95, align: 'right' });
        yPos += 18;
      }

      if (order.discount && order.discount > 0) {
        doc.fillColor('#666666').text('Discount:', totalsX, yPos, { width: 100, align: 'right' });
        doc.fillColor('#16a34a').text(`-Tk ${order.discount.toLocaleString()}`, 440, yPos, { width: 95, align: 'right' });
        yPos += 18;
      }

      // Total with background
      yPos += 10;
      doc.roundedRect(320, yPos - 8, 225, 35, 5).fill('#8B1538');
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#FFFFFF');
      doc.text('TOTAL AMOUNT:', totalsX + 10, yPos + 3, { width: 100, align: 'right' });
      doc.fontSize(16).text(`Tk ${order.total.toLocaleString()}`, 450, yPos + 3, { width: 85, align: 'right' });

      // Signature section
      yPos += 70;
      const signatureY = yPos + 40;

      // Left side: Customer Signature
      doc.lineWidth(0.5).strokeColor('#999999');
      doc.moveTo(50, signatureY).lineTo(180, signatureY).stroke();
      doc.fontSize(9).fillColor('#444444').font('Helvetica');
      doc.text('Customer\'s Signature', 50, signatureY + 5, { width: 130, align: 'center' });

      // Right side: Authorized Signature
      doc.moveTo(370, signatureY).lineTo(545, signatureY).stroke();

      // Stylized internal authorized signature placeholder
      doc.fontSize(14).fillColor('#8B1538').font('Helvetica-Bold');
      doc.text('RongRani', 380, signatureY - 20, { width: 155, align: 'center', oblique: true });

      doc.fontSize(9).fillColor('#444444').font('Helvetica');
      doc.text('Authorized Signature', 370, signatureY + 5, { width: 175, align: 'center' });
      doc.fontSize(8).fillColor('#999999');
      doc.text('E-verified by RongRani Team', 370, signatureY + 18, { width: 175, align: 'center' });

      // Thank you message
      yPos += 80;
      doc.roundedRect(50, yPos, 495, 60, 5).fill('#f8f9fa');
      doc.fillColor('#8B1538').font('Helvetica-Bold').fontSize(12);
      doc.text('Thank You For Your Purchase!', 50, yPos + 15, { align: 'center', width: 495 });

      doc.fillColor('#666666').font('Helvetica').fontSize(9);
      doc.text('We appreciate your business. For any questions, please contact info.rongrani@gmail.com', 50, yPos + 35, { align: 'center', width: 495 });

      // Page footer
      const footerY = 790;
      doc.moveTo(50, footerY).lineTo(545, footerY).stroke('#D4AF37');
      doc.fontSize(8).fillColor('#999999');
      doc.text('RongRani • Premium Handcrafted Gifts © 2026 • All Rights Reserved', 50, footerY + 10, { align: 'center', width: 495 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const generateReport = (data, type) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(20).text('RongRani', { align: 'center' });
      doc.fontSize(14).text(`${type} Report`, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();

      // Report content based on type
      if (type === 'Sales') {
        doc.fontSize(12);
        doc.text(`Total Orders: ${data.totalOrders}`);
        doc.text(`Total Revenue: $${data.totalRevenue.toFixed(2)}`);
        doc.text(`Average Order Value: $${data.averageOrderValue.toFixed(2)}`);
        doc.moveDown();

        // Monthly breakdown
        if (data.monthlyData) {
          doc.text('Monthly Sales:');
          data.monthlyData.forEach(month => {
            doc.text(`${month.month}: $${month.revenue.toFixed(2)} (${month.orders} orders)`);
          });
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateInvoice,
  generateReport,
};