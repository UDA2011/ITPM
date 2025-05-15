const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true // Added index for faster searches
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    default: "kg"
  },
  specifications: {
    type: Map,
    of: String
  }
}, { _id: false });

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  contact: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  deliveryTime: {
    type: Number,
    required: true,
    min: 1
  },
  historicalPerformance: {
    type: Number,
    default: 80,
    min: 0,
    max: 100
  },
  distance: {
    type: Number,
    required: true,
    min: 1
  },
  supplierRating: {
    type: Number,
    default: 3,
    min: 0,
    max: 5
  },
  materials: [materialSchema],
  certifications: [String],
  lastOrderDate: Date,
  responseTime: Number // in hours
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
supplierSchema.index({ name: 'text' });
supplierSchema.index({ 'materials.name': 1 });
supplierSchema.index({ supplierRating: -1 });

module.exports = mongoose.model("Supplier", supplierSchema);