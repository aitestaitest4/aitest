const { Cashfree } = require("cashfree-pg");

// Initialize Cashfree configuration for production
Cashfree.XClientId = process.env.CASH_FREE_API_ID;
Cashfree.XClientSecret = process.env.CASH_FREE_API_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

// Create payment order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount, customerId, customerPhone } = req.body;

    // Validate required fields
    if (!amount || !customerId || !customerPhone) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Ensure FRONTEND_URL is defined
    if (!process.env.FRONTEND_URL) {
      return res.status(500).json({
        success: false,
        message: "Frontend URL configuration missing",
      });
    }

    // Ensure return URL has proper protocol and formatting
    const returnUrl = new URL("/payment/status", process.env.FRONTEND_URL);
    returnUrl.searchParams.set("order_id", "{order_id}");

    const request = {
      order_amount: amount,
      order_currency: "INR",
      order_id: `order_${Date.now()}`,
      customer_details: {
        customer_id: customerId,
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: returnUrl.toString(),
      },
    };

    // Create order in Cashfree using 2023-08-01 API version
    const response = await Cashfree.PGCreateOrder("2023-08-01", request);

    // Return payment session details to frontend
    res.json({
      success: true,
      data: {
        ...response.data,
        payment_session_id: response.data.payment_session_id,
        order_status: response.data.order_status,
        payments_url: response.data.payments?.url,
      },
    });
  } catch (error) {
    console.error("Cashfree payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment order",
      error: error.response?.data?.message || error.message,
    });
  }
};

// Fetch order details
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const response = await Cashfree.PGFetchOrder("2022-09-01", orderId);

    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching order details",
      error: error.response?.data?.message || error.message,
    });
  }
};

// Verify webhook signature and process payment status
exports.webhookHandler = async (req, res) => {
  try {
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];

    const isValid = Cashfree.PGVerifyWebhookSignature(
      signature,
      req.rawBody,
      timestamp
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const webhookData = req.body;

    // Handle different payment statuses
    switch (webhookData.data.order_status) {
      case "PAID":
        // Payment successful - update your database
        console.log("Payment successful for order:", webhookData.data.order_id);
        break;
      case "FAILED":
        // Payment failed - handle accordingly
        console.log("Payment failed for order:", webhookData.data.order_id);
        break;
      default:
        console.log("Order status:", webhookData.data.order_status);
    }

    res.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing webhook",
      error: error.message,
    });
  }
};
