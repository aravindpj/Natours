const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not empty'],
    },
    rating: {
      type: Number,
      min: [1, 'rating must be above 1.0'],
      max: [5, 'rating must be below 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    //PARENT REFRENCE
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong a user'],
    },
  },
  {
    //this object is used to display virtal propertys
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


// allow one user can review a tour
reviewSchema.index({tour:1,user:1},{unique:true})

reviewSchema.pre(/^find/,function(next){
  // this.populate({
  //   path:'tour',
  //   select:'name' 
  // }).populate({
  //   path:'user',
  //   select:'name'
  // })
  this.populate({
    path:'user',
    select:'name photo'
  })
  next()
})

// Calculating Average Rating on Tours - Part 1
reviewSchema.statics.calcAverageRatings=async function(tourId){
  const stats=await this.aggregate([
    {
      $match:{tour:tourId}
    },
    {
      $group:{
        _id:'$tour',
        numRating:{$sum:1},
        avgRating:{$avg:'$rating'}
      }
    }
  ])
  console.log(stats);
  // update current tour review rating avg and quantity
  if(stats.length>0){
    await Tour.findByIdAndUpdate(tourId,{
      ratingsQuantinty:stats[0].numRating,
      ratingsAverage:stats[0].avgRating
    })
  }else{
    await Tour.findByIdAndUpdate(tourId,{
      ratingsQuantinty:0,
      ratingsAverage:4.5
    })
  }

}



reviewSchema.post('save',function(){
  //Point to current review 
  this.constructor.calcAverageRatings(this.tour)
})

// Calculating Average Rating on Tours - Part 1
reviewSchema.pre(/^findOneAnd/,async function(){
   this.r=await this.findOne()
})

reviewSchema.post(/^findOneAnd/,async function(){
  //this.findOne() not work on this post 
  await this.r.constructor.calcAverageRatings(this.r.tour)
})


const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
