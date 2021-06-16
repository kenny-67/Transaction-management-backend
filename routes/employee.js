const express = require("express");
const router = express.Router();
const checkAuth = require("../config/checkAuth").checkAuth;

const {
  getAllEmployees,
  getEmployee,
} = require("../controllers/employeeController");


router.get("/", checkAuth, getAllEmployees);
router.get("/:id", checkAuth, getEmployee);

module.exports = router;
