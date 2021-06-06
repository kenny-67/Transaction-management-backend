const mongoose = require("mongoose");

//we define the schema for the database
const storeSchema = mongoose.Schema({
  //type
  _id: mongoose.Schema.Types.ObjectId,
  storeName: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, default: "Not set" },
});

//mongoose object take two arguments (1)name of the model and 2) schema to use for the model
module.exports = mongoose.model("Store", storeSchema);
