const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY)
const catchAsync = require("../utils/catchAsync");
const hanlderFactory = require('./../Controller/handlerFactory');
const AppError = require('../utils/appError');
const Tour=require('./../Models/tourModel');
const Booking = require('../Models/bookingModel');

exports.getCheckoutsession=catchAsync(async function(req,res,next){
     // 1) get currently booked tour
     const tour=await Tour.findById(req.params.tourId)
     
     // 2) create check out session
   const session=await stripe.checkout.sessions.create({
        //information about session
        
        success_url:`${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url:`${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email:req.user.email,
        client_reference_id:req.params.tourId,
        line_items:[
            {
                price_data:{
                    currency:'usd',
                    product_data:{
                        name:`${tour.name} Tour`,
                        description:tour.summary,
                        images:[`https://www.natours.dev/img/tours/${tour.imageCover}`],
                    },
                    unit_amount:tour.price*100,
                },
                quantity:1
            }
        ],
        mode:'payment'
     })
     // 3) create session as a response
     res.status(200)
     .json({
        status:'success',
        session
     })

})

exports.createBookingCheckOut=async function(req,res,next){
    const {tour,user,price}=req.query
    if(!tour && !user && !price) return next()
    await Booking.create({tour,user,price})
    res.redirect(req.originalUrl.split('?')[0])
    next()
}

////////////////////////////////////////////////////

exports.getAllbookings=hanlderFactory.getAll(Booking)
exports.getBooking=hanlderFactory.getOne(Booking)
exports.createBooking=hanlderFactory.createOne(Booking)
exports.updateBooking=hanlderFactory.updateOne(Booking)
exports.deleteBooking=hanlderFactory.deleteOne(Booking)