const mongoose = require("mongoose");
const orderDetails = require("./orderDetails");

//we define the schema for the database
const pendingOrders = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  orderDetails: [orderDetails.schema],
  total: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PendingOrder", pendingOrders);
