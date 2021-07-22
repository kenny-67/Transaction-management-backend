const express = require("express");
const router = express.Router();
const checkAuth = require("../config/checkAuth").checkAuth;


const { getHeaderData } = require("../controllers/dashboardController");

router.get("/adminHeader", checkAuth, getHeaderData);

module.exports = router;
