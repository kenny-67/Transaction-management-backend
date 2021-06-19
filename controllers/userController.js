const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/users");
const ActiveSession = require("../models/activeSession");

exports.getAllUsers = (req, res) => {
  User.find({}, function (err, users) {
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
    return res.json({ success: true, users: users });
  });
};

exports.register = (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    userType,
    storeId,
    warehouseId,
  } = req.body;

  if (!firstName || !lastName || !email || !password || !phoneNumber) {
    res.status(400).json({
      success: false,
      msg: "All fields are required",
    });
  }

  User.findOne({ email }).then((user) => {
    if (user) {
      res.json({ success: false, msg: "Email already exists" });
    } else if (password.length < 6) {
      res.json({
        success: false,
        msg: "Password must be at least 6 characters long",
      });
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, null, (err, hash) => {
          if (err) throw err;
          const query = {
            firstName,
            lastName,
            email,
            phoneNumber,
            userType,
            storeId,
            warehouseId,
            password: hash,
            _id: new mongoose.Types.ObjectId(),
          };
          User.create(query, function (err, user) {
            if (err) {
              return res.status(400).json({
                error: err,
              });
            }
            res.json({
              success: true,
              userID: user._id,
              msg: "The user was succesfully registered",
            });
          });
        });
      });
    }
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and Password is required",
    });
  }

  User.findOne({ email: email }, (err, user) => {
    if (err) throw err;

    if (!user) {
      return res.json({ success: false, msg: "Wrong credentials" });
    }

    if (!user.accountConfirmation) {
      return res.json({ success: false, msg: "Account is not confirmed" });
    }

    bcrypt.compare(password, user.password, function (err, isMatch) {
      if (err) throw err;
      if (isMatch) {
        const token = jwt.sign(
          { id: user._id, email: user.email, isAdmin: user.isAdmin },
          "somerandomkey1245",
          {
            expiresIn: 3600,
          }
        );
        // Don't include the password in the returned user object
        const query = { userId: user._id, token: "JWT " + token };
        const userResponse = {
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          email: user.email,
        };
        ActiveSession.create(query, function (err, cd) {
          return res.json({
            success: true,
            token: "JWT " + token,
            user: userResponse,
          });
        });
      } else {
        return res.json({ success: false, msg: "Wrong credentials" });
      }
    });
  });
};

exports.getUser = (req, res) => {
  const userId = req.params.id;
  User.find(
    { _id: userId },
    "firstName lastName email isAdmin",
    (err, user) => {
      if (err) {
        console.log(err);
        return res.json({ success: false, error: err });
      }

      return res.json({ success: true, user: user[0] });
    }
  );
};

exports.confirmEmail = (req, res) => {
  const userID = req.params.id;

  const query = { _id: userID };

  const newvalues = { $set: { accountConfirmation: true } };
  User.updateOne(query, newvalues, function (err, usr) {
    if (err) {
      res.json({ success: false });
    }
    res.json({ success: true });
  });
};

exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, msg: "Please enter all fields" });
  }
  User.find({ email: email }).then((user) => {
    if (user.length != 1) {
      return res
        .status(400)
        .json({ success: false, msg: "Email Address does not exist" });
    }
    // create reusable transporter object using the default SMTP transport
    // const transporter = nodemailer.createTransport(smtpConf);

    const query = { _id: user[0]._id };
    const newvalues = { $set: { resetPass: true } };
    User.updateOne(query, newvalues, function (err, usr) {});

    // don't send emails if it is in demo mode
    // if (process.env.DEMO != 'yes') {
    //   // send mail with defined transport object
    //   transporter.sendMail({
    //     from: '"Creative Tim" <' + smtpConf.auth.user + '>', // sender address
    //     to: email, // list of receivers
    //     subject: 'Creative Tim Reset Password', // Subject line
    //     // eslint-disable-next-line max-len
    //     html: '<h1>Hey,</h1><br><p>If you want to reset your password, please click on the following link:</p><p><a href="' + 'http://localhost:3000/auth/confirm-password/' + user._id + '">"' + 'http://localhost:3000/auth/confirm-email/' + user._id + + '"</a><br><br>If you did not ask for it, please let us know immediately at <a href="mailto:' + smtpConf.auth.user + '">' + smtpConf.auth.user + '</a></p>', // html body
    //   });
    //   res.json({success: true});
    // }
    return res.status(200).json({ success: true, userID: user[0]._id });
  });
};

exports.resetPassword = (req, res) => {
  const errors = [];
  const userID = req.params.id;

  let { password } = req.body;

  if (password.length < 6) {
    return res
      .status(400)
      .json({ success: false, msg: "Password must be at least 6 characters" });
  }
  const query = { _id: userID };
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, null, (err, hash) => {
      if (err) throw err;
      password = hash;
      const newvalues = { $set: { resetPass: false, password: password } };
      User.updateOne(query, newvalues, function (err, usr) {
        if (err) {
          res.json({ success: false, msg: err });
        }
        res.json({ success: true });
      });
    });
  });
};

exports.logOut = (req, res) => {
  const token = req.body.token;
  console.log(token);
  ActiveSession.deleteMany({ token }, function (err, item) {
    if (err) {
      res.json({ success: false });
    }
    res.json({ success: true });
  });
};

exports.checkSession = (req, res) => {
  res.json({ success: true });
};
