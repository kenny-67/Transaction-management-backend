const Debtors = require("../models/debtors");
const User = require("../models/users");

const {
  generatepaymentlink,
  validatePayment,
} = require("../config/paymentServices");

exports.GetAllDebt = async (req, res) => {
  const { page = 0, limit = 20 } = req.query;
  const modelPage = page == 0 ? page : +page - 1;
  const previousPage = modelPage == 0 ? null : page - 1;
  const currentPage = +modelPage + 1;
  try {
    const debtors = await Debtors.find(
      {},
      "_id firstName lastName phoneNumber email address orderId amountOwed  date"
    )
      .sort({ date: "desc" })
      .skip(modelPage * limit)
      .limit(limit);

    if (!debtors) {
      return res.json({ success: false, message: "Could not fetch data" });
    }

    let debtorsCount = await Debtors.find().countDocuments();

    const nextPage =
      Math.ceil(debtorsCount / limit) - currentPage > 0
        ? +currentPage + 1
        : null;

    const totalPages = Math.round(debtorsCount / 20);

    return res.status(200).json({
      success: true,
      data: debtors,
      paginationData: {
        currentPage,
        nextPage,
        previousPage,
        itemCount: debtorsCount,
        totalPages,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Successfully retrieved debtors list",
      data: debtors,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Operation Failed",
    });
  }
};

exports.clearDebt = async (req, res) => {
  const { amountOwed, redirectURL, amountPaid, orderType, debtorId } = req.body;
  console.log(amountOwed, redirectURL, amountPaid, orderType, debtorId);
  const { id } = req.userData;

  if (orderType === "CASH") {
    console.log("handling cash order");
    if (!amountOwed && !amountPaid && !debtorId) {
      return res.status(400).json({
        success: false,
        message: "One or more required details are missing",
      });
    }

    const updateAmount = amountOwed - amountPaid;

    //update debtors table
    const isUpdated = await Debtors.updateOne(
      { _id: debtorId, orderStatus: "Completed" },
      { amountOwed: updateAmount }
    );

    if (!isUpdated) {
      return res.status(500).json({
        success: false,
        error: "Could not update debt, please try again",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Debt Paid successfully",
    });
  }

  if (!amountOwed && !amountPaid && !debtorId && !redirectURL) {
    return res.status(400).json({
      success: false,
      message: "One or more required details are missing",
    });
  }

  const user = await User.find({ _id: id });

  const name = `${user[0].firstName} ${user[0].lastName}`;

  const callbackURL = `${req.protocol}://${req.headers.host}/api/debtor/confirm`;

  //pay for order
  const paymentArgs = {
    amount: +amountPaid,
    totalAmount: +amountOwed,
    email: user[0].email,
    userId: id,
    name,
    phonenumber: user[0].phoneNumber,
    meta: {
      justTesting: true,
      debtorId,
      amountOwed,
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
  const { frontendRedirectURL, debtorId, amountOwed } = flutterData.meta;

  const amountPaid = flutterData.amount_settled + flutterData.app_fee;

  //update debt

  const updateOrder = await Debtors.updateOne(
    {
      _id: debtorId,
    },
    { amountOwed: +amountOwed - amountPaid }
  );

  if (!updateOrder) {
    return res.status(500).json({
      success: false,
      message: "Error updating the debt",
    });
  }
  console.log(frontendRedirectURL);
  return res.redirect(`${frontendRedirectURL}`);
};
