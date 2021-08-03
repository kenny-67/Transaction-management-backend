const mongoose = require("mongoose");
const Store = require("../models/store");

exports.getAllStore = async (req, res) => {
  const { page = 0, limit = 20 } = req.query;

  const modelPage = page == 0 ? page : +page - 1;
  const previousPage = modelPage == 0 ? null : page - 1;
  const currentPage = +modelPage + 1;
  const store = await Store.find({}, "_id storeName address")
    .sort({ date: "desc" })
    .skip(modelPage * limit)
    .limit(limit);
  if (!store) {
    return res.json({ success: false, message: "Could not fetch data" });
  }

  let storeCount = await Store.find().countDocuments();

  const nextPage =
    Math.ceil(storeCount / limit) - currentPage > 0 ? +currentPage + 1 : null;

  const totalPages = Math.round(storeCount / 20);

  return res.status(200).json({
    success: true,
    data: store,
    paginationData: {
      currentPage,
      nextPage,
      previousPage,
      itemCount: storeCount,
      totalPages,
    },
  });
};

exports.getStore = (req, res) => {
  const id = req.params.id;
  Store.find({ _id: id }, "_id storeName address", (err, stores) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false });
    }
    return res.status(200).json({ success: true, stores });
  });
};

exports.createStore = (req, res) => {
  const { name, address, email } = req.body;

  Store.findOne({ StoreName: name }).then((store) => {
    if (store) {
      return res
        .status(400)
        .json({ success: false, msg: "Store name already exist" });
    }
    Store.create(
      { _id: new mongoose.Types.ObjectId(), storeName: name, address, email },
      (err, store) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ success: false });
        }
        return res.status(201).json({
          success: true,
          msg: "Store created successfully",
          storeId: store._id,
        });
      }
    );
  });
};
