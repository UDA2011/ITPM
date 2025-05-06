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
main().catch((err) => console.error("MongoDB connection error:", err));

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

// ------------------- User Routes --------------------
const userRouter = express.Router();

// Register
userRouter.post("/register", async (req, res) => {
  try {
    const { 
      firstName, lastName, email, password, phoneNumber, 
      nic, jobPosition, age, jobStartDate, imageUrl 
    } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { nic }] });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email or NIC already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
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
      imageUrl: imageUrl || '',
    });

    const savedUser = await newUser.save();
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (err) {
    console.error("Signup Error: ", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

// Get All Users
userRouter.get("/", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get User by ID
userRouter.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { password: 0 });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update User
userRouter.put("/:id", async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, select: { password: 0 } }
    );

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete User
userRouter.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login
userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid Credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid Credentials" });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Mount user routes
app.use("/api/users", userRouter);

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
