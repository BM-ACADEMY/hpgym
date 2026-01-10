const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // 1. Import bcrypt here

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, email, phoneNumber, password, role } = req.body;

  try {
    // 1. Check if user exists
    const userExists = await User.findOne({ 
        $or: [{ email }, { phoneNumber }] 
    });

    if (userExists) {
      return res.status(400).json({ message: "User with this email or phone already exists" });
    }

    // 2. Hash Password Manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Generate Customer ID Manually (Logic moved from Model)
    let newCustomerId = undefined;
    const userRole = role || "user";

    // Only generate ID if the user is NOT an admin
    if (userRole !== 'admin') {
        const lastUser = await User.findOne(
            { customerId: { $exists: true } }, 
            {}, 
            { sort: { 'createdAt': -1 } }
        );

        if (lastUser && lastUser.customerId) {
            const lastIdParts = lastUser.customerId.split('-');
            const lastIdNumber = parseInt(lastIdParts[1]);
            const nextId = (lastIdNumber + 1).toString().padStart(4, '0');
            newCustomerId = `HPFS-${nextId}`;
        } else {
            newCustomerId = 'HPFS-0001';
        }
    }

    // 4. Create User
    const user = await User.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword, // Save the hashed password
      role: userRole,
      customerId: newCustomerId // Save the generated ID (or undefined for admin)
    });

    if (user) {
      const token = generateToken(user._id);
      
      res.cookie("jwt", token, {
  httpOnly: true,
  // FIX: Set secure to TRUE in production
  secure: process.env.NODE_ENV === "production", 
  sameSite: "none", // correctly set for cross-site
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

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // CHECK IF BLOCKED
    if (user && user.isBlocked) {
        return res.status(403).json({ message: "Your account has been blocked. Contact Admin." });
    }

    // 5. Compare Password Manually (Since we removed matchPassword from model)
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id);

      res.cookie("jwt", token, {
  httpOnly: true,
  // FIX: Set secure to TRUE in production
  secure: process.env.NODE_ENV === "production", 
  sameSite: "none", // correctly set for cross-site
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
      res.status(401).json({ message: "Invalid email or password" });
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