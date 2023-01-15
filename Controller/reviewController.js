const Review = require("../Models/reviewModel");
const catchAsync = require("../utils/catchAsync");

const hanlderFactory=require('./../Controller/handlerFactory')

exports.setTourUserIds=function(req,res,next){
    if(!req.body.tour) req.body.tour=req.params.tourId
    if(!req.body.user) req.body.user=req.user._id
    next()
}

exports.getAllreview=hanlderFactory.getAll(Review)
exports.getReview=hanlderFactory.getOne(Review)
exports.createReview=hanlderFactory.createOne(Review)
exports.updateReview=hanlderFactory.updateOne(Review)
exports.deleteReview=hanlderFactory.deleteOne(Review)