const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, phoneNumber, password, role } = req.body;

  try {
    const userExists = await User.findOne({ phoneNumber });

    if (userExists) {
      return res.status(400).json({ message: "User with this phone number already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate Customer ID
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
      name, 
      phoneNumber,
      password: hashedPassword,
      role: userRole,
      customerId: newCustomerId
    });

    if (user) {
      const token = generateToken(user._id);
      
      // Removed Email Sending Logic

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

// @desc    Login user (Phone Only)
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  const { identifier, password } = req.body; // identifier is the phoneNumber

  try {
    const user = await User.findOne({ phoneNumber: identifier });

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

module.exports = { registerUser, loginUser, logoutUser };