require("dotenv").config();
const stripe = require("stripe")(process.env.SECRET_KEY);
const { createResponse } = require("../services/responseService");

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    // Create a Payment Intent with the specified amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // amount in smallest currency unit (cents)
      currency, // e.g., 'usd', 'inr'
      payment_method_types: ["card"],
    });

    return res.status(200).json(
      createResponse(200, "Payment intent created successfully", {
        clientSecret: paymentIntent.client_secret,
      })
    );
  } catch (error) {
    console.error("Payment intent error:", error);
    return res.status(500).json(createResponse(500, error.message));
  }
};

exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle successful payment intent
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      console.log("Payment Intent was successful!");
      // Add any additional payment success logic here
    }

    return res.status(200).json(
      createResponse(200, "Webhook received", {
        received: true,
      })
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return res
      .status(400)
      .json(createResponse(400, `Webhook Error: ${error.message}`));
  }
};
