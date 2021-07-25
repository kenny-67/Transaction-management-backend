const Debtors = require("../models/debtors");

exports.GetAllDebt = async (req, res) => {
  try {
    const debtors = await Debtors.find(
      {},
      "_id firstName lastName phoneNumber email address orderId amountOwed  date"
    ).sort({ date: "desc" });
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
