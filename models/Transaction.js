const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    fromAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account", default: null },
    toAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account", default: null },
    type: { type: String, enum: ["deposit", "withdrawal", "transfer"], required: true },
    amount: { type: Number, required: true, min: 1 },
    description: { type: String, default: "" },
    status: { type: String, enum: ["success", "failed", "pending"], default: "success" },
    balanceAfter: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);