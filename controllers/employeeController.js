const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/users");
const ActiveSession = require("../models/activeSession");

exports.getAllEmployees = (req, res) => {
  User.find({isAdmin: false}, "_id firstName lastName email phoneNumber userType storeId warehouseId", function (err, users) {
    if (err) {
      return res.json({ success: false });
    }
    //to remove the password of all users from the response
    users = users.map(function (item) {
      const x = item;
      x.password = undefined;
      x.__v = undefined;
      return x;
    });
    return res.json({ success: true, employees: users });
  });
};




exports.getEmployee = (req, res) => {
  const employeeId = req.params.id;
  User.find({ _id: employeeId, isAdmin: false }, "_id firstName lastName email phoneNumber userType storeId warehouseId", (err, user) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, error: err });
    }

    return res.json({ success: true, employee: user[0] });
  });
};


