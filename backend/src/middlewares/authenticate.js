const User = require("../models/userModel");
const AppError = require("../utils/appErrors");
const util = require("util");
const jwt = require("jsonwebtoken");
const jwtVerify = util.promisify(jwt.verify);

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new AppError("You are not logged in! Please log in to get access.", 401));
  }

  try {
    // Verify token
    const decoded = await jwtVerify(token, process.env.JWT_SECRET_KEY);

    // Check if user still exists
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return next(new AppError("The user belonging to this token no longer exists.", 401));
    }

    // Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError("User recently changed password! Please log in again.", 401));
    }

    // Grant access
    req.user = currentUser;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return next(new AppError("Invalid token. Please log in again.", 401));
  }
};

module.exports = authenticate;
