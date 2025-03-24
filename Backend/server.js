const express = require("express");
const { main } = require("./models/index"); // Import the main function
const productRoute = require("./router/product");
const addProductRoute = require("./router/Addproduct");
const purchaseRoute = require("./router/purchase");
const supplierRoutes = require("./router/SupplierRoute");
const cors = require("cors");
const User = require("./models/users");
const Product = require("./models/Product");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 4000;

// Connect to MongoDB
main().catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/addproduct", addProductRoute);
app.use("/api/product", productRoute);
app.use("/api/purchase", purchaseRoute);
app.use("/api/suppliers", supplierRoutes);

// ------------- Login --------------
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and password
    const user = await User.findOne({ email, password });

    if (user) {
      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, "your-secret-key", {
        expiresIn: "1h",
      });

      // Return token and user data
      res.status(200).json({ token, user });
    } else {
      res.status(401).json({ error: "Invalid Credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ------------- Registration --------------
app.post("/api/register", async (req, res) => {
  try {
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      phoneNumber: req.body.phoneNumber,
      nic: req.body.nic,
      jobPosition: req.body.jobPosition,
      age: req.body.age,
      jobStartDate: req.body.jobStartDate,
      imageUrl: req.body.imageUrl,
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    console.error("Signup Error: ", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Test Route
app.get("/testget", async (req, res) => {
  try {
    const result = await Product.findOne({ _id: "6429979b2e5434138eda1564" });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});