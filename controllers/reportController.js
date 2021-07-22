const Order = require("../models/order");
const Products = require("../models/product");

exports.productReport = async (req, res) => {
  const { startDate, endDate } = req.body;
  if (!startDate && !endDate) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const data = {};

    data.productCount = await Products.countDocuments({});
    //get all orders for the specified duration
    const orders = await Order.find({
      date: {
        $gte: new Date(new Date(startDate).setHours(00, 00, 00)),
        $lt: new Date(new Date(endDate).setHours(23, 59, 59)),
      },
    }).sort({ date: "asc" });

    //get all products for the specified duration
    const products = await Products.find({
      dateOfPurchase: {
        $gte: new Date(new Date(startDate).setHours(00, 00, 00)),
        $lt: new Date(new Date(endDate).setHours(23, 59, 59)),
      },
    }).sort({ dateOfPurchase: "asc" });

    if (!products) {
      return res.status(400).json({
        success: false,
        message: "Could not retrieve transactions",
      });
    }

    let total = 0;
    let productSold = [];

    //get revenue generated
    orders.forEach((order) => {
      total += order.total;
    });

    //getting products sold
    await orders.forEach((order) => {
      let orderDetails = order.orderDetails;
      orderDetails.forEach((detail) => {
        let customObj = {};
        customObj.productId = detail.productId;
        customObj.productName = detail.productName;
        customObj.quantity = detail.quantity;
        customObj.price = detail.price * detail.quantity;

        productSold.push(customObj);
      });
    });

    const checkDuplicate = (array, obj) => {
      let i;
      let searchResult = false;
      for (i = 0; i < array.length; i++) {
        console.log(array[i].productName, obj.productName);
        if (array[i].productId == obj.productId) {
          console.log("from loop found");
          searchResult = true;
          break;
        }
      }
      if (searchResult) {
        return true;
      } else {
        return false;
      }
    };

    //get best selling products
    let best = [
      {
        productName: "dummy",
        productId: "123",
        quamtity: 12,
      },
    ];
    await productSold.forEach(async (product) => {
      console.log(product.productId);
      // // console.log("before search==================>", product);

      //check if the product exist
      const isExist = await checkDuplicate(best, product);
      if (isExist) {
        console.log("found");
      } else {
        console.log(isExist, "notFound");
        best.push(product);
      }
    });

    data.productSold = orders.length;
    data.bestSelling = best;
    data.revenue = total;
    data.product = products;
    data.productSold = productSold;

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

exports.salesReport = async (req, res) => {
  const { endDate, startDate } = req.body;

  console.log(req.body);

  try {
    const orders = await Order.find({
      date: {
        $gte: new Date(new Date(startDate).setHours(00, 00, 00)),
        $lt: new Date(new Date(endDate).setHours(23, 59, 59)),
      },
    }).sort({ date: "asc" });
    if (!orders) {
      return res.status(400).json({
        success: false,
        message: "Could not retrieve transactions",
      });
    }

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: e.message,
    });
  }
};

exports.stockPurchaseReport = async (req, res) => {
  const { startDate, endDate } = req.body;
  if (!startDate && !endDate) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const products = await Products.find({
      dateOfPurchase: {
        $gte: new Date(new Date(startDate).setHours(00, 00, 00)),
        $lt: new Date(new Date(endDate).setHours(23, 59, 59)),
      },
    }).sort({ dateOfPurchase: "asc" });
    if (!products) {
      return res.status(400).json({
        success: false,
        message: "Could not retrieve transactions",
      });
    }

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: e.message,
    });
  }
};
