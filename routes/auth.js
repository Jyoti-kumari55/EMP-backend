const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const router = express.Router();
const isAuthenticated = require("../config/verify");

// Register new user
router.post("/register", async (req, res) => {
  const { name, email, password, bio } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      bio,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    // const token = jwt.sign({ userId: newUser._id }, process.env.TOKEN_SECRET, {
    //   expiresIn: "1h",
    // });
    res
      // .cookie("token", token, { httpOnly: true })
      .status(200)
      .json({ message: "User registered successfully", user: savedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, email: user.email }, process.env.TOKEN_SECRET, {
      expiresIn: "1h",
    });
    res
      .cookie("token", token, { 
        expiresIn: "1h",
        httpOnly: true,
        secure: false 
      });
      return res
      .status(200)
      .json({ message: `Welcome back ${user.name}!`, details: user, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to find this user.", message: error.message});
  }
});

// Guest Login (limited access)
router.post("/guest-login", async (req, res) => {
  const token = jwt.sign({ userId: "guest" }, process.env.TOKEN_SECRET, {
    expiresIn: "1h",
  });
  res
    .cookie("token", token, { httpOnly: true })
    .status(200)
    .json({ message: "Guest login successful", token });
});

// Logout (clear token)
router.get("/logout",  (req, res) => {
  try {
    res
    .clearCookie("token")
    .status(200)
    .json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occured while loging out." });

  }
 
});

module.exports = router;
