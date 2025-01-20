const crypto = require('crypto');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../Models/userModel');
const jwt = require('jsonwebtoken');
const Email = require('../utils/email');

//sign new Token
const signToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  let cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  //Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

//signup
exports.Signup = catchAsync(async function (req, res, next) {
  const newUser = await User.create(req.body);
  // send email to new user
  const url=`${req.protocol}://${req.get('host')}/me`
   await new Email(newUser,url).sendWelcome()
  //signin new jwt token
  createSendToken(newUser, 201, res);
});

//login
exports.Login = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;

  // 1) check if Email and Password exist
  if (!email || !password)
    return next(new AppError('Please provide email or password !', 400));

  // 2) check if Email and Password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError(
        'Invalid! please check your email and password are correct',
        401
      )
    );
  }
  // 3) if Everythings ok send token to the client
  createSendToken(user, 200, res);
});

exports.logout = function (req, res) {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

//protect router using jwt token and verifying the token (middleware function)
exports.protect = catchAsync(async function (req, res, next) {
  //1) Getting Token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError(`Please login and continue !`, 401));
  }

  // 2) verifying JWT token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) check if the user exist or not
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        `The user belonging to this token does not longer exist`,
        401
      )
    );
  }

  // 4) check if user chenged password after token issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        `User recently changed password ! please login and continue`,
        401
      )
    );
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  
  req.user = currentUser;
  res.locals.user=currentUser
  next();
});

//Only for renderd page,No Errors
exports.isLoggedin = async function (req, res, next) {
  try {
    if (req.cookies.jwt) {
      // 1) verifying JWT token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) check if the user exist or not
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) check if user chenged password after token issued
      if (currentUser.changePasswordAfter(decoded.iat)) {
        return next();
      }
      // There is a logged in user
      res.locals.user = currentUser;
      return next();
    }
  } catch (error) {
    return next();
  }
  next();
};

//This middle ware checking permission to delete or update tour data (if this is user or guide it send an error)
exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    //['admin','lead-guide']  user not allowed.In this case sending an error
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`You do not have permission to perform this action !`, 403)
      );
    }
    next();
  };
};

exports.forgotPassword = async function (req, res, next) {
  //get user POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new AppError(`There is no user with email address`, 404));

  //generate the random reset token
  const resetToken = user.createPasswordResetToken(); // we are modify the data we need to save to the database
  await user.save({ validateBeforeSave: false }); // when we saving passwordResetToken , passwordResetExpires := we dont need validation



  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

     //send it to users email
    await new Email(user,resetURL).sendResetPassword()
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(`Ther was an error sending an email ! Try again later`, 500)
    );
  }
};

exports.resetPassword = catchAsync(async function (req, res, next) {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });
  
  if (!user) {
    return next(new AppError(`Your Token is expired !`, 400));
  }
  // 2) if token has not expired, and there is user , set the new Password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  // 3) update changedPasswordAt property for the user
  // 4) log the user in .JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async function (req, res, next) {
  // 1) Get user from collection
  const user = await User.findById(req.user._id).select('+password');
  if (!user) return next(new AppError(`Invalid email or username! `, 400));
  // 2) check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError(`You are entered an invalid password!`, 401));
  }
  // 3) if so, update password
  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmNewPassword;
  await user.save(); // we cant use (findByIdAndUpdate) reason:- password related and some validators work only saving documents
  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
