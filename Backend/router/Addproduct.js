const express = require("express");
const router = express.Router();
const AddProductController = require("../controller/Addproduct");

// Add Product
router.post("/add", AddProductController.addProduct);

// Get All Products for a User
router.get("/get/:userID", AddProductController.getAllProducts);

module.exports = router;