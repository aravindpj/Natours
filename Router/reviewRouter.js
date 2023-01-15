const express = require('express');

// mergeParams does we need to get params other router we need to use this technique
const router = express.Router({ mergeParams: true });

const authController = require('./../Controller/authController');
const reviewController = require('./../Controller/reviewController');

//POST tour/tourId/reviews
//GET tour/tourId/reviews
//POST tour/tourId/reviews

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllreview)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('admin', 'user'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('admin', 'user'),
    reviewController.deleteReview
  );

module.exports = router;
