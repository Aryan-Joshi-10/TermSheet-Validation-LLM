const userModel = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

// Sign Up Controller
const signUp = async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log the request body
    console.log("Request file:", req.file); // Log the uploaded file

    const { name, email, password, contact, address, age, gender } = req.body;

    const existingUser = await userModel.findOne({ email });
    console.log("Existing user:", existingUser); // Log if the user already exists

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists, you can log in." });
    }

    if (!req.file) {
      console.log("Profile picture is missing"); // Log missing profile picture
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const profilePicture = req.file.path;
    console.log("Profile picture path:", profilePicture); // Log the profile picture path

    const newUser = new userModel({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      contact,
      address,
      age,
      gender,
      profilePicture,
    });

    console.log("New user object:", newUser); // Log the new user object before saving

    await newUser.save();
    console.log("User saved successfully"); // Log successful save

    res.status(201).json({
      message: "User created successfully",
      success: true,
    });
  } catch (err) {
    console.error("Error during sign up:", err); // Log the error
    res.status(500).json({
      message: "Error creating user",
      success: false,
    });
  }
};

module.exports = { signUp };

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const errMessage = "Invalid email or password!";

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(403).json({ message: errMessage, success: false });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(403).json({ message: errMessage, success: false });
    }

    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      "suraj6708",
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      success: true,
      token: jwtToken,
      user: {
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error during login",
      success: false,
    });
  }
};

module.exports = { signUp, login };
