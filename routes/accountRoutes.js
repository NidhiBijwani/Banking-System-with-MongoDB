const express = require("express");
const router = express.Router();
const Account = require("../models/Account");
const { protect } = require("../middleware/authMiddleware");

// Create account
router.post("/create", protect, async (req, res) => {
  const { accountType } = req.body;
  try {
    const account = await Account.create({
      user: req.user._id,
      accountType: accountType || "savings",
      accountNumber: "ACC" + Date.now() + Math.floor(Math.random() * 1000),
    });
    res.status(201).json({ message: "Account created successfully", account });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my accounts
router.get("/my", protect, async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single account
router.get("/:id", protect, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id).populate("user", "name email");
    if (!account) return res.status(404).json({ message: "Account not found" });
    if (account.user._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Access denied" });
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;