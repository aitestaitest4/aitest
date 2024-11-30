const express = require("express");
const router = express.Router();
const {
  createPaymentOrder,
  getOrderDetails,
  webhookHandler,
} = require("../controllers/cashfreePaymentController");

router.post("/create-payment-order", createPaymentOrder);
router.get("/get-order-details/:orderId", getOrderDetails);
router.post("/webhook-handler", webhookHandler);

module.exports = router;
