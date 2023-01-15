const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, `A tour contain name must be require`],
      unique: true,
      trim: true,
      minlength:[10,'A tour must be more or eqaul 10 characters'],
      maxlength:[40,'A tour must be less or eqaul 40 characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum:{
        values:['easy','medium','difficult'],
        message:`Difficutly is either: easy ,medium ,difficulty`
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min:[1, 'Rating must be above 1.0'],
      max:[5, 'Rating must be below 5.0'],
      set:val=>Math.round(val*10)/10 //4.6666666   / 47 / 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, `A tour contain price must be require`],
    },
    priceDiscount:{
        type:Number,
        // custom validator
        validate:{
            validator:function(val){
                //this only points to current doc on new document creation
                return val<this.price
            },
            message:'Discount price should be below price'
        }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour:{
        type:Boolean,
        default:false
      },
      //nested object (embeded)
    startLocation:{
      //GeoJSON
      type:{
        type:String,
        enum:['Point'],
        default:'Point'
      },
      coordinates:[Number],
      address:String,
      description:String
    },
    locations:[
      {
        type:{
           type:String,
           default:'Point',
           enum:['Point']
        },
        coordinates:[Number],
        address:String,
        day:Number,
        description:String
      }
    ],
    // child ref
    guides:[
      {
        type:mongoose.Schema.ObjectId,
        ref:'User'
      }
    ],  
  },
  {
    //this object is used to display virtal propertys
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//CREATE VIRTUAL FIELDS
tourSchema.virtual('durationWeeks').get(function () {
  // this filed not in the data base
  return this.duration / 7;
});

tourSchema.virtual('reviews',{
  ref:'Review',
  foreignField:'tour',
  localField:'_id'
})

//  index method:- its help to efficient document reading perfomance
// bcz its avoid unique _id to read documents. without indexing ,The query using a ubnique  _id to read all doc 
//summary:-> we build big application and its a millions of documents Index method  is useful 
tourSchema.index({price:1,ratingsAverage:-1})
tourSchema.index({slug:1})
tourSchema.index({startLocation:'2dsphere'})

//DOCUMNET MIDDLEWARE or HOOKS : before run save() and create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//embeded by user id 
// tourSchema.pre('save',async function(next){
//   const guidesPromis= this.guides.map(async id=> await User.findById(id))
//   this.guides=await Promise.all(guidesPromis)
//   next()
// })

//QUERY MIDDLEWARE 
tourSchema.pre(/^find/,function(next){
    this.find({secretTour:{$ne:true}})
    next()
})

tourSchema.pre(/^find/,function(next){
  this.populate({
    path:'guides',
    select:'-__v'
  })
  next()
})

//AGGREGATION MIDDLEWARE   //  COMMENTING GEO NEAR VALIDATION ERROR BUG
// tourSchema.pre('aggregate',function(next){ 
//     this.pipeline().unshift({$match:{secretTour:{$ne:true}}})
//     next()
// })

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
