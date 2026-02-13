const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = (order) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a document with slightly smaller margins for better fit
      const doc = new PDFDocument({
        margin: 40,
        size: 'A4',
        info: {
          Title: `Invoice - ${order._id}`,
          Author: 'RongRani',
        }
      });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Colors
      const maroon = '#8B2635';
      const gold = '#C5A059';
      const black = '#0f172a';
      const gray = '#64748b';
      const lightGray = '#f8fafc';

      // 1. Header (Premium Background)
      doc.rect(0, 0, 595, 120).fill(maroon);
      doc.rect(0, 120, 595, 2).fill(gold);

      // Logo and Branding
      const logoPath = path.join(__dirname, '../../public/RongRani-Circle.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 45, 25, { width: 55 });
        doc.fillColor('#FFFFFF');
        doc.fontSize(22).font('Helvetica-Bold').text('RongRani', 110, 35);
        doc.fontSize(10).font('Helvetica').text('The Art of Bespoke Gifting', 110, 62, { characterSpacing: 1 });
      } else {
        doc.fillColor('#FFFFFF');
        doc.fontSize(28).font('Helvetica-Bold').text('RongRani', 45, 35);
        doc.fontSize(12).font('Helvetica').text('Premium Handcrafted Gifts', 45, 70);
      }

      // Company Contact Info (In Header)
      doc.fontSize(8);
      doc.text("Cox's Bazar, Bangladesh", 110, 80);
      doc.text('info.rongrani@gmail.com', 110, 92);
      doc.text('+880 1851-075537', 110, 104);

      // Invoice Title
      doc.fontSize(20).font('Helvetica-Bold').text('TAX INVOICE', 350, 45, { align: 'right', width: 200 });

      // 2. Info Grid (Combined Rows to Save Space)
      let yPos = 145;
      doc.roundedRect(40, yPos, 515, 60, 10).fill(lightGray);
      doc.roundedRect(40, yPos, 515, 60, 10).lineWidth(0.5).stroke('#e2e8f0');

      // Row 1 Heading
      doc.fontSize(8).fillColor(gray).font('Helvetica-Bold');
      doc.text('INVOICE NO', 60, yPos + 12);
      doc.text('DATE', 180, yPos + 12);
      doc.text('PAYMENT', 300, yPos + 12);
      doc.text('STATUS', 440, yPos + 12);

      // Row 1 Content
      doc.fontSize(11).fillColor(maroon);
      doc.text(`#${order._id.toString().substring(0, 8).toUpperCase()}`, 60, yPos + 25);

      const orderDate = new Date(order.createdAt).toLocaleDateString('en-BD', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
      doc.fillColor(black).text(orderDate, 180, yPos + 25);

      doc.text(order.paymentMethod?.toUpperCase() || 'COD', 300, yPos + 25);

      const pStatus = order.paymentStatus || 'pending';
      const statusColor = pStatus === 'paid' ? '#10b981' : '#f59e0b';
      doc.fillColor(statusColor).text(pStatus.toUpperCase(), 440, yPos + 25);

      // 3. Address Section (Side-by-Side if helpful, but focusing on vertical efficiency)
      yPos = 225;
      const shipping = order.shippingAddress || {};

      doc.fontSize(9).fillColor(gold).font('Helvetica-Bold').text('SHIPPING RECIPIENT', 40, yPos);
      doc.rect(40, yPos + 12, 100, 1.5).fill(maroon);

      yPos += 25;
      doc.fontSize(12).fillColor(black).font('Helvetica-Bold').text(shipping.name || 'Valued Customer', 40, yPos);
      yPos += 16;
      doc.fontSize(9).fillColor(gray).font('Helvetica').text(`📞 ${shipping.phone || 'N/A'}`, 40, yPos);
      if (shipping.email) {
        yPos += 12;
        doc.text(`✉️ ${shipping.email}`, 40, yPos);
      }

      yPos += 14;
      doc.fillColor(black).font('Helvetica').fontSize(9);
      const fullAddress = [
        shipping.street,
        shipping.union,
        shipping.subDistrict,
        shipping.district,
        shipping.city,
        shipping.zipCode || shipping.postalCode,
        shipping.country || 'Bangladesh'
      ].filter(Boolean).join(', ');

      doc.text(fullAddress, 40, yPos, { width: 350, lineGap: 2 });

      // Calculate how many lines the address took to update yPos
      const addressLines = Math.ceil(doc.widthOfString(fullAddress) / 350) || 1;
      yPos += (addressLines * 12) + 20;

      // 4. Items Table
      const tableTop = yPos;
      doc.rect(40, tableTop, 515, 25).fill(maroon);

      doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF');
      doc.text('DESCRIPTION', 55, tableTop + 8);
      doc.text('QTY', 300, tableTop + 8, { width: 40, align: 'center' });
      doc.text('PRICE', 350, tableTop + 8, { width: 80, align: 'right' });
      doc.text('AMOUNT', 450, tableTop + 8, { width: 90, align: 'right' });

      yPos = tableTop + 25;
      doc.fillColor(black).font('Helvetica').fontSize(9);

      order.items.forEach((item, index) => {
        // Stripe background
        if (index % 2 === 0) {
          doc.rect(40, yPos, 515, 25).fill(lightGray);
          doc.fillColor(black);
        }

        doc.text(item.name || 'Product', 55, yPos + 8, { width: 230, ellipsis: true });
        doc.text(item.quantity.toString(), 300, yPos + 8, { width: 40, align: 'center' });
        doc.text(`${item.price.toLocaleString()}`, 350, yPos + 8, { width: 80, align: 'right' });
        doc.font('Helvetica-Bold').text(`${(item.price * item.quantity).toLocaleString()}`, 450, yPos + 8, { width: 90, align: 'right' });
        doc.font('Helvetica');

        yPos += 25;

        // Smart page break
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }
      });

      // 5. Summary Section
      yPos += 15;
      const summaryX = 350;
      doc.font('Helvetica').fontSize(9).fillColor(gray);

      doc.text('Subtotal:', summaryX, yPos, { width: 90, align: 'right' });
      doc.fillColor(black).text(`Tk ${order.subtotal.toLocaleString()}`, 450, yPos, { width: 90, align: 'right' });
      yPos += 15;

      const shippingCharge = order.shipping || order.delivery?.charge || 0;
      if (shippingCharge > 0) {
        doc.fillColor(gray).text('Shipping:', summaryX, yPos, { width: 90, align: 'right' });
        doc.fillColor(black).text(`Tk ${shippingCharge.toLocaleString()}`, 450, yPos, { width: 90, align: 'right' });
        yPos += 15;
      }

      if (order.discount > 0) {
        doc.fillColor(gray).text('Discount:', summaryX, yPos, { width: 90, align: 'right' });
        doc.fillColor('#10b981').text(`-Tk ${order.discount.toLocaleString()}`, 450, yPos, { width: 90, align: 'right' });
        yPos += 15;
      }

      // Total Box
      yPos += 5;
      doc.roundedRect(340, yPos, 215, 30, 5).fill(maroon);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(11);
      doc.text('TOTAL AMOUNT', 350, yPos + 10);
      doc.fontSize(13).text(`Tk ${order.total.toLocaleString()}`, 440, yPos + 8, { width: 100, align: 'right' });

      // 6. Signatures & Footer (Fixed position to avoid overflow)
      const bottomAreaY = Math.max(yPos + 80, 680);

      // Horizontal Divider
      doc.moveTo(40, bottomAreaY).lineTo(555, bottomAreaY).lineWidth(0.5).stroke('#e2e8f0');

      // Customer Side
      doc.moveTo(40, bottomAreaY + 50).lineTo(180, bottomAreaY + 50).stroke(gray);
      doc.fontSize(8).fillColor(gray).font('Helvetica');
      doc.text('Customer Signature', 40, bottomAreaY + 55, { width: 140, align: 'center' });

      // Merchant Side
      doc.moveTo(415, bottomAreaY + 50).lineTo(555, bottomAreaY + 50).stroke(maroon);
      doc.fontSize(12).fillColor(maroon).font('Helvetica-Bold');
      doc.text('RongRani', 415, bottomAreaY + 32, { width: 140, align: 'center' });
      doc.fontSize(8).fillColor(gray).font('Helvetica');
      doc.text('Authorized Seal', 415, bottomAreaY + 55, { width: 140, align: 'center' });

      // Final Message
      doc.fillColor(maroon).font('Helvetica-Bold').fontSize(11);
      doc.text('✨ Thank You For Your Trust in Our Art ✨', 0, 785, { align: 'center', width: 595 });

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