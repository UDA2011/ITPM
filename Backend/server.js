const express = require("express");
const { main } = require("./models/index");
const productRoute = require("./router/product");
const addProductRoute = require("./router/Addproduct");
const purchaseRoute = require("./router/purchase");
const salesRoute = require("./router/sales");
const cors = require("cors");
const User = require("./models/users");
const Product = require("./models/Product");

const app = express();
const PORT = 4000;

main();
app.use(express.json());
app.use(cors());

// Store API
app.use("/api/addproduct", addProductRoute);

// Products API
app.use("/api/product", productRoute);

// Purchase API
app.use("/api/purchase", purchaseRoute);

// Sales API
app.use("/api/sales", salesRoute);

// ------------- Login --------------
let userAuthCheck;

app.post("/api/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email, password: req.body.password });
    if (user) {
      res.status(200).json(user);
      userAuthCheck = user;
    } else {
      res.status(401).json({ error: "Invalid Credentials" });
      userAuthCheck = null;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get Logged-in User Details
app.get("/api/login", (req, res) => {
  if (userAuthCheck) {
    res.status(200).json(userAuthCheck);
  } else {
    res.status(401).json({ error: "No user is logged in" });
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