const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// All users
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// All accounts
router.get("/accounts", protect, adminOnly, async (req, res) => {
  try {
    const accounts = await Account.find().populate("user", "name email");
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Stats
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAccounts = await Account.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalBalanceResult = await Account.aggregate([
      { $group: { _id: null, total: { $sum: "$balance" } } },
    ]);
    const totalBalance = totalBalanceResult.length > 0 ? totalBalanceResult[0].total : 0;
    res.json({ totalUsers, totalAccounts, totalTransactions, totalBalance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;