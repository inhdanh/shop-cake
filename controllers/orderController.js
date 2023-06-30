const factory = require("./handlerFactory");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createOrder = catchAsync(async (req, res, next) => {
  // req.body.products.forEach(async (productId) => {
  //   const product = await Product.findById(productId);

  //   if (product.countInStock <= 0) {
  //     return next(new AppError("Product is out of stock", 400));
  //   }
  // });

  const order = await Order.create({
    user: req.user.id,
    ...req.body,
  });

  // req.body.products.forEach(async (productId) => {
  //   const product = await Product.findById(productId);

  //   if (product) {
  //     product.countInStock -= 1;
  //     await product.save();
  //   }
  // });

  res.status(201).json({
    status: "success",
    data: { data: order },
  });
});

exports.updateOrder = factory.updateOne(Order);
exports.getAllOrders = factory.getAll(Order);
exports.getOrder = factory.getOne(Order);
exports.deleteOrder = factory.deleteOne(Order);
