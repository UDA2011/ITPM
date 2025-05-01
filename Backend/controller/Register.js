const bcrypt = require("bcrypt");
const User = require("../models/userModel");

// Register User
const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phoneNumber, nic, jobPosition, age, jobStartDate, imageUrl } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !phoneNumber || !nic || !jobPosition || !age || !jobStartDate) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        // Check if user already exists by email or NIC
        const existingUser = await User.findOne({ $or: [{ email }, { nic }] });
        if (existingUser) {
            return res.status(400).json({ 
                message: existingUser.email === email ? "Email already exists" : "NIC already exists" 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

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
            jobStartDate,
            imageUrl: imageUrl || '',
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        if (error.code === 11000) {
            // Handle duplicate key errors (e.g., email or NIC)
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ message: `${field} already exists` });
        }
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
};

// Get All Users
const getUsers = async (req, res) => {
    try {
        // Fetch all users, excluding the password field
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

module.exports = { registerUser, getUsers };