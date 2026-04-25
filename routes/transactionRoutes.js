const express = require("express");
const router = express.Router();
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const { protect } = require("../middleware/authMiddleware");

// Deposit
router.post("/deposit", protect, async (req, res) => {
  const { accountId, amount, description } = req.body;
  try {
    const account = await Account.findById(accountId);
    if (!account) return res.status(404).json({ message: "Account not found" });
    if (account.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Access denied" });

    account.balance += Number(amount);
    await account.save();

    const transaction = await Transaction.create({
      toAccount: account._id,
      type: "deposit",
      amount,
      description: description || "Deposit",
      balanceAfter: account.balance,
    });

    res.json({ message: `₹${amount} deposited`, newBalance: account.balance, transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Withdraw
router.post("/withdraw", protect, async (req, res) => {
  const { accountId, amount, description } = req.body;
  try {
    const account = await Account.findById(accountId);
    if (!account) return res.status(404).json({ message: "Account not found" });
    if (account.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Access denied" });
    if (account.balance < amount)
      return res.status(400).json({ message: "Insufficient balance" });

    account.balance -= Number(amount);
    await account.save();

    const transaction = await Transaction.create({
      fromAccount: account._id,
      type: "withdrawal",
      amount,
      description: description || "Withdrawal",
      balanceAfter: account.balance,
    });

    res.json({ message: `₹${amount} withdrawn`, newBalance: account.balance, transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Transfer
router.post("/transfer", protect, async (req, res) => {
  const { fromAccountId, toAccountNumber, amount, description } = req.body;
  try {
    const fromAccount = await Account.findById(fromAccountId);
    if (!fromAccount) return res.status(404).json({ message: "Source account not found" });
    if (fromAccount.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Access denied" });
    if (fromAccount.balance < amount)
      return res.status(400).json({ message: "Insufficient balance" });

    const toAccount = await Account.findOne({ accountNumber: toAccountNumber });
    if (!toAccount) return res.status(404).json({ message: "Destination account not found" });

    fromAccount.balance -= Number(amount);
    toAccount.balance += Number(amount);
    await fromAccount.save();
    await toAccount.save();

    const transaction = await Transaction.create({
      fromAccount: fromAccount._id,
      toAccount: toAccount._id,
      type: "transfer",
      amount,
      description: description || "Transfer",
      balanceAfter: fromAccount.balance,
    });

    res.json({ message: `₹${amount} transferred`, newBalance: fromAccount.balance, transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Transaction history
router.get("/:accountId", protect, async (req, res) => {
  try {
    const account = await Account.findById(req.params.accountId);
    if (!account) return res.status(404).json({ message: "Account not found" });
    if (account.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Access denied" });

    const transactions = await Transaction.find({
      $or: [{ fromAccount: account._id }, { toAccount: account._id }],
    }).sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;