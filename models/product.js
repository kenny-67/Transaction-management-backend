const mongoose = require("mongoose");

//we define the schema for the database
const productSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  dateOfPurchase: { type: Date, required: false },
  // warehouse: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Warehouse",
  //   required: true,
  // },
});

module.exports = mongoose.model("Product", productSchema);
