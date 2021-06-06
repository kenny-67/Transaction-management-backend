const express = require("express");
const router = express.Router();
const checkAuth = require("../config/checkAuth").checkAuth;

const {
  createStore,
  getAllStore,
  getStore,
} = require("../controllers/storeController");

router.post("/create", checkAuth, createStore);
router.get("/", checkAuth, getAllStore);
router.get("/:id", checkAuth, getStore);

module.exports = router;
