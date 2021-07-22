const Order = require("../models/order");
const Stores = require("../models/store");
const Users = require("../models/users");
const Products = require("../models/product");

exports.getHeaderData = async (req, res) => {
  const data = {};
  try {
    data.orders = await Order.countDocuments({});
    data.stores = await Stores.countDocuments({});
    data.employees = await Users.countDocuments({ isAdmin: false });
    data.products = await Products.countDocuments({});

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: e.message,
    });
  }
};

// exports.adminDashboard = async (req, res) => {
//   const { store } = req.body;

//   const data = {};
//   const query = {};

//   try {
//     if (store) {
//       query.store = store;
//     }

//     data.orders = await Order.countDocuments(query);
//     data.stores = await Stores.countDocuments({});
//     data.employees = await Users.countDocuments({ isAdmin: false });
//     data.products = await Products.countDocuments({});

//     //get Top selling product
//   } catch (e) {
//     return res.status(500).json({
//       success: false,
//       error: e.message,
//     });
//   }
// };
