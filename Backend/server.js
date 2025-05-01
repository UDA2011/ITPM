const express = require("express");
const { main } = require("./models/index"); // Import the main function
const supplierRoutes = require("./router/SupplierRoute");
const inventoryRoutes = require("./router/inventoryRoutes");
const cors = require("cors");
const User = require("./models/users");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
main().catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/suppliers", supplierRoutes);
app.use("/api/inventory", inventoryRoutes);

// ------------- User Routes --------------
const userRouter = express.Router();

// CREATE - User Registration
// CREATE - User Registration
userRouter.post("/register", async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phoneNumber, 
      nic, 
      jobPosition, 
      age,  // Using age instead of dateOfbirth
      jobStartDate, 
      imageUrl 
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
      age,  // Using age instead of dateOfbirth
      jobStartDate: new Date(jobStartDate), // Convert string to Date object
      imageUrl: imageUrl || '', // Use default if not provided
    });

    const savedUser = await newUser.save();
    // Remove password from the response
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (err) {
    console.error("Signup Error: ", err);
    // More specific error handling
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// READ - Get all users
userRouter.get("/", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude passwords from response
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// READ - Get single user by ID
userRouter.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { password: 0 }); // Exclude password
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// UPDATE - Update user by ID
userRouter.put("/:id", async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    // If password is being updated, hash it first
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, select: { password: 0 } } // Return updated user and exclude password
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE - Delete user by ID
userRouter.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login route
userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    // Compare password with the hashed password stored in the DB
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    // Return user data without password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Mount the user router
app.use("/api/users", userRouter);

// Test Route (Note: Product model needs to be imported if used)
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