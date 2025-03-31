const express = require('express');
const router = express.Router();
const endProductController = require('../controller/endProductController');

// Create a new end product
router.post('/', endProductController.createEndProduct);

// Get all end products
router.get('/', endProductController.getAllEndProducts);

// Get a single end product by ID
router.get('/:id', endProductController.getEndProductById);

// Update an end product
router.put('/:id', endProductController.updateEndProduct);

// Delete an end product
router.delete('/:id', endProductController.deleteEndProduct);

// Get end products by category
router.get('/category/:category', endProductController.getEndProductsByCategory);

module.exports = router;