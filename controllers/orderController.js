const mongoose = require("mongoose");
const User = require("../models/users");
const Order = require("../models/order");
const Debtors = require("../models/debtors");

const {
  generatepaymentlink,
  validatePayment,
} = require("../config/paymentServices");

exports.createOrder = async (req, res) => {
  const {
    orderDetails,
    total,
    redirectURL,
    amountPaid,
    customerDetail,
    orderType,
  } = req.body;
  console.log(
    orderDetails,
    total,
    redirectURL,
    amountPaid,
    customerDetail,
    orderType
  );
  const { id } = req.userData;

  const orderId = new mongoose.Types.ObjectId();

  if (orderType === "CASH") {
    console.log("handling cash order");
    if (!orderDetails && !total && !total) {
      return res.status(400).json({
        success: false,
        message: "One or more required details are missing",
      });
    }

    if (customerDetail && amountPaid < total) {
      //add to debtor
      const obj = {
        _id: new mongoose.Types.ObjectId(),
        firstName: customerDetail.firstName,
        lastName: customerDetail.lastName,
        phoneNumber: customerDetail.phoneNumber,
        email: customerDetail.email,
        address: customerDetail.address,
        orderStatus: "Completed",
        orderId,
        amountOwed: total - amountPaid,
      };

      console.log(obj);

      const debtor = await Debtors.create(obj);
      if (!debtor) {
        return res.status(400).json({
          success: false,
          message: "could not add debtor to database",
        });
      }
    }

    const orderInfo = {
      _id: orderId,
      userId: id,
      total,
      amountPaid,
      orderDetails,
      status: "Completed",
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
      message: "Order created successfully",
    });
  }

  if (!orderDetails && !total && !redirectURL) {
    return res.status(400).json({
      success: false,
      message: "One or more required details are missing",
    });
  }

  const user = await User.find({ _id: id });

  const name = `${user[0].firstName} ${user[0].lastName}`;

  const callbackURL = `${req.protocol}://${req.headers.host}/api/order/confirm`;

  //pay for order
  const paymentArgs = {
    amount: +amountPaid,
    totalAmount: +total,
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
    _id: orderId,
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

  if (customerDetail && amountPaid < total) {
    //add to debtor
    const obj = {
      _id: new mongoose.Types.ObjectId(),
      firstName: customerDetail.firstName,
      lastName: customerDetail.lastName,
      phoneNumber: customerDetail.phoneNumber,
      email: customerDetail.email,
      address: customerDetail.address,
      orderStatus: "Pending",
      orderId,
      amountOwed: total - amountPaid,
    };

    const debtor = await Debtors.create(obj);
    if (!debtor) {
      return res.status(400).json({
        success: false,
        message: "could not add debtor to database",
      });
    }
  }

  return res.status(201).json({
    success: true,
    message: response,
  });
};

exports.createCashOrder = async (req, res) => {
  const { debtorsInfo, orderDetails, total, amountPaidByCustomer } = req.body;
  const { id } = req.userData;

  const orderId = new mongoose.Types.ObjectId();

  if (!orderDetails && !total && !amountPaidByCustomer) {
    return res.status(400).json({
      success: false,
      message: "One or more required details are missing",
    });
  }

  if (debtorsInfo) {
    const orderInfo = {
      _id: orderId,
      userId: id,
      total,
      amountPaid: amountPaidByCustomer,
      orderDetails,
      status: "Completed",
    };

    //create order
    const createdOrder = await Order.create(orderInfo);

    if (!createdOrder) {
      return res.status(500).json({
        success: false,
        error: "Could not create pending order, please try again",
      });
    }
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

  const amountPaid = flutterData.amount_settled + flutterData.app_fee;

  //update order
  const newvalues = { $set: { status: "Completed", amountPaid } };
  const updateOrder = await Order.updateOne({ _id: orderId }, newvalues);

  await Debtors.updateOne(
    {
      orderId,
    },
    { orderStatus: "Completed" }
  );

  if (!updateOrder) {
    return res.status(500).json({
      success: false,
      message: "Error updating the order",
    });
  }
  return res.redirect(`${frontendRedirectURL}`);
};

exports.getOrders = async (req, res) => {
  const { status, page = 0, limit = 20 } = req.query;

  const modelPage = page == 0 ? page : +page - 1;
  const previousPage = modelPage == 0 ? null : page - 1;
  const currentPage = +modelPage + 1;

  let query = {};
  if (status && status.length > 0) {
    query.status = { $in: status };
  }

  console.log(query);

  const order = await Order.find(
    query,
    "_id userId total amountPaid status date"
  )
    .sort({ date: "desc" })
    .skip(modelPage * limit)
    .limit(limit);

  let orderCount = await Order.find().countDocuments();

  const nextPage =
    Math.ceil(orderCount / limit) - currentPage > 0 ? +currentPage + 1 : null;

  const totalPages = Math.round(orderCount / 20);

  return res.status(200).json({
    success: true,
    data: order,
    paginationData: {
      currentPage,
      nextPage,
      previousPage,
      itemCount: orderCount,
      totalPages,
    },
  });
};

exports.getOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.find(
    { _id: id },
    "_id userId total amountPaid orderDetails status date"
  ).sort({ date: "desc" });

  return res.status(200).json({
    success: true,
    order,
  });
};
