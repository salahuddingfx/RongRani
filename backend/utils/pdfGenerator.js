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

  const frontendUrl = (process.env.FRONTEND_URL || 'https://rongrani.vercel.app').replace(/\/+$/, '');

  const resolveImageUrl = (value) => {
    if (!value) return '';
    if (typeof value === 'object' && value.url) return resolveImageUrl(value.url);
    if (typeof value !== 'string') return '';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    if (value.startsWith('/')) return `${frontendUrl}${value}`;
    return value;
  };

  const fetchImageBuffer = async (url) => {
    if (!url) return null;
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 8000 });
      return Buffer.from(response.data);
    } catch (error) {
      console.warn('Invoice image fetch failed:', error.message);
      return null;
    }
  };

  const imageBuffers = await Promise.all(order.items.map(async (item) => {
    const productImage = resolveImageUrl(item.product?.images?.[0]) || resolveImageUrl(item.image);
    return fetchImageBuffer(productImage);
  }));

  return new Promise((resolve, reject) => {
    try {
      const displayOrderId = (order.orderId || '').toString().trim() || order._id.toString().slice(-7).toUpperCase();
      // Changed size to A5 for "2 invoices per A4" requirement
      const doc = new PDFDocument({ size: 'A5', margin: 25 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Premium Colors (Refined)
      const colors = {
        royalMaroon: '#8B2635',
        bespokeGold: '#C5A059',
        midnight: '#1E293B',
        slate: '#64748B',
        cream: '#FAFAF9',
        lightGray: '#F1F5F9',
        success: '#10B981',
        danger: '#EF4444'
      };

      // A5 dimensions are approx 420 x 595
      const pageWidth = 420;
      const pageHeight = 595;

      // --- Helper Functions for Consistent Layout ---
      const drawHeader = (pageNum) => {
        // Top Accent Line
        doc.rect(0, 0, pageWidth, 4).fill(colors.royalMaroon);

        // Header Logo
        const logoPath = path.join(__dirname, '../../public/RongRani-Logo.png');
        if (fs.existsSync(logoPath)) {
          doc.save();
          doc.circle(45, 40, 18).clip();
          doc.image(logoPath, 27, 22, { width: 36 });
          doc.restore();
          doc.circle(45, 40, 18).lineWidth(0.5).stroke(colors.bespokeGold);
        }

        // Brand Name
        doc.fillColor(colors.royalMaroon).font('Helvetica-Bold').fontSize(18).text('RongRani', 70, 28);

        // Tagline
        doc.fillColor(colors.bespokeGold).font('Helvetica').fontSize(6);
        doc.text('E L E G A N C E   I N   E V E R Y   H U E', 70, 48, { characterSpacing: 0.5 });

        // Invoice Header Block (Only on first page)
        if (pageNum === 1) {
          doc.rect(280, 25, 115, 35, 3).fill(colors.royalMaroon);
          doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(14).text('INVOICE', 280, 32, { align: 'center', width: 115 });
          doc.fontSize(5).font('Helvetica').fillColor('#FFFFFF').text('OFFICIAL MANIFEST', 280, 48, { align: 'center', width: 115, characterSpacing: 1 });

          doc.fillColor(colors.slate).fontSize(7).text(`ID: #${displayOrderId}`, 180, 70, { align: 'right', width: 160 });

          if (qrBuffer) {
            doc.image(qrBuffer, 350, 65, { width: 35 });
            doc.fontSize(5).fillColor(colors.bespokeGold).text('Track Order', 350, 102, { width: 35, align: 'center' });
          }
        } else {
          doc.fillColor(colors.slate).fontSize(7).text(`Invoice #${displayOrderId} - Page ${pageNum}`, 280, 30, { align: 'right', width: 115 });
        }

        // Navigation Line
        doc.rect(25, 115, 370, 1.5).fill(colors.royalMaroon);
        doc.rect(25, 116.5, 370, 10).fill(colors.lightGray);
        doc.fillColor(colors.royalMaroon).font('Helvetica-Bold').fontSize(6).text('QUALITY • AUTHENTICITY • ELEGANCE', 25, 118, { align: 'center', width: 370, characterSpacing: 1.5 });
      };

      const drawFooter = () => {
        const footerY = pageHeight - 35;
        doc.rect(25, footerY - 4, 370, 0.5).fill(colors.lightGray);
        doc.fontSize(6).fillColor(colors.slate).text('Thank you for choosing RongRani. For support, contact 01851075537', 25, footerY, { align: 'center', width: 370 });
        doc.fillColor(colors.royalMaroon).font('Helvetica-Bold').text('FB: /rongrani • IG: @rongrani • WA: +8801851075537 • www.rongrani.com', 25, footerY + 10, { align: 'center', width: 370 });
      };

      const drawTableHeader = (yPos) => {
        doc.rect(25, yPos, 370, 20).fill(colors.cream);
        doc.fontSize(7).font('Helvetica-Bold').fillColor(colors.royalMaroon);
        doc.text('DESCRIPTION', 35, yPos + 6);
        doc.text('QTY', 230, yPos + 6, { width: 30, align: 'center' });
        doc.text('PRICE', 270, yPos + 6, { width: 50, align: 'right' });
        doc.text('TOTAL', 330, yPos + 6, { width: 60, align: 'right' });
      };

      // --- Page 1 Initialization ---
      let currentPage = 1;
      drawHeader(currentPage);

      const infoY = 135;
      doc.y = infoY;

      // Watermark
      if (fs.existsSync(logoPath)) {
        doc.save();
        doc.opacity(0.012);
        doc.image(logoPath, 110, 200, { width: 200 });
        doc.restore();
      }

      // Client Info
      doc.fontSize(7).font('Helvetica-Bold').fillColor(colors.bespokeGold).text('BILLED TO', 25, infoY);
      const shipping = order.shippingAddress || {};
      doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.midnight).text(shipping.name || 'Valued Guest', 25, infoY + 10);
      doc.fontSize(6.5).font('Helvetica').fillColor(colors.slate).lineGap(1);
      doc.text(shipping.phone || '', 25, infoY + 22);
      if (shipping.email) doc.text(shipping.email);
      const addressLines = [shipping.street, shipping.city, shipping.district].filter(Boolean);
      doc.text(addressLines.join(', '), { width: 180 });

      const rightColX = 230;
      doc.fontSize(7).font('Helvetica-Bold').fillColor(colors.bespokeGold).text('ORDER DETAILS', rightColX, infoY);
      const orderDate = new Date(order.createdAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' });

      const drawField = (label, value, y) => {
        doc.fontSize(6.5).fillColor(colors.slate).text(label, rightColX, y);
        doc.fontSize(6.5).fillColor(colors.midnight).text(value, rightColX + 70, y, { align: 'right', width: 90 });
      };

      drawField('Date:', orderDate, infoY + 10);
      drawField('Method:', (order.paymentMethod || '').toUpperCase(), infoY + 20);
      drawField('Status:', (order.paymentStatus || 'Pending').toUpperCase(), infoY + 30);
      drawField('Courier:', 'Standard', infoY + 40);

      // PAID STAMP
      if (order.paymentStatus === 'paid' || order.isPaid) {
        doc.save();
        doc.rotate(-15, { origin: [350, 140] });
        doc.rect(320, 125, 60, 20).fill('#10B981');
        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9).text('PAID', 320, 131, { width: 60, align: 'center' });
        doc.restore();
      }

      // --- Itemization Table ---
      let tableY = 200;
      drawTableHeader(tableY);
      let currentY = tableY + 25;

      order.items.forEach((item, index) => {
        const productData = item.product || {};
        const textWidth = 150;
        const imageBuffer = imageBuffers[index];
        const displayName = item.name || productData.name || 'Item';
        const displaySku = productData.sku || item.sku;
        
        const mainTextHeight = doc.heightOfString(displayName, { width: textWidth, font: 'Helvetica-Bold', size: 7 });
        const skuTextHeight = displaySku ? doc.heightOfString(`SKU: ${displaySku}`, { width: textWidth, font: 'Helvetica', size: 6 }) : 0;
        const rowHeight = Math.max(28, mainTextHeight + skuTextHeight + 8);

        if (currentY + rowHeight > pageHeight - 120) {
          drawFooter();
          doc.addPage();
          currentPage++;
          drawHeader(currentPage);
          currentY = 135;
          drawTableHeader(currentY);
          currentY += 25;
        }

        doc.moveTo(25, currentY + rowHeight).lineTo(395, currentY + rowHeight).strokeColor(colors.lightGray).lineWidth(0.5).stroke();

        if (imageBuffer) {
          try {
            doc.image(imageBuffer, 30, currentY + 3, { width: 22, height: 22 });
          } catch (e) {}
        }

        let textCursorY = currentY + 3;
        doc.fillColor(colors.midnight).font('Helvetica-Bold').fontSize(7).text(displayName, 60, textCursorY, { width: textWidth });
        textCursorY += mainTextHeight + 1;
        if (displaySku) {
          doc.fillColor(colors.slate).font('Helvetica').fontSize(6).text(`SKU: ${displaySku}`, 60, textCursorY, { width: textWidth });
        }
        
        doc.fillColor(colors.midnight).font('Helvetica').fontSize(7);
        doc.text(item.quantity, 230, currentY + (rowHeight / 2 - 3.5), { width: 30, align: 'center' });
        doc.text(item.price.toLocaleString(), 270, currentY + (rowHeight / 2 - 3.5), { width: 50, align: 'right' });
        doc.font('Helvetica-Bold').text((item.price * item.quantity).toLocaleString(), 330, currentY + (rowHeight / 2 - 3.5), { width: 60, align: 'right' });
        currentY += rowHeight;
      });

      // --- Financial Summary ---
      if (currentY + 60 > pageHeight - 80) {
        drawFooter();
        doc.addPage();
        currentPage++;
        drawHeader(currentPage);
        currentY = 135;
      }

      currentY += 10;
      const drawSum = (label, value, isTotal = false) => {
        doc.fontSize(isTotal ? 9 : 7).font(isTotal ? 'Helvetica-Bold' : 'Helvetica').fillColor(isTotal ? colors.royalMaroon : colors.slate).text(label, 250, currentY, { width: 80, align: 'right' });
        doc.fillColor(isTotal ? colors.royalMaroon : colors.midnight).text(value, 340, currentY, { width: 55, align: 'right' });
        currentY += isTotal ? 16 : 10;
      };

      drawSum('Subtotal:', `Tk ${order.subtotal.toLocaleString()}`);
      const isShipPaid = order.delivery?.isShippingPaid;
      drawSum(isShipPaid ? 'Ship (Paid):' : 'Shipping:', isShipPaid ? 'Tk 0' : `Tk ${(order.shipping || 0).toLocaleString()}`);
      if (order.discount > 0) drawSum('Discount:', `- Tk ${order.discount.toLocaleString()}`);

      doc.moveTo(280, currentY).lineTo(395, currentY).strokeColor(colors.royalMaroon).lineWidth(0.8).stroke();
      currentY += 5;
      drawSum('Total Amount:', `Tk ${order.total.toLocaleString()}`, true);

      // --- Signatures ---
      const sigY = pageHeight - 65;
      doc.moveTo(25, sigY).lineTo(100, sigY).strokeColor(colors.slate).lineWidth(0.5).stroke();
      doc.fontSize(5).font('Helvetica').fillColor(colors.slate).text('ADMIN', 25, sigY + 3, { align: 'center', width: 75 });

      doc.font('Times-Italic').fontSize(10).fillColor(colors.midnight).text(shipping.name || 'Customer', 160, sigY - 12, { align: 'center', width: 100 });
      doc.moveTo(160, sigY).lineTo(260, sigY).strokeColor(colors.slate).lineWidth(0.5).stroke();
      doc.fontSize(5).font('Helvetica').fillColor(colors.slate).text('CUSTOMER', 160, sigY + 3, { align: 'center', width: 100 });

      doc.font('Times-Italic').fontSize(12).fillColor(colors.royalMaroon).text('RongRani', 315, sigY - 14, { align: 'center', width: 85 });
      doc.moveTo(315, sigY).lineTo(400, sigY).strokeColor(colors.slate).lineWidth(0.5).stroke();
      doc.fontSize(5).font('Helvetica').fillColor(colors.slate).text('AUTHORIZED', 315, sigY + 3, { align: 'center', width: 85 });

      drawFooter();

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