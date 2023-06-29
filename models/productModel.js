const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A product must have a name"],
    trim: true,
    unique: true,
  },
  description: String,
  slug: String,
  price: {
    type: Number,
    required: [true, "A product must have a price"],
    min: [0, "Price cannot be negative"],
  },
  image: String,
  images: [String],
  countInStock: {
    type: Number,
    required: true,
    min: 0,
    default: 5,
  },
});

productSchema.index({ slug: 1 });

productSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
