const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../Models/userModel');
const multer = require('multer');
const hanlderFactory = require('./../Controller/handlerFactory');
const sharp = require('sharp');
//function for exclude unwanted keys
const filterObj = function (obj, ...allowedFields) {
  let newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// get me middleware geting current user acc info
exports.getMe = function (req, res, next) {
  req.params.id = req.user._id;
  next();
};
///////////////////////////UPLOAD PHOTO USING MULTER/////////////////////////////////////////

// const multerStorage=multer.diskStorage({
//     destination:function(req,file,cb){
//         cb(null,'public/img/users')
//     },
//     filename:function(req,file,cb){
//         const extension=file.mimetype.split('/')[1] // mimetype: 'image/jpeg' = ['image','jpeg']
//         cb(null,`user-${req.user._id}-${Date.now()}.${extension}`)
//     }
// })

// multer.memoryStorage() -> The upload happenig to a buffer and no longer directly to the file system.
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

exports.updateUserPhoto = upload.single('photo');
////////////////////////////////////////////////////////////////////////////////

exports.resizeUserPhoto =catchAsync(async function (req, res, next) {
  if (!req.file) return next();
 
  // storing this file to acces in next middleware that is //updateMe 
  req.file.filename=`user-${req.user._id}-${Date.now()}.jpeg`

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    // write file system exact folder
    .toFile(`public/img/users/${req.file.filename}`);

  next()  
});

//this function only for update details of the curent user
exports.updateMe = catchAsync(async function (req, res, next) {
  // 1) return error user try to update password in the router
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        `The route not for password update ! please use /updatePassword`
      )
    );
  }

  //4 filter unwanted in the body
  const filterTheBody = filterObj(req.body, 'name', 'email');
  // if user update any file type
  if (req.file) filterTheBody.photo = req.file.filename;
  console.log(filterTheBody);
  // 3) update user detail
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    filterTheBody,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    updatedUser,
  });
});

//Deactivate current user
exports.deleteMe = catchAsync(async function (req, res, next) {
  await User.findByIdAndUpdate(req.user._id, { activate: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = function (req, res) {
  res.status(200).json({
    status: 'success',
    message: 'The router not defined ! please use /signup',
  });
};

//This is not for updating user password
exports.getAllUsers = hanlderFactory.getAll(User);
exports.createUser=hanlderFactory.createOne(User)
exports.getUser = hanlderFactory.getOne(User);
exports.updateUser = hanlderFactory.updateOne(User);
exports.deleteUser = hanlderFactory.deleteOne(User);
