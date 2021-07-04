const mongoose = require("mongoose");
const orderDetails = require("./orderDetails");

//we define the schema for the database
const orderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  orderDetails: [orderDetails.schema],
  total: {
    type: Number,
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
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

module.exports = mongoose.model("Order", orderSchema);
