const express = require("express");
const router = express.Router();
const SupplierController = require("../controller/SupplierController");

// Get all suppliers
router.get("/suppliers", SupplierController.getAllSuppliers);

// Create a new supplier
router.post("/suppliers", SupplierController.createSupplier);

// Update a supplier by ID
router.put("/suppliers/:id", SupplierController.updateSupplier);

// Delete a supplier by ID
router.delete("/suppliers/:id", SupplierController.deleteSupplier);

// Send a supply request to a supplier
router.post("/send-request", SupplierController.sendRequest);

module.exports = router;