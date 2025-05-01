const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: Number,
        required: true,
    },
    nic: {
        type: String,
        required: true,
        unique: true,
    },
    jobPosition: {
        type: String,
        required: true,
    },
    age: {
        type: String,
        required: true,
    },
    jobStartDate: {
        type: Date,
        required: true,
    },
    imageUrl: {
        type: String,
        default: '',
    },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;