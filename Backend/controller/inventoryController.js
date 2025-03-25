const Inventory = require("../models/Inventory")

// Get all inventory items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ dateAdded: -1 });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single inventory item
exports.getItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new inventory item
exports.createItem = async (req, res) => {
  try {
    // Calculate value based on quantity and price
    const value = req.body.quantity * req.body.price;
    
    const item = new Inventory({
      ...req.body,
      value: value
    });

    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update an inventory item
exports.updateItem = async (req, res) => {
  try {
    // Recalculate value if quantity or price is being updated
    if (req.body.quantity || req.body.price) {
      const existingItem = await Inventory.findById(req.params.id);
      const quantity = req.body.quantity || existingItem.quantity;
      const price = req.body.price || existingItem.price;
      req.body.value = quantity * price;
    }

    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete an inventory item
exports.deleteItem = async (req, res) => {
  try {
    const deletedItem = await Inventory.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get items by category
exports.getItemsByCategory = async (req, res) => {
  try {
    const items = await Inventory.find({ category: req.params.category });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};