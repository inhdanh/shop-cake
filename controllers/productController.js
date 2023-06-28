const factory = require("./handlerFactory");
const Product = require("../models/productModel");

exports.createProduct = factory.createOne(Product);
exports.getProduct = factory.getOne(Product);
exports.getAllProducts = factory.getAll(Product);
exports.updateProduct = factory.updateOne(Product);
exports.deleteProduct = factory.deleteOne(Product);
