const express = require('express');
const tourController = require('./../Controller/tourController');
const authController = require('./../Controller/authController');
const reviewController = require('./../Controller/reviewController');
const reviewRouter = require('./reviewRouter');

const router = express.Router();

//param middleware
// router.param('id',tourController.checkId)
//check body midlleware

// send req to rview router
router.use('/:tourId/review', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/monthly-tour/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'guide', 'lead-guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

// Geospatial Queries: Finding Tours Within Radius
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

//. Geospatial Aggregation: Calculating Distances
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)



router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTourImage,
    tourController.resizeTourPhoto,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

//imlementing simple nested route

//THIS NOT GOOD PRACTICE EXAXT SAME CODE IN REVIEW ROUTER WE DONT NEED DUPLICATE CODE
// router
//   .route('/:tourId/review')
//   .post(authController.protect, authController.restrictTo('user'),reviewController.createReview);

module.exports = router;
