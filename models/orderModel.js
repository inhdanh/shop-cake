const mongoose = require("mongoose");
const Product = require("./productModel");
const AppError = require("../utils/appError");
const _ = require("lodash");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Order must belong to a user!"],
      ref: "User",
    },
    products: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      ],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "Order must contain at least one product!",
      },
    },
    shippingAddress: String,
    paymentMethod: {
      type: String,
      required: [true, "Order must have a payment method!"],
      enum: ["Bank Transfer", "Cash"],
      default: "Cash",
    },
    status: {
      type: String,
      required: true,
      enum: ["Cancelled", "Preparing", "Delivered"],
      default: "Preparing",
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

orderSchema.virtual("totalPrice").get(function () {
  return this.products.reduce((total, product) => total + product.price, 0);
});

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "-__v",
  }).populate({
    path: "products",
    select: "-__v -countInStock",
  });

  next();
});

orderSchema.methods.getDifferentProducts = function (newProductsObj) {
  const difference = {};

  // Find the difference between oldProducts and newProducts
  for (let key in this.currentProductsObj) {
    difference[key] = (newProductsObj[key] || 0) - this.currentProductsObj[key];
  }

  // Add the new products to the difference object
  for (let key in newProductsObj) {
    if (!(key in this.currentProductsObj)) {
      difference[key] = newProductsObj[key];
    }
  }
  return difference;
};

orderSchema.pre("save", async function (next) {
  const productIds = this.products.map((p) => p._id.toString());
  const productsObj = _.countBy(productIds);

  this.currentProductsObj = {};
  for (const productId in productsObj) {
    this.currentProductsObj[productId] = 0;
  }

  if (!this.isNew) {
    const order = await Order.findById(this._id);
    this.currentProductsObj = _.countBy(order.products.map((p) => p._id));
  }

  this.differenceProducts = this.getDifferentProducts(productsObj);

  for (const productId in this.differenceProducts) {
    if (this.differenceProducts[productId] > 0) {
      const product = await Product.findById(productId);

      if (
        product.countInStock + this.currentProductsObj[productId] <
        productsObj[productId]
      ) {
        return next(
          new AppError(`Product ${product.name} is out of stock!`, 400)
        );
      }
    }
  }

  next();
});

orderSchema.post("save", async function () {
  for (const productId in this.differenceProducts) {
    const product = await Product.findById(productId);
    product.countInStock -= this.differenceProducts[productId];
    await product.save();
  }
});

orderSchema.pre("findOneAndDelete", async function (next) {
  this.orderDelete = await this.model.findOne(this.getQuery());

  if (!this.orderDelete) {
    return next(new AppError("No document found with that ID", 404));
  }

  if (this.orderDelete.status === "Delivered") {
    return next(
      new AppError(
        "You cannot delete the order once it has been delivered!",
        400
      )
    );
  }

  next();
});

orderSchema.post("findOneAndDelete", async function () {
  const productsObj = _.countBy(this.orderDelete.products.map((p) => p._id));
  for (const productId in productsObj) {
    const product = await Product.findById(productId);
    product.countInStock += productsObj[productId];
    await product.save();
  }
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
