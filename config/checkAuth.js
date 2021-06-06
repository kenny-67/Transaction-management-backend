const ActiveSession = require("../models/activeSession");

const checkAuth = (req, res, next) => {
  const token = String(req.headers.authorization);
  ActiveSession.find({ token }, function (err, session) {
    if (session.length == 1) {
      return next();
    } else {
      return res.json({ success: false, msg: "User is not logged on" });
    }
  });
};

module.exports = {
  checkAuth: checkAuth,
};
