const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  name: String,
  category: String,
  quantity: Number,
  price: Number,
  value: Number,
  dateAdded: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Inventory", inventorySchema);
