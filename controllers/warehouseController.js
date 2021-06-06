const mongoose = require("mongoose");
const Warehouse = require("../models/warehouse");

exports.getAllWarehouse = (req, res) => {
  Warehouse.find({}, "_id warehouseName address", (err, warehouses) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false });
    }
    return res.status(200).json({ success: true, warehouses });
  });
};

exports.getWarehouse = (req, res) => {
  const id = req.params.id;
  Warehouse.find(
    { _id: id },
    "_id warehouseName address",
    (err, warehouses) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false });
      }
      return res.status(200).json({ success: true, warehouses });
    }
  );
};

exports.createWarehouse = (req, res) => {
  const { name, address } = req.body;

  Warehouse.findOne({ warehouseName: name }).then((warehouse) => {
    if (warehouse) {
      return res
        .status(400)
        .json({ success: false, msg: "warehouse name already exist" });
    }
    Warehouse.create(
      { _id: new mongoose.Types.ObjectId(), warehouseName: name, address },
      (err, warehouse) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ success: false });
        }
        return res.status(201).json({
          success: true,
          msg: "Warehouse created successfully",
          warehouseId: warehouse._id,
        });
      }
    );
  });
};
