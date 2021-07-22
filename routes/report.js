const express = require("express");
const router = express.Router();
const checkAuth = require("../config/checkAuth").checkAuth;

const {
  salesReport,
  productReport,
  stockPurchaseReport,
} = require("../controllers/reportController");

router.post("/sales", checkAuth, salesReport);
router.post("/product", checkAuth, productReport);
router.post("/stockPurchase", checkAuth, stockPurchaseReport);

module.exports = router;
