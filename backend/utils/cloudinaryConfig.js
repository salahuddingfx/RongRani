const cloudinary = require('cloudinary').v2;

// Check if Cloudinary is configured
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (!isCloudinaryConfigured) {
  console.log('⚠️  Cloudinary not configured - image uploads will be skipped');
  console.log('   To enable: Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env');
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadToCloudinary = (file, folder = 'chirkut-ghor') => {
  return new Promise((resolve, reject) => {
    // If Cloudinary not configured, return placeholder
    if (!isCloudinaryConfigured) {
      console.log('⚠️  Cloudinary not configured, using placeholder image');
      resolve({
        url: 'https://via.placeholder.com/400x400?text=Image+Upload+Disabled',
        publicId: 'placeholder-' + Date.now(),
        isPlaceholder: true
      });
      return;
    }

    cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'auto',
    }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    });
  });
};

const deleteFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    // Skip if Cloudinary not configured or placeholder
    if (!isCloudinaryConfigured || publicId.startsWith('placeholder-')) {
      resolve({ result: 'skipped' });
      return;
    }

    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  isCloudinaryConfigured,
};