const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

const resolveAbsoluteUrl = (baseUrl, value) => {
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${baseUrl}${value.startsWith('/') ? value : `/${value}`}`;
};

router.get('/product/:id', async (req, res) => {
  try {
    const identifier = req.params.id;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);

    const product = isObjectId
      ? await Product.findById(identifier).lean()
      : await Product.findOne({ slug: identifier.toLowerCase() }).lean();

    if (!product) {
      return res.status(404).send('Product not found');
    }

    const env = require('../config/env');
    const frontendBase = (env.FRONTEND_URL || 'https://rongrani.vercel.app').replace(/\/+$/, '');
    
    // Improved serverBase detection
    let serverBase = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    // Force https if not on localhost
    if (!serverBase.includes('localhost') && !serverBase.startsWith('https://')) {
      serverBase = serverBase.replace('http://', 'https://');
    }
    serverBase = serverBase.replace(/\/+$/, '');

    const productPath = `/product/${product.slug || product._id}`;
    const canonicalUrl = `${frontendBase}${productPath}`;

    const getImageUrl = (img) => {
      if (!img) return '/RongRani-Circle.png';
      const imgPath = (img.url || img);
      if (typeof imgPath === 'string' && (imgPath.startsWith('http') || imgPath.startsWith('data:'))) return imgPath;
      // If it's a mongo ID or relative path, ensure it points to the API
      const id = img?._id || img;
      return `/api/images/${id}`;
    };

    const primaryImageRaw =
      (Array.isArray(product.images) && product.images[0]) ||
      product.image ||
      null;

    const imageUrl = resolveAbsoluteUrl(serverBase, getImageUrl(primaryImageRaw));
    const description = (product.seoDescription || product.description || 'Explore handcrafted gifts from RongRani.')
      .toString()
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 250);

    const siteTitle = `${product.name} | RongRani™`;

    return res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${siteTitle}</title>
  <meta name="description" content="${description}" />
  <meta name="theme-color" content="#C9A86A" />
  <meta name="apple-mobile-web-app-title" content="RongRani" />

  <!-- Open Graph / Facebook -->
  <meta property="og:site_name" content="RongRani" />
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${siteTitle}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:alt" content="${product.name} - RongRani Handmade Gifts" />
  
  <!-- Product Specific -->
  <meta property="product:price:amount" content="${product.price || 0}" />
  <meta property="product:price:currency" content="BDT" />
  <meta property="product:brand" content="RongRani" />
  <meta property="product:condition" content="new" />
  <meta property="product:availability" content="${product.stock > 0 ? 'in stock' : 'out of stock'}" />
  <meta property="product:retailer_item_id" content="${product._id}" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@RongRani" />
  <meta name="twitter:title" content="${siteTitle}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta name="twitter:image:alt" content="${product.name}" />

  <meta name="apple-mobile-web-app-title" content="RongRani" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />

  <meta http-equiv="refresh" content="0; url=${canonicalUrl}" />
  <link rel="canonical" href="${canonicalUrl}" />
</head>
<body>
  <p>Redirecting to <a href="${canonicalUrl}">${product.name}</a>...</p>
  <script>window.location.replace(${JSON.stringify(canonicalUrl)});</script>
</body>
</html>`);
  } catch (error) {
    return res.status(500).send(error.message || 'Server error');
  }
});

module.exports = router;
