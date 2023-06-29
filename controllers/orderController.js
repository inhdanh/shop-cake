const factory = require("./handlerFactory");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const checkProductStock = async (req, res, next) => {};

exports.createOrder = catchAsync(async (req, res, next) => {
  const products = req.body.products;

  if (!products || products.length === 0) {
    return next(new AppError("No products found", 400));
  }

  for (const productId of products) {
    const product = await Product.findById(productId);

    if (!product) {
      return next(new AppError("Product not found!", 400));
    }

    if (product.countInStock <= 0) {
      return next(new AppError("Product is out of stock!", 400));
    }

    product.countInStock -= 1;
    await product.save();
  }

  const order = await Order.create({
    user: req.user.id,
    products: req.body.products,
  });

  res.status(201).json({
    status: "success",
    data: { data: order },
  });
});

exports.updateOrder = catchAsync(async (req, res, next) => {
  const products = req.body.products;
  const previousOrder = await Order.findById(req.params.id);

  if (!previousOrder) {
    return next(new AppError("Order not found!", 400));
  }

  // Calculate the count difference for each product
  const countDifference = {};

  // Calculate the count difference for products to add
  for (const productId of products) {
    const previousProductCount = previousOrder.products.filter(
      (p) => p._id.toString() === productId
    ).length;
    const currentProductCount = products.filter((p) => p === productId).length;
    const difference = currentProductCount - previousProductCount;
    countDifference[productId] = difference;
  }

  // Adjust the countInStock for products
  for (const productId in countDifference) {
    const difference = countDifference[productId];
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (product.countInStock < difference) {
      return res
        .status(400)
        .json({ message: "Insufficient stock for the selected product." });
    }

    // Update the countInStock based on the difference
    product.countInStock -= difference;
    await product.save();
  }

  // Update the order with the new products
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: { data: order },
  });
});

exports.getAllOrders = factory.getAll(Order);
exports.getOrder = factory.getOne(Order);
exports.deleteOrder = factory.deleteOne(Order);
