const express = require("express");
const router = express.Router();
const checkAuth = require("../config/checkAuth").checkAuth;

const {
  createWarehouse,
  getAllWarehouse,
  getWarehouse,
} = require("../controllers/warehouseController");

router.post("/create", checkAuth, createWarehouse);
router.get("/", checkAuth, getAllWarehouse);
router.get("/:id", checkAuth, getWarehouse);

module.exports = router;
