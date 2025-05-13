const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcrypt");

const { main } = require("./models/index");
const supplierRoutes = require("./router/SupplierRoute");
const inventoryRoutes = require("./router/inventoryRoutes");
const endProductRoutes = require("./router/endProductRoutes");
const requestRoutes = require("./router/requestRoutes");
const tasksRoute = require("./router/tasksRoute");

const User = require("./models/users");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
main()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.json());


app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));


// ---------------------- Routes ----------------------
app.use("/api/suppliers", supplierRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/endproducts", endProductRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/task", tasksRoute);


// ------------- User Routes --------------
// CREATE - User Registration
app.post("/api/users/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      nic,
      jobPosition,
      age,
      jobStartDate,
      imageUrl,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { nic }] });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email or NIC already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      nic,
      jobPosition,
      age,
      jobStartDate: new Date(jobStartDate),
      imageUrl: imageUrl || "",
    });

    const savedUser = await newUser.save();
    // Remove password from the response
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (err) {
    console.error("Signup Error: ", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// READ - Get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.status(200).json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// READ - Get single user by ID
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { password: 0 });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// UPDATE - Update user by ID
app.put("/api/users/:id", async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    // If password is being updated, hash it first
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      select: { password: 0 },
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// DELETE - Delete user by ID
app.delete("/api/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Login route (Updated with detailed logging)
app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt with email:", email);

    // Validate input
    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    console.log("Searching for user in database...");
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    // Compare password with the hashed password stored in the DB
    console.log("Comparing passwords for email:", email);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Password mismatch for email:", email);
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    // Return user data without password
    console.log("Login successful for email:", email);
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Login error:", error.message, error.stack);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Test Route (Note: Product model needs to be imported if used)
app.get("/testget", async (req, res) => {
  try {
    const result = await Product.findOne({ _id: "6429979b2e5434138eda1564" });
    res.status(200).json(result);
  } catch (err) {
    console.error("Test route error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(Server is running on port ${PORT});
});