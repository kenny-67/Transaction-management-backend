const mongoose = require("mongoose");
const Product = require("../models/product");
const User = require("../models/users");
const Store = require("../models/store");

exports.getAllProductList = async (req, res) => {
  Product.find(
    {},
    "_id productName quantity originalPrice sellingPrice dateOfPurchase warehouse",
    (err, product) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false });
      }
      return res.status(200).json({ success: true, data: product });
    }
  );
};

exports.getAllProduct = async (req, res) => {
  const { page = 0, limit = 20 } = req.query;
  const { isAdmin, id } = req.userData;

  const modelPage = page == 0 ? page : +page - 1;
  const previousPage = modelPage == 0 ? null : page - 1;

  const currentPage = +modelPage + 1;

  if (isAdmin) {
    const products = await Product.find(
      {},
      "_id productName quantity originalPrice sellingPrice store dateOfPurchase"
    )
      .sort({ date: "desc" })
      .skip(modelPage * limit)
      .limit(limit);

    if (!products) {
      return res.status(500).json({ success: false });
    }
    let productCount = await Product.find().countDocuments();

    const nextPage =
      Math.ceil(productCount / limit) - currentPage > 0
        ? +currentPage + 1
        : null;

    const totalPages = Math.round(productCount / 20);

    return res.status(200).json({
      success: true,
      data: products,
      paginationData: {
        currentPage,
        nextPage,
        previousPage,
        itemCount: productCount,
        totalPages,
      },
    });
  } else {
    //get staff details
    const user = await User.findOne({ _id: id });

    //get the store the staff is linked to
    const store = await Store.findOne({ storeName: "Store 1" });

    if (store) {
      console.log(store);
      const products = await Product.find(
        { store: store._id },
        "_id productName quantity originalPrice sellingPrice store dateOfPurchase"
      )
        .sort({ date: "desc" })
        .skip(modelPage * limit)
        .limit(limit);

      if (!products) {
        return res.status(500).json({ success: false });
      }
      if (products) {
        let productCount = await Product.find({
          store: store._id,
        }).countDocuments();

        const nextPage =
          Math.ceil(productCount / limit) - currentPage > 0
            ? +currentPage + 1
            : null;

        const totalPages = Math.round(productCount / 20);

        return res.status(200).json({
          success: true,
          data: products,
          paginationData: {
            currentPage,
            nextPage,
            previousPage,
            itemCount: productCount,
            totalPages,
          },
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "This user is not associated with a store",
      });
    }
  }
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
    storeId,
  } = req.body;
  if (
    !productName ||
    !quantity ||
    !originalPrice ||
    !sellingPrice ||
    !dateOfPurchase ||
    !storeId
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
      dateOfPurchase,
      store: storeId,
      createdAt: new Date(),
      updatedAt: new Date(),
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
