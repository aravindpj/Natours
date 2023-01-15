const Booking = require('../Models/bookingModel');
const Tour = require('../Models/tourModel');
const User = require('../Models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async function (req, res) {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  // 2) Build Template
  // 3) Render that template using tour data 1)

  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async function (req, res, next) {
  //1) get the data requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  //  if ther is no data send error
  if (!tour) {
    return next(new AppError('The tour is missing under this name', 404));
  }

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://js.stripe.com/v3/;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://js.stripe.com/v3/ https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});

exports.getAccount = function (req, res, next) {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getLoginForm = function (req, res) {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getMyBookedTours=async function(req,res){
   // Find all booking
   const bookings=await Booking.find({user:req.user.id})

   // Find tours with the returned Id
   const tourIds=bookings.map(el=>el.tour)
   const tours=await Tour.find({_id:{$in:tourIds}})

   res.status(200)
   .render('overview',{
    title: 'All tours',
    tours
   })

}


