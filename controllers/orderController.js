const factory = require("./handlerFactory");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createOrder = catchAsync(async (req, res, next) => {
  const order = await Order.create({
    user: req.user.id,
    ...req.body,
  });

  res.status(201).json({
    status: "success",
    data: { data: order },
  });
});

exports.updateOrder = factory.updateOne(Order);
exports.getAllOrders = factory.getAll(Order);
exports.getOrder = factory.getOne(Order);
exports.deleteOrder = factory.deleteOne(Order);
