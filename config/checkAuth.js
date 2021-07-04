const ActiveSession = require("../models/activeSession");
const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
  const token = String(req.headers.authorization);
  const splittedtoken = token.split("JWT")[1].trim();
  ActiveSession.find({ token }, function (err, session) {
    try {
      const decoded = jwt.verify(splittedtoken, "somerandomkey1245");

      if (session.length == 1) {
        req.userData = decoded;
        return next();
      } else {
        return res.json({ success: false, msg: "User is not logged on" });
      }
    } catch (e) {
      return res.json({ success: false, msg: "User is not logged on" });
    }
  });
};

module.exports = {
  checkAuth: checkAuth,
};
