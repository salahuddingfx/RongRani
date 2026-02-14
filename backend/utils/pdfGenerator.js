const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const generateInvoice = async (order) => {
  // Fetch QR Code for Tracking
  let qrBuffer = null;
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'https://rongrani.vercel.app';
    const trackingUrl = `${frontendUrl}/track/${order.orderId || order._id}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(trackingUrl)}`;
    const response = await axios.get(qrApiUrl, { responseType: 'arraybuffer' });
    qrBuffer = Buffer.from(response.data);
  } catch (error) {
    console.error('Error generating QR code for invoice:', error.message);
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Colors & Fonts
      const colors = {
        royalMaroon: '#8B2635',
        bespokeGold: '#C5A059',
        midnight: '#0F172A',
        slate: '#64748B',
        cream: '#FEFAF2',
        success: '#10B981'
      };

      // 1. HEADER: Compact & Elegant
      doc.rect(0, 0, 595, 115).fill(colors.royalMaroon); // Reduced height
      doc.rect(0, 115, 595, 4).fill(colors.bespokeGold);

      // Decorative Accent
      doc.lineWidth(0.5).strokeColor(colors.bespokeGold).opacity(0.3);
      doc.moveTo(40, 95).lineTo(555, 95).stroke();
      doc.opacity(1);

      // Logo & Brand
      const logoPath = path.join(__dirname, '../../public/RongRani-Circle.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 45, 20, { width: 60 }); // Slightly smaller logo
        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(26).text('RongRani', 115, 30);

        // TAGLINE: "ELEGANCE IN EVERY HUE" (Small Caps Style)
        const taglineY = 62;
        const bigReq = 10;
        const smallReq = 7.5;

        doc.fillColor('#E2E8F0').font('Helvetica');
        // E
        doc.fontSize(bigReq).text('E', 115, taglineY, { continued: true, characterSpacing: 1 });
        doc.fontSize(smallReq).text('LEGANCE ', { continued: true, characterSpacing: 2 });
        // I
        doc.fontSize(bigReq).text('I', { continued: true, characterSpacing: 1 });
        doc.fontSize(smallReq).text('N ', { continued: true, characterSpacing: 2 });
        // E
        doc.fontSize(bigReq).text('E', { continued: true, characterSpacing: 1 });
        doc.fontSize(smallReq).text('VERY ', { continued: true, characterSpacing: 2 });
        // H
        doc.fontSize(bigReq).text('H', { continued: true, characterSpacing: 1 });
        doc.fontSize(smallReq).text('UE', { characterSpacing: 2 });

      } else {
        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(36).text('RongRani', 45, 35);
      }

      // Registry Title & Challan Header (Moved Up)
      doc.fontSize(22).font('Helvetica-Bold').fillColor('#FFFFFF').text('INVOICE / CHALLAN', 330, 35, { align: 'right', width: 220 });
      doc.fontSize(9).font('Helvetica').text('OFFICIAL DELIVERY MANIFEST', 330, 62, { align: 'right', width: 220, characterSpacing: 1.5 });

      // QR Code Placement (Compact)
      if (qrBuffer) {
        doc.image(qrBuffer, 495, 75, { width: 40 });
        doc.fontSize(6).fillColor(colors.bespokeGold).text('Scan to Track', 495, 118, { width: 40, align: 'center' });
      }

      // 2. REGISTRY DETAILS (Compact Floating Box)
      let yPos = 135; // Moved up from 165
      doc.roundedRect(40, yPos, 515, 55, 4).fill(colors.cream); // Reduced height
      doc.roundedRect(40, yPos, 515, 55, 4).lineWidth(1).strokeColor(colors.bespokeGold).stroke();

      doc.fontSize(7).fillColor(colors.slate).font('Helvetica-Bold');
      doc.text('ORDER REFERENCE', 60, yPos + 12);
      doc.text('ORDER DATE', 200, yPos + 12);
      doc.text('PAYMENT METHOD', 330, yPos + 12);
      doc.text('PAYMENT STATUS', 460, yPos + 12);

      doc.fontSize(12).fillColor(colors.royalMaroon).font('Helvetica-Bold');
      doc.text(`#${order.orderId || order._id.toString().substring(0, 8).toUpperCase()}`, 60, yPos + 28);

      const orderDate = new Date(order.createdAt).toLocaleDateString('en-BD', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
      doc.fontSize(10).fillColor(colors.midnight).font('Helvetica').text(orderDate, 200, yPos + 30);
      doc.text(order.paymentMethod === 'cod' ? 'CASH ON DELIVERY' : order.paymentMethod?.toUpperCase(), 330, yPos + 30);

      const pStatus = order.paymentStatus || 'pending';
      const statusColor = pStatus === 'paid' ? colors.success : '#D97706';
      doc.fillColor(statusColor).font('Helvetica-Bold').text(pStatus.toUpperCase(), 460, yPos + 30);

      // 3. DESTINATION DOSSIER (Compact)
      yPos = 210; // Moved up from 260
      doc.fontSize(10).fillColor(colors.bespokeGold).font('Helvetica-Bold').text('CLIENT DESTINATION', 40, yPos, { characterSpacing: 1 });
      doc.rect(40, yPos + 14, 515, 0.5).fill(colors.slate).opacity(0.1);
      doc.opacity(1);

      yPos += 20;
      const shipping = order.shippingAddress || {};

      // Address Box (Compact)
      doc.rect(40, yPos, 300, 70).fill('#F8FAFC');

      doc.fontSize(14).fillColor(colors.midnight).font('Helvetica-Bold').text(shipping.name || 'Valued Guest', 50, yPos + 8);

      doc.fontSize(9).fillColor(colors.midnight).font('Helvetica').text(shipping.phone || 'N/A', 50, yPos + 28);
      if (shipping.email) doc.text(shipping.email, 160, yPos + 28);

      const fullAddress = [
        shipping.street,
        shipping.union,
        shipping.subDistrict,
        shipping.district,
        shipping.zipCode
      ].filter(Boolean).join(', ');

      doc.fontSize(9).fillColor(colors.slate).text(fullAddress, 50, yPos + 42, { width: 280, lineGap: 1 });

      // Right side: Badge (Aligned)
      doc.image(logoPath, 420, yPos + 5, { width: 35, opacity: 0.5 });
      doc.fillColor(colors.bespokeGold).fontSize(7).font('Helvetica-Bold').text('CERTIFIED ARTISAN QUALITY', 380, yPos + 45, { align: 'center', width: 120 });

      // 4. THE CURATION TABLE (Compact)
      yPos = 310; // Moved up/calculated
      doc.rect(40, yPos, 515, 20).fill(colors.royalMaroon);
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');
      doc.text('ITEM DESCRIPTION', 60, yPos + 6);
      doc.text('QTY', 320, yPos + 6, { width: 40, align: 'center' });
      doc.text('PRICE', 370, yPos + 6, { width: 70, align: 'right' });
      doc.text('TOTAL', 450, yPos + 6, { width: 90, align: 'right' });

      yPos += 20;
      doc.fillColor(colors.midnight).font('Helvetica').fontSize(9);

      // Limit items to fit on page (if many) or just list them compactly
      order.items.forEach((item, index) => {
        if (index % 2 === 0) {
          doc.rect(40, yPos, 515, 20).fill('#F9FAFB'); // Reduced height
        }
        doc.fillColor(colors.midnight).text(item.name || 'Artisan Work', 60, yPos + 6, { width: 250, ellipsis: true });
        doc.text(item.quantity.toString(), 320, yPos + 6, { width: 40, align: 'center' });
        doc.text(item.price.toLocaleString(), 370, yPos + 6, { width: 70, align: 'right' });
        doc.font('Helvetica-Bold').text((item.price * item.quantity).toLocaleString(), 450, yPos + 6, { width: 90, align: 'right' });
        doc.font('Helvetica');
        yPos += 20;
      });

      // 5. FINANCIAL SUMMARY
      yPos += 10;
      const summaryX = 350;
      doc.moveTo(summaryX, yPos).lineTo(555, yPos).strokeColor(colors.slate).lineWidth(0.5).stroke();
      yPos += 5;

      doc.fontSize(8).fillColor(colors.slate).font('Helvetica');
      doc.text('Subtotal:', summaryX, yPos, { width: 100, align: 'right' });
      doc.fillColor(colors.midnight).text(`Tk ${order.subtotal.toLocaleString()}`, 450, yPos, { width: 90, align: 'right' });
      yPos += 12;

      const shippingCharge = order.shipping || order.delivery?.charge || 0;
      doc.fillColor(colors.slate).text('Delivery Charge:', summaryX, yPos, { width: 100, align: 'right' });
      doc.fillColor(colors.midnight).text(`Tk ${shippingCharge.toLocaleString()}`, 450, yPos, { width: 90, align: 'right' });
      yPos += 12;

      if (order.discount > 0) {
        doc.fillColor(colors.slate).text('Discount:', summaryX, yPos, { width: 100, align: 'right' });
        doc.fillColor('#10B981').text(`-Tk ${order.discount.toLocaleString()}`, 450, yPos, { width: 90, align: 'right' });
        yPos += 12;
      }

      // Grand Total
      doc.rect(summaryX, yPos + 3, 205, 25).fill(colors.royalMaroon);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(11).text('TOTAL DUE', summaryX + 10, yPos + 10);
      doc.fontSize(14).text(`Tk ${order.total.toLocaleString()}`, 450, yPos + 8, { width: 90, align: 'right' });


      // 6. SIGNATURE SECTION (Fixed at Bottom, but ensured enough space)
      // Check if yPos is too close to bottom (max page height approx 840)
      // Signatures at 750 is safe.
      const sigY = 740;

      // Customer Signature
      doc.moveTo(60, sigY).lineTo(200, sigY).strokeColor(colors.midnight).lineWidth(1).stroke();
      doc.fontSize(9).fillColor(colors.midnight).font('Helvetica-Bold').text('Customer Signature', 60, sigY + 8, { width: 140, align: 'center' });

      // Admin/Authority Signature
      doc.moveTo(395, sigY).lineTo(535, sigY).strokeColor(colors.midnight).lineWidth(1).stroke();
      doc.fontSize(9).fillColor(colors.royalMaroon).font('Helvetica-Bold').text('Authorized Signature', 395, sigY + 8, { width: 140, align: 'center' });

      // Footer Branding
      doc.fontSize(7).fillColor(colors.slate).text('© 2026 RongRani - Curated with Passion by Salah Uddin Kader. All Rights Reserved.', 0, 790, { align: 'center', width: 595 });

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