// userModel.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: 
    { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationExpires: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
