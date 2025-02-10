const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const isAuthenticated = require("../config/verify");
const router = express.Router();

// Route for getting user details by ID (GET request)
router.get("/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// Route for updating user details by ID (PUT request)
router.put("/:userId", isAuthenticated,  async (req, res) => {
    const { name, email, password, bio } = req.body;
    
    try {
      if (req.user !== req.params.userId) {
         return res.status(403).json({ message: "You can only update your own profile" });
     }
        // Check if the user exists
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (password) {
         // Hash the new password before saving it
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password, salt);
         user.password = hashedPassword; // Update the password field with the hashed password
     }
        // Update user details
        user.name = name || user.name;
        user.email = email || user.email;
        user.bio = bio || user.bio;
        user.updatedAt = Date.now();

        // Save the updated user
       const updeatedUser =  await user.save();

        res.status(200).json({ message: "User updated successfully", user: updeatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;

