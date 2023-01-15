const Tour = require('./../Models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const hanlderFactory = require('./../Controller/handlerFactory');
const AppError = require('../utils/appError');
const multer = require('multer');
const sharp = require('sharp');


const multerStorage = multer.memoryStorage();

const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload image', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.updateTourImage = upload.fields([
  {name:'imageCover',maxCount:1},
  {name:'images',maxCount:3}
]);

exports.resizeTourPhoto=catchAsync(async function(req,res,next){
  if(!req.files.imageCover || !req.files.images) return next()
    console.log(req.files)
   // resize imageCover and store to public folder
   req.body.imageCover=`tour-${req.params.id}-${Date.now()}-cover.jpeg`
   await sharp(req.files.imageCover[0].buffer)
    .resize(2000,1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`)
 // resize images and stor public folder
  req.body.images=[]
  await Promise.all(req.files.images.map(async (file,i)=>{
     let image=`tour-${req.params.id}-${Date.now()}-${i+1}.jpeg` 
     await sharp(file.buffer)
     .resize(2000,1333)
     .toFormat('jpeg')
     .jpeg({ quality: 90 })
     .toFile(`public/img/tours/${image}`)
      // push files to the images array one by one
      req.body.images.push(image)
  }))  
  next()
})

exports.aliasTopTours = function (req, res, next) {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.checkBody = function (req, res, next) {
  const { name, price } = req.body;
  if (!name || !price)
    return res.status(404).json({
      status: 'fail',
      message: `${!name ? 'name field required ' : 'price field required'}  `,
    });
  next();
};

//NEW (USING HANDLER)
exports.getAllTours = hanlderFactory.getAll(Tour);
exports.getTour = hanlderFactory.getOne(Tour, { path: 'reviews' });
exports.createTour = hanlderFactory.createOne(Tour);
exports.updateTour = hanlderFactory.updateOne(Tour);
exports.deleteTour = hanlderFactory.deleteOne(Tour);

//get tour stats
exports.getTourStats = catchAsync(async function (req, res, next) {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$ratingsAverage',
        numTours: { $sum: 1 },
        avgRatings: { $avg: '$ratingsAverage' },
        numRatings: { $sum: '$ratingsQuantity' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { _id: -1 },
    },
    // {
    //    $match:{_id:{$ne:'EASY'}}
    // }
  ]);

  res.status(200).json({
    result: stats.length,
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async function (req, res, next) {
  const year = Number(req.params.year);

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', //split every document into one
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      }, //startdates : => selecting field
    },
    {
      $group: {
        _id: { $month: '$startDates' }, //specifying id in month
        numOfTours: { $sum: 1 }, // counting num of tours each month
        tours: { $push: '$name' }, // each month started tour names
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: { _id: 0 }, //hide detail
    },
    {
      $sort: { month: 1 }, // sorting by month
    },
    {
      $limit: 12, //we can limit the result to show
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: plan,
  });
});

// Geospatial Queries: Finding Tours Within Radius
//'/tours-within/:distance/center/:latlng/unit/:unit'
//'/tours-within/:233/center/34.040554, -118.276215/unit/mi'
exports.getToursWithin = catchAsync(async function (req, res, next) {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(
      new AppError(`Please provide latitude and longitude in the formart `, 400)
    );
  }
  
  const tours = await Tour.find({
    //In Los angles if you specify a distance 250 miles then that means  you want to find all tour document
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat],radius] } },
  });
  res.status(200)
  .json({
    status:"success",
    result:tours.length,
    data:{
      data:tours
    }
  })

});


// -- /distances/:latlng/unit/:unit
exports.getDistances=catchAsync(async function(req,res,next){
  const {latlng,unit}=req.params
  const [lat,lng]=latlng.split(',')

  let multiplier= unit ==='mi'? 0.000621371 : 0.001

  if(!lat || !lng) {
    return next(new AppError(`Please provide latitude and longitude in format`,400))
  }
  const distaces=await Tour.aggregate([
    {
      $geoNear:{
        near:{
          type:'Point',
          coordinates:[lng*1,lat*1]
        },
        distanceField:'distance', // adding new field
        distanceMultiplier:multiplier
      }
    },
    {
      $project:{
        distance:1,
        name:1
      }
    }
  ])

  res.status(200)
  .json({
    status:"success",
    data:{
      data:distaces
    }
  }) 
})