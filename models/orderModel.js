const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    code: {
      type: Number,
      required: true,
      unique: true,
      default: Math.floor(Math.random() * 10000000),
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Order must belong to a user!"],
      ref: "User",
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Order must contain products!"],
      },
    ],
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
      enum: ["Pending", "Preparing", "Shipped", "Delivered"],
      default: "Pending",
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
    select: "-__v",
  });

  next();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
