const mongoose = require("mongoose");
const Supplier = require("../models/Supplier");
const nodemailer = require("nodemailer");

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new supplier (now includes materials)
exports.createSupplier = async (req, res) => {
  try {
    const { 
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
      materials // Add materials field
    } = req.body;

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
      materials: materials || [] // Default to empty array if not provided
    });

    await newSupplier.save();
    res.status(201).json({ 
      message: "Supplier created successfully", 
      supplier: newSupplier 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a supplier by ID (now includes materials)
exports.updateSupplier = async (req, res) => {
  try {
    const { 
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
      materials // Add materials field
    } = req.body;

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { 
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
        materials: materials || [] // Default to empty array if not provided
      },
      { new: true }
    );

    if (!updatedSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.status(200).json({ 
      message: "Supplier updated successfully", 
      supplier: updatedSupplier 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a supplier by ID (unchanged)
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

// Send a supply request to a supplier (unchanged)
// Send a supply request to a supplier
exports.sendRequest = async (req, res) => {
  const { supplierId, supplierEmail, supplierName, material, quantity, requestDate } = req.body;

  try {
    // Validate ObjectId
    if (!mongoose.isValidObjectId(supplierId)) {
      return res.status(400).json({ message: "Invalid supplierId" });
    }

    // Fetch supplier details
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Format the request date
    const formattedDate = new Date(requestDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

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
      to: supplierEmail,
      subject: `Supply Request for ${material}`,
      text: `Dear ${supplierName},\n\nWe would like to request the following supplies:\n\n` +
            `Material: ${material}\n` +
            `Quantity: ${quantity} kg\n` +
            `Request Date: ${formattedDate}\n\n` +
            `Please confirm the availability and delivery timeline.\n\n` +
            `Best regards,\nYour Company Name`,
      html: `
        <div>
          <p>Dear ${supplierName},</p>
          <p>We would like to request the following supplies:</p>
          <ul>
            <li><strong>Material:</strong> ${material}</li>
            <li><strong>Quantity:</strong> ${quantity} kg</li>
            <li><strong>Request Date:</strong> ${formattedDate}</li>
          </ul>
          <p>Please confirm the availability and delivery timeline.</p>
          <p>Best regards,<br>Your Company Name</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Failed to send email" });
      }
      console.log("Email sent:", info.response);
      res.status(200).json({ 
        message: "Request sent successfully",
        details: {
          supplier: supplierName,
          material,
          quantity,
          requestDate: formattedDate
        }
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};