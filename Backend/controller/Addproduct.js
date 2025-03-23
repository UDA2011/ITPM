const AddProduct = require("../models/Addproduct");

// Add Product
const addProduct = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log the incoming request body

    // Validate required fields
    if (!req.body.userID || !req.body.productname || !req.body.category || !req.body.description || !req.body.price || !req.body.image) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newProduct = new AddProduct({
      userID: req.body.userID,
      productname: req.body.productname,
      category: req.body.category,
      description: req.body.description,
      price: req.body.price,
      image: req.body.image,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct); // Use 201 for resource creation
  } catch (err) {
    console.error("Error in addProduct:", err); // Log the error
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get All Products by User ID
const getAllProducts = async (req, res) => {
  try {
    const products = await AddProduct.find({ userID: req.params.userID }).sort({ _id: -1 });
    res.status(200).json(products);
  } catch (err) {
    console.error("Error in getAllProducts:", err); // Log the error
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { addProduct, getAllProducts };