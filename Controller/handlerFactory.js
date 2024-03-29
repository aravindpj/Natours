const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeature');
exports.deleteOne = (Model) =>
  catchAsync(async function (req, res, next) {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError('Document not found this ID', 404));

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async function (req, res, next) {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new AppError('Document not found this ID', 404));
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async function (req, res, next) {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

exports.getOne = (Model, popluateOption) =>
  catchAsync(async function (req, res, next) {
    let query = Model.findById(req.params.id);
    if (popluateOption) query = query.populate(popluateOption);

    const doc = await query;

    if (!doc) return next(new AppError('Document not found this ID', 404));
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async function (req, res, next) {
    let filterObj={}
    if(req.params.tourId) filterObj = {tour:req.params.tourId} // for review 
    const feature = new APIFeatures(Model.find(filterObj), req.query)
      .filter()
      .sort()
      .fieldsLimit()
      .pagination();
    //EXECUTE QUERY
    const doc = await feature.query
    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: {
        doc,
      },
    });
  });
