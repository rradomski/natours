const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./../controllers/handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) return next(
    new AppError('Cannot update password here. Use /updateMyPassword instead', 400));

  // console.log(req.body);
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.image = req.file.filename;
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findOneAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.createUser = catchAsync(async (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: 'Route not defined. Use /signup instead.'
  });
});
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  }
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Uploaded file is not an image', 400), false);
  }
};

const upload = multer({
  // storage: multerStorage,
  storage: multer.memoryStorage(),
  fileFilter: multerFilter
});

exports.uploadImage = upload.single('image');
exports.processUserImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 95 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});
