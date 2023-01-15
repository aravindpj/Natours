const express = require('express');
const app = require('../App');
const router = express.Router();
const authController = require('./../Controller/authController');
const bookingController = require('./../Controller/bookingController');

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutsession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getBooking)
  .post(bookingController.createBooking);
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);
module.exports = router;
