const AddProduct = require("../models/Addproduct");

// Add Product
const addProduct = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log the incoming request body

    // Validate required fields
    if (!req.body.productname || !req.body.category || !req.body.description || !req.body.price) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newProduct = new AddProduct({
      productname: req.body.productname,
      category: req.body.category,
      description: req.body.description,
      price: req.body.price,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct); // Use 201 for resource creation
  } catch (err) {
    console.error("Error in addProduct:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get All Products
const getAllProducts = async (req, res) => {
  try {
    const products = await AddProduct.find().sort({ _id: -1 }); // Fetch all products
    res.status(200).json(products);
  } catch (err) {
    console.error("Error in getAllProducts:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { addProduct, getAllProducts };