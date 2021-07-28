const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/users");
const ActiveSession = require("../models/activeSession");

exports.getAllEmployees = async (req, res) => {
  const { filterBy, sortBy, page = 0, limit = 20 } = req.query;

  const modelPage = page == 0 ? page : +page - 1;
  const previousPage = modelPage == 0 ? null : page - 1;
  const currentPage = +modelPage + 1;

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

  const user = await User.find(
    filter,
    "_id firstName lastName email phoneNumber userType storeName warehouseId"
  )
    .sort(sortValue)
    .skip(modelPage * limit)
    .limit(limit);
  if (!user) {
    return res.json({ success: false, message: "Could not fetch data" });
  }

  let userCount = await User.find().countDocuments();

  const nextPage =
    Math.ceil(userCount / limit) - currentPage > 0 ? +currentPage + 1 : null;

  const totalPages = Math.round(userCount / 20);

  return res.status(200).json({
    success: true,
    data: user,
    paginationData: {
      currentPage,
      nextPage,
      previousPage,
      itemCount: userCount,
      totalPages,
    },
  });
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
