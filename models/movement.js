const mongoose = require("mongoose");

//we define the schema for the database
const movementSchema = mongoose.Schema({
  //type
  _id: mongoose.Schema.Types.ObjectId,
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Warehouse",
    required: true,
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

//mongoose object take two arguments (1)name of the model and 2) schema to use for the model
module.exports = mongoose.model("Movement", movementSchema);
