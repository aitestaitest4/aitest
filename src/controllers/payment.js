const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create payment order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      data: {
        order_id: order.id,
        currency: order.currency,
        amount: order.amount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating payment order",
      error: error.message,
    });
  }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is successful
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message,
    });
  }
};

// Process UPI payment
exports.processUpiPayment = async (req, res) => {
  try {
    const { vpa, amount, currency = "INR" } = req.body;

    const paymentData = {
      amount: amount * 100,
      currency,
      method: "upi",
      vpa,
      description: "UPI Payment",
    };

    const payment = await razorpay.paymentLink.create({
      ...paymentData,
      accept_partial: false,
      expire_by: Math.floor(Date.now() / 1000) + 3600, // Link expires in 1 hour
      notify: {
        sms: true,
        email: true,
      },
    });

    res.json({
      success: true,
      data: {
        payment_link: payment.short_url,
        payment_id: payment.id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing UPI payment",
      error: error.message,
    });
  }
};

// Get payment details
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await razorpay.payments.fetch(paymentId);

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching payment details",
      error: error.message,
    });
  }
};

// Refund payment
exports.refundPayment = async (req, res) => {
  try {
    const { paymentId, amount } = req.body;

    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100,
    });

    res.json({
      success: true,
      data: refund,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing refund",
      error: error.message,
    });
  }
};
