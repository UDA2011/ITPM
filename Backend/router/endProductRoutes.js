const express = require("express");
const router = express.Router();
const EndProduct = require("../models/EndProduct");

// CREATE - Add an end product
router.post("/add", async (req, res) => {
  try {
    const newProduct = new EndProduct(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ - Get all end products
router.get("/get", async (req, res) => {
  try {
    const products = await EndProduct.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - Update an end product
router.put("/update/:id", async (req, res) => {
  try {
    const updatedProduct = await EndProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE - Remove an end product
router.delete("/delete/:id", async (req, res) => {
  try {
    await EndProduct.findByIdAndDelete(req.params.id);
    res.json({ message: "End product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
