const factory = require("./handlerFactory");
const Order = require("../models/orderModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const _ = require("lodash");

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

exports.updateOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("No document found with that ID", 404));
  }

  if (order.status === "Delivered") {
    return next(
      new AppError(
        "You cannot change the order once it has been delivered!",
        400
      )
    );
  }

  order.products = req.body.products;
  order.shippingAddress = req.body.shippingAddress;
  order.paymentMethod = req.body.paymentMethod;
  order.status = req.body.status;
  order.shippingPrice = req.body.shippingPrice;
  await order.save();

  res.status(200).json({
    status: "success",
    data: { data: order },
  });
});
exports.getAllOrders = factory.getAll(Order);
exports.getOrder = factory.getOne(Order);
exports.deleteOrder = factory.deleteOne(Order);
