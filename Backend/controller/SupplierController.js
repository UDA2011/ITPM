const mongoose = require("mongoose");
const Supplier = require("../models/Supplier");
const Product = require("../models/product"); 
const nodemailer = require("nodemailer");

exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new supplier
exports.createSupplier = async (req, res) => {
  try {
    const { name, contact, email, address, unit, deliveryTime, cost, historicalPerformance, distance, supplierRating } = req.body;
    const newSupplier = new Supplier({
      name,
      contact,
      email,
      address,
      unit,
      deliveryTime,
      cost,
      historicalPerformance,
      distance,
      supplierRating,
    });
    await newSupplier.save();
    res.status(201).json({ message: "Supplier created successfully", supplier: newSupplier });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a supplier by ID
exports.updateSupplier = async (req, res) => {
  try {
    const { name, contact, email, address, unit, deliveryTime, cost, historicalPerformance, distance, supplierRating } = req.body;
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { name, contact, email, address, unit, deliveryTime, cost, historicalPerformance, distance, supplierRating },
      { new: true }
    );
    if (!updatedSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.status(200).json({ message: "Supplier updated successfully", supplier: updatedSupplier });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a supplier by ID
exports.deleteSupplier = async (req, res) => {
  try {
    const deletedSupplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!deletedSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send a supply request to a supplier
exports.sendRequest = async (req, res) => {
  const { supplierId, productId, quantity, email } = req.body;

  try {
    // Log the received IDs
    console.log("Received supplierId:", supplierId);
    console.log("Received productId:", productId);

    // Validate ObjectId
    if (!mongoose.isValidObjectId(supplierId)) {
      return res.status(400).json({ message: "Invalid supplierId" });
    }
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    // Fetch supplier and product details
    const supplier = await Supplier.findById(supplierId);
    const product = await Product.findById(productId);

    // Log the fetched documents
    console.log("Fetched supplier:", supplier);
    console.log("Fetched product:", product);

    if (!supplier || !product) {
      return res.status(404).json({ message: "Supplier or product not found" });
    }

    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "nadeejawathulanda@gmail.com", // Replace with your email
        pass: "ldze idum btki cvkb", // Replace with your email password
      },
    });

    const mailOptions = {
      from: "nadeejawathulanda@gmail.com", // Replace with your email
      to: email,
      subject: "Supply Request",
      text: `You have a new supply request for ${quantity} units of ${product.name}.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Failed to send email" });
      }
      console.log("Email sent:", info.response);
      res.status(200).json({ message: "Request sent successfully" });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};