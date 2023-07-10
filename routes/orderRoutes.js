const express = require("express");
const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.get(
  "/me",
  (req, res, next) => {
    req.params.userId = req.user.id;
    next();
  },
  orderController.getAllOrders
);

router
  .route("/")
  .get(authController.restrictTo("admin"), orderController.getAllOrders)
  .post(orderController.createOrder);

router
  .route("/:id")
  .get(orderController.getOrder)
  .patch(authController.restrictTo("admin"), orderController.updateOrder)
  .delete(authController.restrictTo("admin"), orderController.deleteOrder);

module.exports = router;
