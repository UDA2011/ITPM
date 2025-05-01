const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Excipients', 'Active Pharmaceutical Ingredients', 'Solvents & Diluents', 'Additives & Enhancers']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  currentQty: {
    type: Number,
    required: true,
    min: 0
  },
  requestQty: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['low_stock', 'out_of_stock', 'in_stock'],
    default: 'in_stock'
  }
}, {
  timestamps: true
});

// Improved pre-save hook
inventorySchema.pre('save', function(next) {
  // Calculate value if price or quantity changes
  if (this.isModified('price') || this.isModified('quantity')) {
    this.value = this.price * this.quantity;
  }

  // For new items
  if (this.isNew) {
    this.currentQty = this.quantity;
    // Only set default status if not explicitly provided
    if (!this.isModified('status')) {
      this.status = 'in_stock';
    }
  } 
  // For existing items
  else {
    // Auto-update status ONLY when currentQty changes
    if (this.isModified('currentQty')) {
      if (this.currentQty <= 0) {
        this.status = 'out_of_stock';
      } else if (this.currentQty < 10) {
        this.status = 'low_stock';
      } else {
        this.status = 'in_stock';
      }
    }
    // If status was manually modified, preserve it
    // No need for else-if, Mongoose will keep the modified value
  }

  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;