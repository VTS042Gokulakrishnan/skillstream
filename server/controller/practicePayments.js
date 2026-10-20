const Candidate = require("../models/candidateModel");
const { plans, access } = require("../services/practicePlans");
const billing = require("../services/practiceBilling");
const sessions = require("../services/practiceSessions");

exports.candidateOnly = (req, res, next) => {
  if (req.user?.role !== "Candidate") return res.sendStatus(403);
  next();
};
exports.ownerOnly = (req, res, next) => {
  if (req.params.userId && req.params.userId !== req.user.userId) return res.sendStatus(403);
  next();
};
exports.status = async (req, res, next) => {
  try {
    await sessions.expirePending(req.user._id);
    const candidate = await Candidate.findById(req.user._id).lean();
    res.json({ access: access(candidate), plans: Object.entries(plans).map(([id, plan]) => ({
      id, name: plan.name, amount: plan.amount, description: plan.description,
      available: /^price_/.test(process.env[plan.env] || "") && !!process.env.STRIPE_PRACTICE_WEBHOOK_SECRET,
    })) });
  } catch (error) { next(error); }
};
exports.checkout = async (req, res, next) => {
  try {
    const plan = plans[req.body.planId];
    if (!plan) return res.status(400).json({ message: "Choose a valid practice plan." });
    const priceId = process.env[plan.env];
    if (!priceId || !process.env.STRIPE_PRACTICE_WEBHOOK_SECRET) return res.status(503).json({ message: "Payments are not available yet. Please try again later." });
    const stripe = billing.stripeClient();
    const price = await stripe.prices.retrieve(priceId);
    if (!price.active || price.type !== "one_time" || price.currency !== "usd" || price.unit_amount !== plan.amount) {
      return res.status(503).json({ message: "This plan is not configured correctly. Please contact support." });
    }
    const base = process.env.client?.replace(/\/$/, "");
    if (!base || !/^https?:\/\//.test(base)) throw new Error("Client URL is not configured");
    const session = await stripe.checkout.sessions.create({
      mode: "payment", payment_method_types: ["card"], customer_email: req.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/practiceInterview?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/practiceInterview?payment=cancelled`,
      metadata: { purpose: "candidate-practice-v1", candidateId: String(req.user._id), practicePlan: req.body.planId },
    });
    res.json({ url: session.url });
  } catch (error) { next(error); }
};
exports.verify = async (req, res, next) => {
  try {
    if (!/^cs_[A-Za-z0-9_]+$/.test(req.body.sessionId || "")) return res.sendStatus(400);
    const session = await billing.stripeClient().checkout.sessions.retrieve(req.body.sessionId);
    if (session.metadata?.candidateId !== String(req.user._id) || session.metadata?.purpose !== "candidate-practice-v1") return res.sendStatus(403);
    if (session.payment_status !== "paid") return res.status(202).json({ paid: false });
    await billing.fulfill(session);
    res.json({ paid: true });
  } catch (error) { next(error); }
};
exports.begin = async (req, res, next) => {
  try {
    const result = await sessions.begin(req.user._id, req.body.type, req.body.requestId);
    res.status(result.status || 200).json(result);
  } catch (error) { next(error); }
};
exports.cancel = async (req, res, next) => {
  try { await sessions.cancelPending(req.user._id, req.params.sessionId); res.json({ status: true }); }
  catch (error) { next(error); }
};
