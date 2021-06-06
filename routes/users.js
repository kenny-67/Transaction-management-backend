const express = require("express");
const router = express.Router();
const checkAuth = require("../config/checkAuth").checkAuth;

const {
  register,
  confirmEmail,
  login,
  getAllUsers,
  getUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");

router.post("/register", register);

router.post("/confirm/:id", confirmEmail);

router.post("/login", login);

router.get("/", checkAuth, getAllUsers);

router.get("/:id", checkAuth, getUser);

router.post("/forgotpassword", forgotPassword);

router.post("/resetpass/:id", resetPassword);

module.exports = router;
