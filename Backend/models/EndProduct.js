const mongoose = require("mongoose");

const endProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  quantity: Number,
  price: Number,
  value: Number,
  dateAdded: { type: Date, default: Date.now },
});

module.exports = mongoose.model("EndProduct", endProductSchema);
