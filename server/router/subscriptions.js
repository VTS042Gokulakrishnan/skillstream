const express = require("express");
const router = express.Router();
const {
  updateSubscription,
  createCheckoutSession,
  webhook,
  getTransactions,
  cancelSubscription,
  UScreateCheckoutSession,
  getPlanDetails,
  // verifyAndCreateSubscription,
} = require("../controller/subscription");
const { Authorization } = require("../middleware/auth");

router.post("/new/:userId", updateSubscription);
router.post("/create/checkout-session", createCheckoutSession);
router.post("/US/create/checkout-session", UScreateCheckoutSession);

router.post("/verify/webhook", webhook);
router.get("/get/transaction", getTransactions);
router.get("/get/plan", getPlanDetails);

router.get("/cancel/subscriptions", cancelSubscription);

module.exports = router;
