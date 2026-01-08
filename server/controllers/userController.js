const User = require("../models/User");
const bcrypt = require("bcryptjs");

// --- Helper Function: Generate Customer ID ---
const generateCustomerId = async () => {
  const lastUser = await User.findOne(
    { customerId: { $exists: true } }, 
    {}, 
    { sort: { 'createdAt': -1 } }
  );

  if (lastUser && lastUser.customerId) {
    const lastIdParts = lastUser.customerId.split('-');
    const lastIdNumber = parseInt(lastIdParts[1]);
    const nextId = (lastIdNumber + 1).toString().padStart(4, '0');
    return `HPFS-${nextId}`;
  }
  return 'HPFS-0001';
};

// @desc    Get all users (Separated by active/blocked if needed via query)
// @route   GET /api/users
const getAllUsers = async (req, res) => {
  try {
    // Exclude admins from the list
    const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create User (Admin Action)
// @route   POST /api/users
const createUser = async (req, res) => {
  const { name, email, phoneNumber, password, role } = req.body;

  try {
    // 1. Check if user exists
    const userExists = await User.findOne({ 
        $or: [{ email }, { phoneNumber }] 
    });

    if (userExists) {
      return res.status(400).json({ message: "User with this email or phone already exists" });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Generate Customer ID
    const newCustomerId = await generateCustomerId();
    const userRole = role || "user"; 

    // 4. Create User
    const user = await User.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      role: userRole,
      customerId: newCustomerId,
      isBlocked: false
    });

    if (user) {
      // Note: We do NOT generate a token here because the Admin is creating the user, not logging in as them.
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

// @desc    Update User
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
      
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Block Status
// @route   PUT /api/users/:id/block
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.isBlocked = !user.isBlocked;
      await user.save();
      res.json({ message: `User ${user.isBlocked ? 'Blocked' : 'Unblocked'}`, isBlocked: user.isBlocked });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change Password (Admin override)
// @route   PUT /api/users/:id/password
const changeUserPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.params.id);
        if(user) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            res.json({ message: "Password updated successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Delete User
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: "User removed" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllUsers, updateUser, toggleBlockUser, deleteUser, changeUserPassword, createUser };