const express = require("express");
const router = express.Router();
const checkAuth = require("../config/checkAuth").checkAuth;

const {
  createOrder,
  confirmPayment,
  getOrders,
  getOrder,
} = require("../controllers/orderController");

router.post("/create", checkAuth, createOrder);
router.get("/confirm", confirmPayment);
router.get("/", getOrders);
router.get("/:id", getOrder);

module.exports = router;
