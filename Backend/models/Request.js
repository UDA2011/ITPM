const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required']
  },
  currentQty: {
    type: Number,
    required: [true, 'Current quantity is required'],
    min: [0, 'Current quantity cannot be negative']
  },
  requestQty: {
    type: Number,
    required: [true, 'Request quantity is required'],
    min: [0, 'Request quantity must be at least 0']
  },
  status: {
    type: String,
    enum: {
      values: ['low stock	', 'out of_stock'],
      message: '{VALUE} is not a valid status'
    },
    default: 'low stock'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

// Middleware to update timestamp before saving
requestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Request = mongoose.models.Request || mongoose.model('Request', requestSchema);
module.exports = Request;
