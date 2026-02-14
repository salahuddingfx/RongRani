const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 40,
        size: 'A4',
        info: {
          Title: `Curation Registry - ${order._id}`,
          Author: 'RongRani',
        }
      });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // --- Color Palette ---
      const colors = {
        royalMaroon: '#580F1B', // Richer, darker maroon
        bespokeGold: '#C5A059', // Elegant muted gold
        midnight: '#0F172A',
        slate: '#475569',
        cream: '#FDFCFB',        // Subtlest off-white for background
        success: '#10B981'
      };

      // 1. HEADER: The Signature Look
      doc.rect(0, 0, 595, 140).fill(colors.royalMaroon);
      doc.rect(0, 140, 595, 3).fill(colors.bespokeGold);

      // Decorative Accent
      doc.lineWidth(0.5).strokeColor(colors.bespokeGold).opacity(0.3);
      doc.moveTo(40, 115).lineTo(555, 115).stroke();
      doc.opacity(1);

      // Logo & Brand
      const logoPath = path.join(__dirname, '../../public/RongRani-Circle.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 45, 25, { width: 65 });
        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(26).text('RongRani', 120, 38);
        doc.fontSize(10).font('Helvetica').text('THE ART OF BESPOKE GIFTING', 120, 68, { characterSpacing: 2 });
      } else {
        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(36).text('RongRani', 45, 35);
        doc.fontSize(12).font('Helvetica').text('THE ART OF BESPOKE GIFTING', 45, 75);
      }

      // Registry Title
      doc.fontSize(22).font('Helvetica-Bold').text('BESPOKE CURATION', 330, 45, { align: 'right', width: 220 });
      doc.fontSize(10).font('Helvetica').text('OFFICIAL REGISTRY', 330, 72, { align: 'right', width: 220, characterSpacing: 1.5 });

      // 2. REGISTRY DETAILS (Floating Box)
      let yPos = 165;
      doc.roundedRect(40, yPos, 515, 65, 8).fill(colors.cream);
      doc.roundedRect(40, yPos, 515, 65, 8).lineWidth(0.8).strokeColor(colors.bespokeGold).stroke();

      doc.fontSize(8).fillColor(colors.slate).font('Helvetica-Bold');
      doc.text('REGISTRY REFERENCE', 65, yPos + 15);
      doc.text('CURATION DATE', 200, yPos + 15);
      doc.text('PAYMENT MANIFEST', 330, yPos + 15);
      doc.text('STATUS', 460, yPos + 15);

      doc.fontSize(12).fillColor(colors.royalMaroon).font('Helvetica-Bold');
      doc.text(`#${order._id.toString().substring(0, 8).toUpperCase()}`, 65, yPos + 30);

      const orderDate = new Date(order.createdAt).toLocaleDateString('en-BD', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
      doc.fillColor(colors.midnight).font('Helvetica').text(orderDate, 200, yPos + 30);
      doc.text(order.paymentMethod?.toUpperCase() || 'COD', 330, yPos + 30);

      const pStatus = order.paymentStatus || 'pending';
      const statusColor = pStatus === 'paid' ? colors.success : '#D97706';
      doc.fillColor(statusColor).font('Helvetica-Bold').text(pStatus.toUpperCase(), 460, yPos + 30);

      // 3. DESTINATION DOSSIER
      yPos = 250;
      doc.fontSize(10).fillColor(colors.bespokeGold).font('Helvetica-Bold').text('CLIENT DESTINATION', 40, yPos, { characterSpacing: 1 });
      doc.rect(40, yPos + 14, 110, 2).fill(colors.royalMaroon);

      yPos += 30;
      const shipping = order.shippingAddress || {};
      doc.fontSize(14).fillColor(colors.midnight).font('Helvetica-Bold').text(shipping.name || 'Valued Guest', 40, yPos);

      yPos += 18;
      doc.fontSize(9).fillColor(colors.slate).font('Helvetica').text(`📞 ${shipping.phone || 'N/A'}`, 40, yPos);
      if (shipping.email) {
        yPos += 14;
        doc.text(`✉️ ${shipping.email}`, 40, yPos);
      }

      yPos += 14;
      const fullAddress = [
        shipping.street,
        shipping.union,
        shipping.subDistrict,
        shipping.district,
        shipping.city,
        shipping.zipCode || shipping.postalCode
      ].filter(Boolean).join(', ');

      doc.fillColor(colors.midnight).font('Helvetica').text(fullAddress, 40, yPos, { width: 320, lineGap: 2 });

      // Right side decorative badge (Artisan Certified)
      doc.roundedRect(380, 250, 160, 85, 8).fill('#F8FAFC');
      doc.fillColor(colors.bespokeGold).fontSize(8).font('Helvetica-Bold').text('CERTIFIED ARTISAN QUALITY', 390, 262, { align: 'center', width: 140 });
      doc.fillColor(colors.slate).font('Helvetica').fontSize(7).text('Each item in this curation has been inspected for artisanal excellence and handcrafted integrity.', 390, 278, { align: 'center', width: 140, lineGap: 2 });

      // 4. THE CURATION TABLE
      yPos = Math.max(yPos + 60, 360);
      doc.rect(40, yPos, 515, 30).fill(colors.royalMaroon);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF');
      doc.text('ARTICLE DESCRIPTION', 60, yPos + 11);
      doc.text('UNITS', 300, yPos + 11, { width: 40, align: 'center' });
      doc.text('VALUATION', 350, yPos + 11, { width: 80, align: 'right' });
      doc.text('TOTAL', 450, yPos + 11, { width: 90, align: 'right' });

      yPos += 30;
      doc.fillColor(colors.midnight).font('Helvetica').fontSize(10);

      order.items.forEach((item, index) => {
        if (index % 2 === 0) {
          doc.rect(40, yPos, 515, 28).fill('#F9FAFB');
        }
        doc.fillColor(colors.midnight).text(item.name || 'Artisan Work', 60, yPos + 9, { width: 230, ellipsis: true });
        doc.text(item.quantity.toString(), 300, yPos + 9, { width: 40, align: 'center' });
        doc.text(`${item.price.toLocaleString()}`, 350, yPos + 9, { width: 80, align: 'right' });
        doc.font('Helvetica-Bold').text(`${(item.price * item.quantity).toLocaleString()}`, 450, yPos + 9, { width: 90, align: 'right' });
        doc.font('Helvetica');
        yPos += 28;
      });

      // 5. FINANCIAL SUMMARY & LOYALTY INVITATION
      yPos += 20;

      // Bottom part left: Loyalty Invitation
      doc.roundedRect(40, yPos, 280, 95, 10).fill('#FEFAF2'); // Gold-tinted card
      doc.fillColor(colors.bespokeGold).font('Helvetica-Bold').fontSize(10).text('INVITATION TO RETURN', 55, yPos + 15);
      doc.fillColor(colors.slate).font('Helvetica').fontSize(8).text('As a token of our appreciation for your interest in artisanal craft, please enjoy 10% off your next curation.', 55, yPos + 32, { width: 250, lineGap: 2 });
      doc.rect(55, yPos + 62, 120, 22).fill(colors.royalMaroon);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10).text('LOYALTY10', 55, yPos + 69, { align: 'center', width: 120 });

      // Bottom part right: Totals
      const summaryX = 350;
      doc.fontSize(9).fillColor(colors.slate).font('Helvetica');
      doc.text('Subtotal Value:', summaryX, yPos + 10, { width: 90, align: 'right' });
      doc.fillColor(colors.midnight).text(`Tk ${order.subtotal.toLocaleString()}`, 450, yPos + 10, { width: 90, align: 'right' });

      const shippingCharge = order.shipping || order.delivery?.charge || 0;
      doc.fillColor(colors.slate).text('Bespoke Shipping:', summaryX, yPos + 26, { width: 90, align: 'right' });
      doc.fillColor(colors.midnight).text(`Tk ${shippingCharge.toLocaleString()}`, 450, yPos + 26, { width: 90, align: 'right' });

      if (order.discount > 0) {
        doc.fillColor(colors.slate).text('Client Discount:', summaryX, yPos + 42, { width: 90, align: 'right' });
        doc.fillColor('#10B981').text(`-Tk ${order.discount.toLocaleString()}`, 450, yPos + 42, { width: 90, align: 'right' });
      }

      // Grand Total Highlight
      doc.roundedRect(summaryX, yPos + 62, 205, 33, 5).fill(colors.royalMaroon);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(11).text('TOTAL VALUATION', summaryX + 15, yPos + 73);
      doc.fontSize(14).text(`Tk ${order.total.toLocaleString()}`, 440, yPos + 71, { width: 100, align: 'right' });

      // 6. CLOSING & SIGNATURE
      const footerY = 730;
      doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor(colors.bespokeGold).lineWidth(1).stroke();

      doc.fontSize(16).fillColor(colors.royalMaroon).font('Helvetica-Bold').text('RongRani', 420, footerY + 25, { width: 130, align: 'center', oblique: true });
      doc.fontSize(8).fillColor(colors.slate).font('Helvetica').text('THE OFFICIAL SEAL OF EXCELLENCE', 420, footerY + 46, { align: 'center', width: 130 });

      doc.fontSize(9).fillColor(colors.midnight).font('Helvetica-Bold').text('EXPERIENCE THE EXTRAORDINARY', 40, footerY + 30);
      doc.fontSize(8).fillColor(colors.slate).font('Helvetica').text('Share your story: @rongrani • info.rongrani@gmail.com', 40, footerY + 44);

      doc.fontSize(7).fillColor(colors.slate).text('© 2026 RongRani - Curated with Passion in Bangladesh. All Rights Reserved.', 0, 790, { align: 'center', width: 595 });

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