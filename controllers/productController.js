const mongoose = require("mongoose");
const Product = require("../models/product");

exports.getAllProduct = (req, res) => {
  Product.find(
    {},
    "_id productName quantity originalPrice sellingPrice dateOfPurchase warehouse",
    (err, products) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false });
      }
      return res.status(200).json({ success: true, products });
    }
  );
};

exports.getProduct = (req, res) => {
  const id = req.params.id;
  Product.findOne(
    { _id: id },
    "_id productName quantity originalPrice sellingPrice dateOfPurchase warehouse",
    (err, product) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false });
      }
      return res.status(200).json({ success: true, product });
    }
  );
};

exports.createProduct = (req, res) => {
  const {
    productName,
    quantity,
    originalPrice,
    sellingPrice,
    dateOfPurchase,
    warehouseId,
  } = req.body;
  if (
    !productName ||
    !quantity ||
    !originalPrice ||
    !sellingPrice ||
    !dateOfPurchase ||
    !warehouseId
  ) {
    return res.status(400).json({
      success: false,
      msg: "All fields are required",
    });
  }
  // return res.json(req.body);

  Product.create(
    {
      _id: new mongoose.Types.ObjectId(),
      productName,
      quantity,
      originalPrice,
      sellingPrice,
      dateOfPurchase: new Date(),
      warehouseId,
    },
    (err, product) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false });
      }
      return res.status(201).json({
        success: true,
        msg: "Product created successfully",
        productId: product._id,
      });
    }
  );
};
