const sharp = require("sharp");
const factory = require("./handlerFactory");
const Product = require("../models/productModel");
const uploadController = require("../controllers/uploadController");
const catchAsync = require("../utils/catchAsync");
const { toLowerCaseSlug } = require("../utils/slug");
const AppError = require("../utils/appError");

exports.uploadProductImages = uploadController.upload.array("images", 5);

exports.resizeProductImages = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  req.files = req.files.map((file, index) => {
    return {
      ...file,
      filename: `${toLowerCaseSlug(req.body.name)}-${index + 1}.jpeg`,
    };
  });

  for (const file of req.files) {
    await sharp(file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/products/${file.filename}`);
  }

  next();
});

exports.createProduct = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0)
    return next(new AppError("No images were uploaded", 400));

  req.body.images = req.files.map((file) => file.filename);

  const doc = await Product.create(req.body);

  res.status(201).json({
    status: "success",
    data: { data: doc },
  });
});
exports.getProduct = factory.getOne(Product);
exports.getAllProducts = factory.getAll(Product);
exports.updateProduct = factory.updateOne(Product);
exports.deleteProduct = factory.deleteOne(Product);
