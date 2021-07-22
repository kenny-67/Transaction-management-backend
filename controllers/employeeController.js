const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/users");
const ActiveSession = require("../models/activeSession");

exports.getAllEmployees = (req, res) => {
  const { filterBy, sortBy } = req.query;

  console.log(req.query);

  //sort by firstName, lastName, date created,
  //filter by store*

  //filter
  let filter = { isAdmin: false };

  if (filterBy) {
    filter.storeName = filterBy;
  }

  //sort
  let sortValue = {};
  if (sortBy) {
    sortValue[sortBy] = 1;
  }

  User.find(
    filter,
    "_id firstName lastName email phoneNumber userType storeName warehouseId",
    { sort: sortValue },
    function (err, users) {
      if (err) {
        return res.json({ success: false, error: err });
      }

      return res.json({ success: true, employees: users });
    }
  );
};

exports.getEmployee = (req, res) => {
  const employeeId = req.params.id;
  User.find(
    { _id: employeeId, isAdmin: false },
    "_id firstName lastName email phoneNumber userType storeId warehouseId",
    (err, user) => {
      if (err) {
        console.log(err);
        return res.json({ success: false, error: err });
      }

      return res.json({ success: true, employee: user[0] });
    }
  );
};
