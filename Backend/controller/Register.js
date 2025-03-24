const bcrypt = require("bcrypt");
const User = require("../models/userModel");

// Register User
const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phoneNumber, nic, jobPosition, age, jobStartDate, imageUrl } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
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
            imageUrl
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
};

module.exports = { registerUser };
