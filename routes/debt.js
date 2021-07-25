const express = require("express");
const router = express.Router();
const checkAuth = require("../config/checkAuth").checkAuth;

const { GetAllDebt } = require("../controllers/debtController");

router.get("/", checkAuth, GetAllDebt);

module.exports = router;
