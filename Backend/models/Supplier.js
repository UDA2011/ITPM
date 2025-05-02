// models/Supplier.js
const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  availableQuantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: "kg"
  }
});

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    default: "kg"
  },
  deliveryTime: {
    type: Number, // in days
    required: true
  },
  historicalPerformance: {
    type: Number,
    min: 0,
    max: 100,
    default: 80
  },
  distance: {
    type: Number, // in km
    required: true
  },
  supplierRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 3
  },
  materials: [materialSchema]
}, { timestamps: true });

module.exports = mongoose.model("Supplier", supplierSchema);