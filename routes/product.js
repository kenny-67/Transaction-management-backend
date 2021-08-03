const express = require("express");
const router = express.Router();
const checkAuth = require("../config/checkAuth").checkAuth;

const {
  createProduct,
  getAllProduct,
  getProduct,
  getAllProductList,
} = require("../controllers/productController");

router.post("/create", checkAuth, createProduct);
router.get("/", checkAuth, getAllProduct);
router.get("/searchList", checkAuth, getAllProductList);
router.get("/:id", checkAuth, getProduct);

module.exports = router;
