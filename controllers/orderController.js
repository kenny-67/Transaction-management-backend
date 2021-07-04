const mongoose = require("mongoose");
const Product = require("../models/product");
const User = require("../models/users");
const Order = require("../models/order");
const PendingOrder = require("../models/pendingOrders");

const {
  generatepaymentlink,
  validatePayment,
} = require("../config/paymentServices");

exports.createOrder = async (req, res) => {
  const { orderDetails, total, redirectURL } = req.body;
  console.log(redirectURL);
  const { id } = req.userData;

  if (!orderDetails && !total && !redirectURL) {
    return res.status(400).json({
      success: false,
      message: "One or more required details are missing",
    });
  }

  const user = await User.find({ _id: id });

  const name = `${user[0].firstName} ${user[0].lastName}`;

  const callbackURL = `${req.protocol}://${req.headers.host}/api/order/confirm`;

  const orderId = new mongoose.Types.ObjectId();

  //pay for order
  const paymentArgs = {
    amount: +total,
    email: user[0].email,
    userId: id,
    name,
    phonenumber: user[0].phoneNumber,
    meta: {
      justTesting: true,
      orderId,
    },
    transactionInfo: {
      title: "Payment for order",
      description: "Money calls",
    },
  };

  const [success, response] = await generatepaymentlink(
    paymentArgs,
    callbackURL,
    redirectURL
  );

  if (!success) {
    return res.status(500).json({
      success: false,
      message: "operations failed",
      error: response,
    });
  }

  const orderInfo = {
    _id: new mongoose.Types.ObjectId(),
    userId: id,
    total,
    amountPaid: 0,
    orderDetails,
    status: "Pending",
  };

  //create order
  const createdOrder = await Order.create(orderInfo);

  if (!createdOrder) {
    return res.status(500).json({
      success: false,
      error: "Could not create pending order, please try again",
    });
  }

  return res.status(201).json({
    success: true,
    message: response,
  });
};

exports.confirmPayment = async (req, res) => {
  const { status, transaction_id, tx_ref } = req.query;

  if (!transaction_id) {
    return res.status(404).json({
      message: "Transaction not found",
    });
  }
  if (status !== "successful") {
    return res.status(400).json({
      message: "Error occured while processing your payment!",
    });
  }

  const [callStatus, responseJSON, statusCode] = await validatePayment(
    transaction_id
  );

  if (!callStatus) {
    return res.status(statusCode).json({
      message: responseJSON.message,
    });
  }

  if (responseJSON.status.toLowerCase().trim() !== "success") {
    return res.status(400).json({
      message: "The transaction did not succeed",
    });
  }

  const { data: flutterData } = responseJSON;

  console.log(flutterData);
  const { frontendRedirectURL, userId, orderId } = flutterData.meta;

  console.log(
    "======================>",
    frontendRedirectURL,
    "<==============="
  );
  const amountPaid = flutterData.amount_settled;

  //update order
  const newvalues = { $set: { status: "Completed", amountPaid } };
  const updateOrder = await Order.updateOne({ _id: orderId }, newvalues);

  if (!updateOrder) {
    return res.status(500).json({
      success: false,
      message: "Error updating the order",
    });
  }

  const orderEntry = await Order.findOne({ _id: orderId });
  console.log(orderEntry);

  const message = "Successfully verified transaction";
  return res.redirect(`${frontendRedirectURL}`);
};

exports.getOrders = async (req, res) => {
  const { status } = req.query;

  let query = {};
  if (status && status.length > 0) {
    query.status = { $in: status };
  }

  console.log(query);

  const order = await Order.find(
    query,
    "_id userId total amountPaid status date"
  );

  return res.status(200).json({
    success: true,
    order,
  });
};

exports.getOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.find(
    { _id: id },
    "_id userId total amountPaid orderDetails status date"
  );

  return res.status(200).json({
    success: true,
    order,
  });
};
