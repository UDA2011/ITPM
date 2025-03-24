const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  deliveryTime: {
    type: Number, // Assuming delivery time is in days
    default: 0,
  },
  unit: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    default: 0,
  },
  historicalPerformance: {
    type: Number,
    default: 0,
  },
  distance: {
    type: Number, // Assuming distance is in kilometers
    default: 0,
  },
  supplierRating: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Supplier", supplierSchema);