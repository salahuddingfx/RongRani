const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  image: {
    url: {
      type: String,
      required: true,
    },
    publicId: String,
    alt: String,
  },
  link: {
    type: String,
    trim: true,
  },
  position: {
    type: String,
    enum: ['hero', 'sidebar', 'footer', 'product'],
    default: 'hero',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
  },
  clickCount: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt on save
bannerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index
bannerSchema.index({ position: 1, isActive: 1, priority: -1 });

module.exports = mongoose.model('Banner', bannerSchema);