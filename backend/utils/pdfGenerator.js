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
      
      // Header
      doc.fillColor('#FFFFFF');
      doc.fontSize(32).font('Helvetica-Bold').text('RongRani', 50, 40);
      doc.fontSize(14).font('Helvetica').text('Premium Handcrafted Gifts', 50, 75);
      doc.fontSize(10).text('Cox\'s Bazar, Bangladesh', 50, 92);
      doc.fontSize(10).text('Email: support@chirkutghor.com', 50, 107);
      doc.fontSize(10).text('Phone: +880 1234-567890', 50, 122);
      
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
      doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold').text(`#${order._id.substring(0, 8).toUpperCase()}`, 60, invoiceBoxY + 32);
      
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
      doc.fillColor('#8B1538').fontSize(14).font('Helvetica-Bold').text('BILL TO:', 50, yPos);
      doc.fillColor('#000000').font('Helvetica');
      
      yPos += 25;
      const shipping = order.shippingAddress || {};

      doc.fontSize(12).font('Helvetica-Bold').text(shipping.name || '', 50, yPos);
      yPos += 18;
      doc.fontSize(10).font('Helvetica').text(shipping.email || '', 50, yPos);
      yPos += 15;
      doc.text(shipping.phone || '', 50, yPos);
      yPos += 15;
      doc.text(shipping.street || '', 50, yPos);
      yPos += 15;
      const cityState = [shipping.city, shipping.state].filter(Boolean).join(', ');
      const cityLine = [cityState, shipping.zipCode].filter(Boolean).join(' ').trim();
      doc.text(cityLine || shipping.city || '', 50, yPos);
      yPos += 15;
      doc.text(shipping.country || '', 50, yPos);
      
      // Items table
      yPos += 35;
      const tableTop = yPos;
      
      // Table header background
      doc.roundedRect(50, tableTop, 495, 30, 3).fill('#8B1538');
      
      // Table headers
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF');
      doc.text('PRODUCT', 60, tableTop + 10, { width: 200 });
      doc.text('QTY', 270, tableTop + 10, { width: 50, align: 'center' });
      doc.text('UNIT PRICE', 330, tableTop + 10, { width: 100, align: 'right' });
      doc.text('AMOUNT', 440, tableTop + 10, { width: 95, align: 'right' });
      
      // Table rows
      yPos = tableTop + 40;
      doc.font('Helvetica').fontSize(10).fillColor('#000000');
      
      order.items.forEach((item, index) => {
        // Alternate row background
        if (index % 2 === 0) {
          doc.rect(50, yPos - 5, 495, 25).fill('#f9fafb');
          doc.fillColor('#000000');
        }
        
        doc.text(item.name || 'Product', 60, yPos, { width: 200 });
        doc.text(item.quantity.toString(), 270, yPos, { width: 50, align: 'center' });
        doc.text(`৳${item.price.toFixed(2)}`, 330, yPos, { width: 100, align: 'right' });
        doc.font('Helvetica-Bold').text(`৳${(item.price * item.quantity).toFixed(2)}`, 440, yPos, { width: 95, align: 'right' });
        doc.font('Helvetica');
        yPos += 25;
      });
      
      // Separator line
      yPos += 10;
      doc.moveTo(50, yPos).lineTo(545, yPos).stroke('#8B1538');
      
      // Totals section
      yPos += 20;
      const totalsX = 330;
      
      doc.fontSize(10).fillColor('#666666');
      doc.text('Subtotal:', totalsX, yPos, { width: 100, align: 'right' });
      doc.fillColor('#000000').text(`৳${order.subtotal.toFixed(2)}`, 440, yPos, { width: 95, align: 'right' });
      yPos += 18;
      
      if (order.tax && order.tax > 0) {
        doc.fillColor('#666666').text('Tax:', totalsX, yPos, { width: 100, align: 'right' });
        doc.fillColor('#000000').text(`৳${order.tax.toFixed(2)}`, 440, yPos, { width: 95, align: 'right' });
        yPos += 18;
      }
      
      if (order.shipping && order.shipping > 0) {
        doc.fillColor('#666666').text('Shipping:', totalsX, yPos, { width: 100, align: 'right' });
        doc.fillColor('#000000').text(`৳${order.shipping.toFixed(2)}`, 440, yPos, { width: 95, align: 'right' });
        yPos += 18;
      }
      
      if (order.discount && order.discount > 0) {
        doc.fillColor('#666666').text('Discount:', totalsX, yPos, { width: 100, align: 'right' });
        doc.fillColor('#16a34a').text(`-৳${order.discount.toFixed(2)}`, 440, yPos, { width: 95, align: 'right' });
        yPos += 18;
      }
      
      // Total with background
      yPos += 10;
      doc.roundedRect(320, yPos - 8, 225, 35, 5).fill('#8B1538');
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#FFFFFF');
      doc.text('TOTAL AMOUNT:', totalsX + 10, yPos + 3, { width: 100, align: 'right' });
      doc.fontSize(16).text(`৳${order.total.toFixed(2)}`, 450, yPos + 3, { width: 85, align: 'right' });
      
      // Footer section
      yPos += 60;
      
      // Thank you message
      doc.roundedRect(50, yPos, 495, 80, 5).fill('#f9fafb');
      doc.fillColor('#8B1538').font('Helvetica-Bold').fontSize(14);
      doc.text('Thank You For Your Purchase!', 50, yPos + 15, { align: 'center', width: 495 });
      
      doc.fillColor('#666666').font('Helvetica').fontSize(10);
      doc.text('We appreciate your business. For any questions or concerns,', 50, yPos + 40, { align: 'center', width: 495 });
      doc.text('please contact us at support@chirkutghor.com', 50, yPos + 55, { align: 'center', width: 495 });
      
      // Page footer
      const footerY = 750;
      doc.moveTo(50, footerY).lineTo(545, footerY).stroke('#D4AF37');
      doc.fontSize(8).fillColor('#999999');
      doc.text('This is a computer-generated invoice and does not require a signature.', 50, footerY + 10, { align: 'center', width: 495 });
      doc.text('RongRani © 2026 • All Rights Reserved', 50, footerY + 25, { align: 'center', width: 495 });
      
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