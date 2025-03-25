const mongoose = require("mongoose");

const AddproductSchema = new mongoose.Schema(
  {
    
    productname: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    
  },
  { timestamps: true }
);

const Addproduct = mongoose.model("Addproduct", AddproductSchema);
module.exports = Addproduct;