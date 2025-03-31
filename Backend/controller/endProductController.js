const EndProduct = require('../models/endProduct');

// Create a new end product
exports.createEndProduct = async (req, res) => {
  try {
    // Calculate value based on quantity and price
    const value = req.body.quantity * req.body.price;
    
    const endProduct = new EndProduct({
      ...req.body,
      value: value
    });
    
    const savedProduct = await endProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all end products
exports.getAllEndProducts = async (req, res) => {
  try {
    const endProducts = await EndProduct.find().sort({ dateAdded: -1 });
    res.json(endProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single end product by ID
exports.getEndProductById = async (req, res) => {
  try {
    const endProduct = await EndProduct.findById(req.params.id);
    if (!endProduct) {
      return res.status(404).json({ message: 'End product not found' });
    }
    res.json(endProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an end product
exports.updateEndProduct = async (req, res) => {
  try {
    // Recalculate value if quantity or price is being updated
    if (req.body.quantity || req.body.price) {
      const existingProduct = await EndProduct.findById(req.params.id);
      const quantity = req.body.quantity || existingProduct.quantity;
      const price = req.body.price || existingProduct.price;
      req.body.value = quantity * price;
    }
    
    const updatedProduct = await EndProduct.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'End product not found' });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an end product
exports.deleteEndProduct = async (req, res) => {
  try {
    const deletedProduct = await EndProduct.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'End product not found' });
    }
    res.json({ message: 'End product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get end products by category
exports.getEndProductsByCategory = async (req, res) => {
  try {
    const endProducts = await EndProduct.find({ 
      category: req.params.category 
    }).sort({ dateAdded: -1 });
    
    res.json(endProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};