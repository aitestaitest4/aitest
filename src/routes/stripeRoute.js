const express = require("express");
const router = express.Router();
const {
  createPaymentIntent,
} = require("../controllers/stripePaymentController");
router.route("/create-payment-intent").post(createPaymentIntent);

module.exports = router;
