const mongoose = require("mongoose");
const Store = require("../models/store");

exports.getAllStore = (req, res) => {
  Store.find({}, "_id storeName address", (err, stores) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false });
    }
    return res.status(200).json({ success: true, stores });
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
  const { name, address } = req.body;

  Store.findOne({ StoreName: name }).then((store) => {
    if (store) {
      return res
        .status(400)
        .json({ success: false, msg: "Store name already exist" });
    }
    Store.create(
      { _id: new mongoose.Types.ObjectId(), storeName: name, address },
      (err, store) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ success: false });
        }
        return res.status(201).json({
          success: true,
          msg: "Store created successfully",
          storeId: Store._id,
        });
      }
    );
  });
};
