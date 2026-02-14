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

      // Premium Colors (Refined)
      const colors = {
        royalMaroon: '#8B2635',
        bespokeGold: '#C5A059', // Gold for accents
        midnight: '#1E293B',    // Softer black
        slate: '#64748B',       // Muted text
        cream: '#FAFAF9',       // Very light bg
        lightGray: '#F1F5F9',
        success: '#10B981',
        danger: '#EF4444'
      };

      // 1. HEADER: Minimalist & High-End
      // Instead of full block, use white space with distinct typography

      // Top Accent Line
      doc.rect(0, 0, 595, 6).fill(colors.royalMaroon);

      // Brand Section (Left)
      const logoPath = path.join(__dirname, '../../public/RongRani-Circle.png');
      if (fs.existsSync(logoPath)) {
        // Watermark (Centered & Large)
        doc.save();
        doc.opacity(0.03);
        doc.image(logoPath, 147, 250, { width: 300, align: 'center', valign: 'center' });
        doc.restore();

        // Header Logo
        doc.image(logoPath, 40, 30, { width: 50 });
      }

      // Brand Name
      doc.fillColor(colors.royalMaroon).font('Helvetica-Bold').fontSize(24).text('RongRani', 100, 35);

      // Tagline: "ELEGANCE IN EVERY HUE" (Sophisticated Typography)
      const taglineY = 62;
      doc.fillColor(colors.bespokeGold).font('Helvetica').fontSize(8);
      // Clean spacing
      doc.text('E L E G A N C E   I N   E V E R Y   H U E', 100, taglineY, { characterSpacing: 1 });

      // Invoice Details (Right Aligned)
      doc.font('Helvetica-Bold').fontSize(20).fillColor(colors.midnight).text('INVOICE', 350, 35, { align: 'right', width: 200 });
      doc.fontSize(8).font('Helvetica').fillColor(colors.slate).text('OFFICIAL CURATION MANIFEST', 350, 60, { align: 'right', width: 200, characterSpacing: 1 });
      doc.text(`ID: #${order.orderId || order._id.toString().substring(0, 8).toUpperCase()}`, 350, 72, { align: 'right', width: 200 });

      // QR Code (Neatly positioned below Invoice ID)
      if (qrBuffer) {
        doc.image(qrBuffer, 500, 85, { width: 50 });
        doc.fontSize(6).fillColor(colors.bespokeGold).text('Scan to Track', 500, 138, { width: 50, align: 'center' });
      }

      // Divider
      doc.moveTo(40, 150).lineTo(555, 150).strokeColor(colors.lightGray).lineWidth(1).stroke();

      // 2. DOSSIER (Client & Order Info) - Clean 2-Column Layout
      const infoY = 170;

      // Left: Client Details
      doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.bespokeGold).text('BILLED TO', 40, infoY);

      const shipping = order.shippingAddress || {};
      doc.fontSize(12).font('Helvetica-Bold').fillColor(colors.midnight).text(shipping.name || 'Valued Guest', 40, infoY + 15);

      doc.fontSize(9).font('Helvetica').fillColor(colors.slate).lineGap(4);
      doc.text(shipping.phone || '', 40, infoY + 32);
      if (shipping.email) doc.text(shipping.email);

      const addressLines = [
        shipping.street,
        `${shipping.city || ''} ${shipping.zipCode || ''}`.trim(),
        shipping.country || 'Bangladesh'
      ].filter(Boolean);

      doc.text(addressLines.join('\n'), { width: 250 });

      // Right: Order Logistics
      const rightColX = 350;
      doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.bespokeGold).text('ORDER DETAILS', rightColX, infoY);

      doc.font('Helvetica').fillColor(colors.midnight).lineGap(6);

      const orderDate = new Date(order.createdAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' });

      // Label-Value Pairs
      const drawField = (label, value, y) => {
        doc.fontSize(8).fillColor(colors.slate).text(label, rightColX, y);
        doc.fontSize(9).fillColor(colors.midnight).text(value, rightColX + 90, y, { align: 'right', width: 110 });
      };

      let currentY = infoY + 15;
      drawField('Date:', orderDate, currentY); currentY += 15;
      drawField('Pay Method:', order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod?.toUpperCase(), currentY); currentY += 15;
      drawField('Status:', (order.paymentStatus || 'Pending').toUpperCase(), currentY); currentY += 15;
      drawField('Courier:', 'RedX / Pathao', currentY); // Placeholder for future integration

      // Payment Status Stamp (Creative Placement)
      const isPaid = order.paymentStatus === 'paid';
      const isCod = order.paymentMethod === 'cod' && order.paymentStatus !== 'paid';

      if (isPaid || isCod) {
        doc.save();
        doc.opacity(0.1);
        const stampText = isPaid ? 'PAID' : 'DUE';
        const stampColor = isPaid ? colors.success : colors.danger;

        doc.translate(rightColX + 50, infoY + 80);
        doc.rotate(-10);
        doc.roundedRect(0, 0, 80, 30, 4).strokeColor(stampColor).lineWidth(2).stroke();
        doc.fontSize(14).font('Helvetica-Bold').fillColor(stampColor).text(stampText, 0, 8, { width: 80, align: 'center' });
        doc.restore();
      }

      // 3. ITEMIZATION (Modern Table)
      const tableY = 300;

      // Header
      doc.rect(40, tableY, 515, 25).fill(colors.cream);
      doc.fontSize(8).font('Helvetica-Bold').fillColor(colors.royalMaroon);

      doc.text('DESCRIPTION', 55, tableY + 8);
      doc.text('QTY', 320, tableY + 8, { width: 40, align: 'center' });
      doc.text('UNIT PRICE', 380, tableY + 8, { width: 60, align: 'right' });
      doc.text('AMOUNT', 460, tableY + 8, { width: 90, align: 'right' });

      // Rows
      let y = tableY + 30;
      doc.font('Helvetica').fontSize(9).fillColor(colors.midnight);

      order.items.forEach((item, i) => {
        const rowHeight = 25;

        // Row Line
        doc.moveTo(40, y + rowHeight).lineTo(555, y + rowHeight).strokeColor(colors.lightGray).lineWidth(0.5).stroke();

        doc.text(item.name, 55, y + 8, { width: 260, ellipsis: true });
        doc.text(item.quantity, 320, y + 8, { width: 40, align: 'center' });
        doc.text(item.price.toLocaleString(), 380, y + 8, { width: 60, align: 'right' });

        doc.font('Helvetica-Bold');
        doc.text((item.price * item.quantity).toLocaleString(), 460, y + 8, { width: 90, align: 'right' });
        doc.font('Helvetica');

        y += rowHeight;
      });

      // 4. FINANCIAL SUMMARY (Clean, Right-Aligned)
      const summaryY = y + 20;
      const sumX = 350;
      const sumW = 205;

      const drawSum = (label, value, bold = false, color = colors.midnight) => {
        doc.fontSize(9).font(bold ? 'Helvetica-Bold' : 'Helvetica').fillColor(colors.slate).text(label, sumX, y, { width: 100, align: 'right' });
        doc.fillColor(color).text(value, 460, y, { width: 90, align: 'right' });
        y += 18;
      };

      y = summaryY;
      drawSum('Subtotal', `Tk ${order.subtotal.toLocaleString()}`);
      drawSum('Shipping', `Tk ${(order.shipping || 0).toLocaleString()}`);
      if (order.discount > 0) drawSum('Discount', `- Tk ${order.discount.toLocaleString()}`, false, colors.success);

      // Divider
      doc.moveTo(sumX + 20, y).lineTo(555, y).strokeColor(colors.royalMaroon).lineWidth(1).stroke();
      y += 10;

      // Total
      doc.fontSize(14).font('Helvetica-Bold').fillColor(colors.royalMaroon).text('Total', sumX, y, { width: 100, align: 'right' });
      doc.text(`Tk ${order.total.toLocaleString()}`, 460, y, { width: 90, align: 'right' });


      // 5. SIGNATURES (Script Style for Authority)
      const sigY = 740;

      // Admin / Authority (Left Side this time? Standard is Right for Auth, Left for Customer. Let's keep Right for Auth)

      // Authorized Signature (Script Style)
      // Using Times-Italic to simulate script/handwriting elegance
      doc.font('Times-Italic').fontSize(16).fillColor(colors.royalMaroon).text('RongRani', 400, sigY - 20, { align: 'center', width: 150 });
      doc.moveTo(400, sigY).lineTo(550, sigY).strokeColor(colors.slate).lineWidth(0.5).stroke();
      doc.fontSize(7).font('Helvetica').fillColor(colors.slate).text('AUTHORIZED SIGNATURE', 400, sigY + 5, { align: 'center', width: 150, characterSpacing: 1 });

      // Customer Signature
      doc.moveTo(40, sigY).lineTo(190, sigY).strokeColor(colors.slate).lineWidth(0.5).stroke();
      doc.text('CUSTOMER SIGNATURE', 40, sigY + 5, { align: 'center', width: 150, characterSpacing: 1 });


      // Footer Info
      doc.fontSize(7).fillColor(colors.slate).text('Thank you for choosing RongRani. For support, contact 01851075537', 40, 780, { align: 'center', width: 515 });
      doc.text('www.rongrani.com', 40, 792, { align: 'center', width: 515 });

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