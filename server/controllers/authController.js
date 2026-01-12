const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); // Built-in Node module for OTP generation
const sendEmail = require("../utils/sendEmail");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, email, phoneNumber, password, role } = req.body;

  try {
    const userExists = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (userExists) {
      return res.status(400).json({ message: "User with this email or phone already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate Customer ID (Your existing logic)
    let newCustomerId = undefined;
    const userRole = role || "user";
    if (userRole !== 'admin') {
        const lastUser = await User.findOne({ customerId: { $exists: true } }, {}, { sort: { 'createdAt': -1 } });
        if (lastUser && lastUser.customerId) {
            const lastIdParts = lastUser.customerId.split('-');
            const lastIdNumber = parseInt(lastIdParts[1]);
            const nextId = (lastIdNumber + 1).toString().padStart(4, '0');
            newCustomerId = `HPFS-${nextId}`;
        } else {
            newCustomerId = 'HPFS-0001';
        }
    }

    const user = await User.create({
      name, email, phoneNumber,
      password: hashedPassword,
      role: userRole,
      customerId: newCustomerId
    });

    if (user) {
      const token = generateToken(user._id);
      
      // --- SEND WELCOME EMAIL ---
      const message = `
        <h1>Welcome to the Club, ${user.name}!</h1>
        <p>Your account has been successfully created.</p>
        <p>Customer ID: <strong>${user.customerId || 'N/A'}</strong></p>
      `;
      try {
          await sendEmail({
              email: user.email,
              subject: "Welcome to HPFS Club!",
              message,
          });
      } catch (emailError) {
          console.error("Welcome email failed:", emailError);
          // Don't fail registration if email fails, just log it
      }

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        _id: user._id,
        customerId: user.customerId,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user (Email OR Phone)
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  const { identifier, password } = req.body; // 'identifier' can be email or phone

  try {
    // Check if identifier is email or phone
    const user = await User.findOne({
        $or: [{ email: identifier }, { phoneNumber: identifier }]
    });

    if (user && user.isBlocked) {
        return res.status(403).json({ message: "Your account has been blocked. Contact Admin." });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id);

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        _id: user._id,
        customerId: user.customerId,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logoutUser = (req, res) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP before saving to DB (Security best practice)
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);

        user.resetPasswordOtp = hashedOtp;
        user.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes validity
        await user.save();

        const message = `
            <h1>Password Reset Request</h1>
            <p>Your OTP for password reset is:</p>
            <h2 style="color: red;">${otp}</h2>
            <p>This OTP is valid for 10 minutes.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: "Password Reset OTP",
                message,
            });
            res.status(200).json({ message: "OTP sent to email" });
        } catch (error) {
            user.resetPasswordOtp = undefined;
            user.resetPasswordOtpExpire = undefined;
            await user.save();
            return res.status(500).json({ message: "Email could not be sent" });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password via OTP
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        const user = await User.findOne({ 
            email, 
            resetPasswordOtpExpire: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid Email or OTP has expired" });
        }

        // Verify OTP
        const isMatch = await bcrypt.compare(otp, user.resetPasswordOtp);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        // Clear OTP fields
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpire = undefined;
        
        await user.save();

        res.status(200).json({ message: "Password reset successful" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, logoutUser, forgotPassword, resetPassword };