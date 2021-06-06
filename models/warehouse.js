const mongoose = require("mongoose");

//we define the schema for the database
const warehouseSchema = mongoose.Schema({
  //type
  _id: mongoose.Schema.Types.ObjectId,
  warehouseName: {type: String, required: true},
  address: { type: String, required: true },
});

module.exports = mongoose.model("Warehouse", warehouseSchema);
