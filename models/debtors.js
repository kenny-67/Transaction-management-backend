const mongoose = require("mongoose");

const DebtorsSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  amountOwed: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  orderId: {
    type: String,
    ref: "Order",
    required: true,
  },
  orderStatus: {
    type: String,
    enum: {
      values: ["Pending", "Completed"],
      message: "{VALUE} is not supported",
    },
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Debtors = mongoose.model("Debtors", DebtorsSchema);

module.exports = Debtors;
