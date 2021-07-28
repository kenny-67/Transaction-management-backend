const express = require("express");
const router = express.Router();
const checkAuth = require("../config/checkAuth").checkAuth;

const {
  GetAllDebt,
  clearDebt,
  confirmPayment,
} = require("../controllers/debtController");

router.get("/", checkAuth, GetAllDebt);
router.post("/clear", checkAuth, clearDebt);
router.get("/confirm", confirmPayment);

module.exports = router;
