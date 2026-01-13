const User = require("../models/User");
const SubscriptionHistory = require("../models/SubscriptionHistory"); // Import History Model
const bcrypt = require("bcryptjs");

// --- Helper: Check and Update Expiry (The "Auto-Off" Logic) ---
const checkSubscriptionStatus = async (user) => {
    // If user has no plan or is already inactive, do nothing
    if (!user.subscription || !user.subscription.endDate || user.subscription.planStatus === 'inactive') {
        return user;
    }

    const now = new Date();
    const end = new Date(user.subscription.endDate);
    
    // Check if plan has expired
    if (now > end && user.subscription.planStatus !== 'expired') {
        user.subscription.planStatus = 'expired';
        await user.save();
    } 
    // Check if plan is expiring soon (within 7 days) but not yet expired
    else if (now <= end && user.subscription.planStatus !== 'expired') {
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 7 && user.subscription.planStatus !== 'expiring_soon') {
            user.subscription.planStatus = 'expiring_soon';
            await user.save();
        } else if (diffDays > 7 && user.subscription.planStatus !== 'active') {
             user.subscription.planStatus = 'active';
             await user.save();
        }
    }
    return user;
};

// --- Update Subscription (Add Plan + History) ---
const updateSubscription = async (req, res) => {
    try {
        const { startDate, endDate, amount, isActive } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        if (!isActive) {
            // Admin manually turning off subscription
            user.subscription = { 
                planStatus: 'inactive', 
                startDate: null, 
                endDate: null, 
                amount: 0 
            };
        } else {
            // 1. Create a History Record
            await SubscriptionHistory.create({
                user: user._id,
                amount: amount || 0,
                startDate,
                endDate,
                planStatus: 'active'
            });

            // 2. Update User's Current Subscription
            // Note: We force status to 'active' initially. 
            // The checkSubscriptionStatus will handle expiring_soon later.
            user.subscription = {
                startDate,
                endDate,
                amount: amount || 0,
                planStatus: 'active' 
            };
        }

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Helper: Generate Customer ID ---
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

// @desc    Get all users (Auto-updates expiry status on fetch)
// @route   GET /api/users
const getAllUsers = async (req, res) => {
  try {
    let users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
    
    // Run the expiry check on all users before sending response
    // This ensures the Admin always sees the correct "Expired" status
    const updatedUsers = await Promise.all(users.map(async (user) => {
        return await checkSubscriptionStatus(user);
    }));

    res.json(updatedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Single User (Auto-updates expiry status on fetch)
// @route   GET /api/users/:id
const getUserById = async (req, res) => {
    try {
        let user = await User.findById(req.params.id).select('-password');
        if (user) {
            // Check expiry before returning
            user = await checkSubscriptionStatus(user);
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create User (Admin Action)
// @route   POST /api/users
const createUser = async (req, res) => {
  const { name, phoneNumber, password, role } = req.body;

  try {
    const userExists = await User.findOne({ phoneNumber });
    if (userExists) {
      return res.status(400).json({ message: "User with this phone number already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newCustomerId = await generateCustomerId();
    const userRole = role || "user";

    const user = await User.create({
      name,
      phoneNumber,
      password: hashedPassword,
      role: userRole,
      customerId: newCustomerId,
      isBlocked: false
    });

    if (user) {
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

// @desc    Update User
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
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

// @desc    Change Password
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
      // Optional: Delete history when user is deleted?
      // await SubscriptionHistory.deleteMany({ user: user._id }); 
      await user.deleteOne();
      res.json({ message: "User removed" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// New Endpoint: Get History for a specific user
const getUserHistory = async (req, res) => {
    try {
        const history = await SubscriptionHistory.find({ user: req.params.id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { 
    getAllUsers, 
    updateUser, 
    toggleBlockUser, 
    deleteUser, 
    changeUserPassword, 
    createUser, 
    updateSubscription, 
    getUserById,
    getUserHistory 
};