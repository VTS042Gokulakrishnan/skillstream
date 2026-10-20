const Candidate = require("../models/candidateModel");
const { plans, nextMonth } = require("./practicePlans");

function stripeClient() {
  return require("stripe")(process.env.STRIPE_API_KEY);
}

// Both webhook and redirect verification use the same atomic fulfillment.
async function fulfill(session) {
  const plan = plans[session.metadata?.practicePlan];
  if (!plan || session.metadata?.purpose !== "candidate-practice-v1" ||
      session.mode !== "payment" || session.payment_status !== "paid" ||
      session.currency !== "usd" || session.amount_total !== plan.amount) {
    throw new Error("Invalid or unpaid practice checkout");
  }
  const id = session.metadata.candidateId;
  const filter = { _id: id, practicePayments: { $ne: session.id } };
  if (plan.credits) {
    const result = await Candidate.updateOne(filter, {
      $inc: { practiceInterviewCount: plan.credits, codingPracticeInterviewCount: plan.credits },
      $set: { practicePurchased: true }, $addToSet: { practicePayments: session.id },
    });
    if (result.modifiedCount) return;
  } else {
    // Compare-and-swap protects extensions when two different purchases arrive together.
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = await Candidate.findById(id).lean();
      if (!candidate) throw new Error("Candidate no longer exists");
      if (candidate.practicePayments?.includes(session.id)) return;
      const previous = candidate.practiceUnlimitedUntil || null;
      const base = new Date(Math.max(Date.now(), new Date(previous || 0).getTime()));
      const result = await Candidate.updateOne({ ...filter, practiceUnlimitedUntil: previous }, {
        $set: { practicePurchased: true, practiceUnlimitedUntil: nextMonth(base) },
        $addToSet: { practicePayments: session.id },
      });
      if (result.modifiedCount) return;
    }
  }
  const existing = await Candidate.findById(id).lean();
  if (!existing?.practicePayments?.includes(session.id)) throw new Error("Payment fulfillment must be retried");
}

async function webhook(req, res) {
  let event;
  try {
    if (!process.env.STRIPE_PRACTICE_WEBHOOK_SECRET) return res.sendStatus(503);
    event = stripeClient().webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_PRACTICE_WEBHOOK_SECRET);
  } catch (_) { return res.status(400).send("Invalid webhook signature"); }
  try {
    if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type) &&
        event.data.object.metadata?.purpose === "candidate-practice-v1" && event.data.object.payment_status === "paid") {
      await fulfill(event.data.object);
    }
    return res.json({ received: true });
  } catch (error) {
    console.error("Practice payment fulfillment failed:", error.message);
    return res.sendStatus(500);
  }
}

module.exports = { stripeClient, fulfill, webhook };
