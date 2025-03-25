const express = require("express");
const router = express.Router();
const inventoryController = require("../controller/inventoryController");

// Get all items
router.get("/", inventoryController.getAllItems);

// Get items by category
router.get("/category/:category", inventoryController.getItemsByCategory);

// Get a single item
router.get("/:id", inventoryController.getItem);

// Create a new item
router.post("/", inventoryController.createItem);

// Update an item
router.put("/:id", inventoryController.updateItem);

// Delete an item
router.delete("/:id", inventoryController.deleteItem);

module.exports = router;