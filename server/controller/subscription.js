const employerModel = require("../models/employerModel");
const candiadteModel = require("../models/candidateModel");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const USStripe = require("stripe")(process.env.USSTRIPE_API_KEY);
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = "https://api-m.paypal.com";
const axios = require("axios");
const qs = require("qs");
// const Razorpay = require("razorpay");
// var razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEYID,
//   key_secret: process.env.RAZORPAY_SECRETKEY,
// });
const timestamp = Math.floor(Date.now() / 1000);
const controller = {
  async updateSubscription(req, res) {
    try {
      const { userId } = req.params;
      const { plan } = req.body;
      console.log("hi");
      const updateDetails = await employerModel.updateOne(
        { userId },
        { $set: { plan: plan, subscribed: true, access: "Admin" } }
      );
      // console.log(updateDetails);
      res
        .status(200)
        .json({ message: "Subscribed Successfully", status: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error", status: false });
    }
  },

  async createCheckoutSession(req, res) {
    try {
      const { plan, amount, userId, product, priceId, role, period } = req.body;
      console.log("body", req.body);
      if (role === "Employer") {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "subscription",
          line_items: [
            {
              price: priceId, // Use price ID for the recurring plan
              quantity: 1,
            },
          ],
          success_url: `${process.env.client}/pricing/success?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.client}/pricing/cancel`,
          metadata: {
            userId: userId,
            plan: plan,
            role: role,
            period: period,
          },
        });
        console.log(session);
        res.json({ id: session.id, session: session });
      } else if (role === "Candidate") {
        return res.status(410).json({ message: "Please purchase a plan from Practice Assessment." });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  },
  async UScreateCheckoutSession(req, res) {
    try {
      if (req.user?.role !== "Employer") return res.status(403).json({ message: "Employer account required." });
      if (require("../services/employerBilling").billingRestricted(req.user)) return res.status(403).json({ message: "Billing is managed by your organization." });
      if (req.body.period !== "monthly") return res.status(400).json({ message: "This billing period is not available." });
      const priceId = process.env.STRIPE_EMPLOYER_MONTHLY_PRICE_ID || "price_1PdWn2P218aRnkr8eMEL98xa";
      const price = await USStripe.prices.retrieve(priceId);
      if (!price.active || price.currency !== "usd" || price.unit_amount !== 24900 || price.recurring?.interval !== "month" || price.recurring?.interval_count !== 1) return res.status(503).json({ message: "This plan is not available for checkout." });
      const base = (process.env.client || "https://skillstreamjobs.us").replace(/\/$/, "");
      const session = await USStripe.checkout.sessions.create({
        payment_method_types: ["card"], mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: base + "/pricing/success?plan=Recommended%20(Monthly)&session_id={CHECKOUT_SESSION_ID}",
        cancel_url: base + "/pricing/cancel",
        metadata: { userId: req.user.userId, plan: "Recommended (Monthly)", role: "Employer", period: "monthly" }
      });
      res.json({ id: session.id });
    } catch (error) {
      res.status(503).json({ message: "Checkout could not start. Please try again or contact support." });
    }
  },
  async webhook(req, res) {
    try {
      const { data } = req.body;
      const { type } = req.body;

      console.log(type);
      const session = data.object;

      if (type === "checkout.session.completed") {
        const userId = session.metadata.userId; // Extract user ID from metadata       // Save Customer ID and Subscription ID in your database
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const plan = session.metadata.plan;
        const role = session.metadata.role;
        const payload = {
          customerId,
          subscriptionId,
          userId,
          plan,
        };
        console.log(payload);

        // console.log("Subscription ID:", subscriptionId);
        // console.log("User ID:", userId);
        if (role === "Candidate") {
          // Old candidate purchases must never reset paid balances.
          return res.status(200).send("Legacy candidate checkout retired");
        } else if (role === "Employer") {
          const now = new Date();
          const period = session.metadata.period;

          let subscriptionEnds;
          if (period === "Monthly") {
            subscriptionEnds = new Date(now);
            subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1);
          }

          if (period === "Yearly") {
            subscriptionEnds = new Date(now);
            subscriptionEnds.setFullYear(subscriptionEnds.getFullYear() + 1);
          }
          const updateDetails = await employerModel.updateOne(
            { userId },
            {
              $set: {
                plan: plan,
                stripeCustomerId: customerId,
                subscribed: true,
                subscriptionStart: now,
                subscriptionDate: new Date(),
                stripeSubscriptionId: subscriptionId,
                subscriptionEnds,
                subReminder7: false,
                subReminder3: false ,
                subReminder1: false,
                subExpired: false,
                // access: "Admin",
              },
            }
          );
          console.log(updateDetails);
        }

        res.status(200).send("Success");
      } else {
        // console.log("Invalid event");
        res.status(400).send("Invalid event");
      }
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  // async webhook(req, res) {
  //   try {
  //     // const sig = req.headers["stripe-signature"];
  //     // console.log("header", sig);
  //     // console.log("body", req.body);
  //     const { data } = req.body;
  //     if ((data.type === "checkout.session.completed")) {
  //       // console.log(req.body);
  //       const userId = session.metadata.userId;
  //       console.log("User ID:", userId);

  //       console.log("Customer ID:", data.object.customer);
  //       console.log("Subscription ID:", data.object.subscription);
  //       res.status(200).send("Success");
  //     } else {
  //       console.log("Inavalid event");
  //     }

  //     // const payloadString = JSON.stringify(req.body, null, 2);
  //     // const secret = "whsec_UTRA4QqeBz8MffFfybeeplCtBHdE6cA6";
  //     // let event = stripe.webhooks.constructEvent(payloadString, sig, secret);

  //     // // Handle the event
  //     // if (event.type === "checkout.session.completed") {
  //     //   const session = event.data.object;
  //     //   console.log(session);

  //     //   // Retrieve customer ID and subscription ID
  //     //   const customerId = session.customer;
  //     //   const subscriptionId = session.subscription;

  //     //   console.log("Customer ID:", customerId);
  //     //   console.log("Subscription ID:", subscriptionId);

  //     //   // await saveSubscriptionToDatabase({
  //     //   //   userId: session.metadata.userId, // if you include userId in metadata
  //     //   //   customerId,
  //     //   //   subscriptionId,
  //     //   // });

  //     //   res.status(200).send("Success");
  //     // } else {
  //     //   console.warn(`Unhandled event type ${event.type}`);
  //     // }
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).json({ mesaage: "Internal server error", status: false });
  //   }
  // },
  async getTransactions(req, res) {
    try {
      const { customerId } = req.query;
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit: 10,
      });
      res.json({ success: true, transactions: invoices.data });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error", status: false });
    }
  },
  async getPlanDetails(req, res) {
    try {
      const { customerId } = req.query;
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 1,
      });
      console.log(subscriptions);
      if (subscriptions.data.length === 0) {
        return res.json({ plan: null });
      }
      const plan = subscriptions.data[0];
      res.json({ plan: { name: plan.plan.nickname, subscriptionId: plan.id } });
    } catch (error) {
      console.error("Error fetching plan details", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
  async cancelSubscription(req, res) {
    try {
      const { subscriptionId } = req.query;
      // Update the subscription to cancel at period end
      const updatedSubscription = await stripe.subscriptions.update(
        subscriptionId,
        {
          cancel_at_period_end: true,
        }
      );

      res.json({
        success: true,
        subscription: updatedSubscription,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error", status: false });
    }
  },
};
module.exports = controller;

//stripe
// async createCheckoutSession(req, res) {
//   try {
//     const { plan, amount, userId, product, priceId } = req.body;
//     console.log(req.body);
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "subscription",
//       line_items: [
//         {
//           price: priceId, // Use price ID for the recurring plan
//           quantity: 1,
//         },
//       ],
//       success_url: `${process.env.client}/pricing/success?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.client}/pricing/cancel`,
//       // metadata: {
//       //   userId: userId,
//       //   plan: plan,
//       // },
//     });

//     res.json({ id: session.id });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: error.message });
//   }
// },

// paypal
//  async createCheckoutSession(req, res) {
//   try {
//     const { plan, amount, userId, product, priceId } = req.body;
//     console.log(req.body);

//     // Step 1: Get PayPal Access Token
//     const accessToken = await getPayPalAccessToken();

//     // Step 2: Create PayPal Subscription
//     const subscriptionResponse = await axios({
//       url: `${PAYPAL_API_BASE}/v1/billing/subscriptions`,
//       method: "post",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${accessToken}`,
//       },
//       data: {
//         plan_id: priceId,
//         subscriber: {
//           name: {
//             given_name: "FooBuyer",
//             surname: "Jones",
//           },
//           email_address: "foobuyer@example.com",
//           shipping_address: {
//             name: {
//               full_name: "John Doe",
//             },
//             address: {
//               address_line_1: "2211 N First Street",
//               address_line_2: "Building 17",
//               admin_area_2: "San Jose",
//               admin_area_1: "CA",
//               postal_code: "95131",
//               country_code: "US",
//             },
//           },
//         }, // This is the plan ID from PayPal
//         application_context: {
//           brand_name: "SkillStream AI",
//           user_action: "SUBSCRIBE_NOW",
//           payment_method: {
//             payer_selected: "PAYPAL", // Restrict to PayPal as the payment method
//             payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
//           },
//           return_url: `${process.env.client}/pricing/success`,

//           cancel_url: `${process.env.client}/pricing/cancel`,
//         },
//       },
//     });

//     // Step 3: Send the approval link to the client
//     const approvalLink = subscriptionResponse.data.links.find(
//       (link) => link.rel === "approve"
//     ).href;

//     res.json({ data: subscriptionResponse.data, approval_url: approvalLink });
//   } catch (error) {
//     console.log(
//       "Error creating PayPal subscription:",
//       error.response?.data || error.message
//     );
//     res.status(500).json({ error: error.message });
//   }
// },
// async function getPayPalAccessToken() {
//   try {
//     const response = await axios({
//       url: `${PAYPAL_API_BASE}/v1/oauth2/token`,
//       method: "post",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//         Authorization: `Basic ${Buffer.from(
//           `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
//         ).toString("base64")}`,
//       },
//       data: "grant_type=client_credentials",
//     });
//     return response.data.access_token;
//   } catch (error) {
//     console.log("Error getting access token:", error);
//     throw error;
//   }
// }
// async createCheckoutSession(req, res) {
//   try {
//     const { plan, amount, userId, product, planId, customer_email } =
//       req.body;
//     console.log(req.body);
//     // const customer = await razorpay.customers.create({
//     //   email: customer_email,
//     // });
//     const subscription = await razorpay.subscriptions.create({
//       plan_id: planId, // Subscription plan ID from Razorpay
//       customer_notify: 1,
//       total_count: 12, // For monthly payments, 12 for a year
//       // customer_id: customer.id,
//     });
//     res.json({
//       id: subscription.id,
//       subscription,
//     });
//   } catch (error) {
//     console.log("Error creating PayPal subscription:", error);
//     res.status(500).json({ error: error.message });
//   }
// },
// async createCheckoutSession(req, res) {
//   try {
//     const { amount, customer_email } = req.body;

//     // Step 1: Create an order for payment
//     const order = await razorpay.orders.create({
//       amount: amount, // Amount in paisa (e.g., 1000 => ₹10)
//       currency: "INR",
//       receipt: "receipt#1", // Can be a unique identifier for your order
//     });

//     // Return order details to the frontend
//     res.json({
//       orderId: order.id,
//       amount: order.amount,
//       currency: order.currency,
//       // key: process.env.RAZORPAY_KEY_ID, // Razorpay public key for frontend
//     });
//   } catch (error) {
//     console.log("Error creating Razorpay order:", error);
//     res.status(500).json({ error: error.message });
//   }
// },
// Verify the payment signature
// const generated_signature = razorpay.utils.getSignature(
//   razorpay_order_id + "|" + razorpay_payment_id,
//   process.env.RAZORPAY_KEY_SECRET
// );

// if (generated_signature !== razorpay_signature) {
//   return res.status(400).json({ error: 'Invalid signature' });
// }

// Step 2: Verify payment and create subscription
// async verifyAndCreateSubscription(req, res) {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       planId,
//       customer_email,
//     } = req.body;

//     // Step 3: Create customer and subscription after successful payment
//     const customer = await razorpay.customers.create({
//       email: customer_email,
//     });

//     const subscription = await razorpay.subscriptions.create({
//       plan_id: planId, // Subscription plan ID from Razorpay
//       customer_notify: 1,
//       total_count: 12, // Monthly payments for 1 year
//       customer_id: customer.id,
//     });

//     res.json({
//       id: subscription.id,
//       subscription,
//     });
//   } catch (error) {
//     console.log("Error verifying payment or creating subscription:", error);
//     res.status(500).json({ error: error.message });
//   }
// },
