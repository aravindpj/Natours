const express = require('express');
const authController = require('./../Controller/authController');
const viewController = require('./../Controller/viewController');
const bookingController = require('./../Controller/bookingController');

const router = express.Router();

router.get(
  '/',
  bookingController.createBookingCheckOut,
  authController.isLoggedin,
  viewController.getOverview
);

router.get('/tour/:slug', authController.isLoggedin, viewController.getTour);

// render loginpage
router.get('/login', authController.isLoggedin, viewController.getLoginForm);

router.get('/me', authController.protect, viewController.getAccount);

router.get('/my-tours',authController.protect,viewController.getMyBookedTours)
// router.post('/submit-user-data',authController.protect,viewController.updateUser)
module.exports = router;
