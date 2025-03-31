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
    enum: ['low stock', 'out of stock', 'in stock'],
    default: 'in stock'
  }
}, {
  timestamps: true
});

// Pre-save hook to calculate value and set status
inventorySchema.pre('save', function(next) {
  // Calculate value if not set
  if (this.isModified('price') || this.isModified('quantity')) {
    this.value = this.price * this.quantity;
  }

  // Set currentQty to match quantity for new items
  if (this.isNew) {
    this.currentQty = this.quantity;
  }

  // Auto-update status based on quantity
  if (this.currentQty <= 0) {
    this.status = 'out of stock';
  } else if (this.currentQty < 10) { // Assuming 10 is the threshold for low stock
    this.status = 'low stock';
  } else {
    this.status = 'in stock';
  }

  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;