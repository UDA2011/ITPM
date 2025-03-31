const express = require("express");
const { main } = require("./models/index");
const cors = require('cors');


// Import routes
const supplierRoutes = require("./router/SupplierRoute");
const inventoryRoutes = require("./router/inventoryRoutes");
const endProductRoutes = require('./router/endProductRoutes');
const requestRoutes = require('./router/requestRoutes');
const User = require("./models/users");

const app = express();
const PORT = 4000;

// Connect to MongoDB
main().catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.json()); // For parsing JSON request bodies
app.use(cors()); 

// Routes
app.use("/api/suppliers", supplierRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use('/api/endproducts', endProductRoutes);
app.use('/api/requests', requestRoutes);

// Simplified login (without JWT)
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    
    if (user) {
      res.status(200).json({
        user: {
          _id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.jobPosition
        }
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Simplified registration
app.post("/api/register", async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});