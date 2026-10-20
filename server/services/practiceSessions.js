const { randomUUID } = require("crypto");
const Candidate = require("../models/candidateModel");
const { access } = require("./practicePlans");
const countField = (type) => type === "coding" ? "codingPracticeInterviewCount" : "practiceInterviewCount";

async function cancelPending(candidateId, id) {
  const candidate = await Candidate.findById(candidateId).lean();
  const session = candidate?.practiceSessions?.find((s) => s.id === id && s.state === "pending");
  if (!session) return;
  await Candidate.updateOne({ _id: candidateId, practiceSessions: { $elemMatch: { id, state: "pending" } } }, {
    $pull: { practiceSessions: { id } },
    ...(session.charged ? { $inc: { [countField(session.type)]: 1 } } : {}),
  });
}

async function expirePending(candidateId) {
  const candidate = await Candidate.findById(candidateId).lean();
  for (const session of candidate?.practiceSessions || []) {
    if (session.state === "starting" && session.expiresAt <= new Date()) {
      await Candidate.updateOne({ _id: candidateId, practiceSessions: { $elemMatch: { id: session.id, state: "starting", expiresAt: { $lte: new Date() } } } },
        { $set: { "practiceSessions.$.state": "pending" } });
      await cancelPending(candidateId, session.id);
    }
    if (session.state === "pending" && session.expiresAt <= new Date()) await cancelPending(candidateId, session.id);
  }
  // Finished/expired sessions no longer authorize requests. History remains separate.
  await Candidate.updateOne({ _id: candidateId }, { $pull: { practiceSessions: {
    state: { $in: ["active", "completed"] }, expiresAt: { $lte: new Date() },
  } } });
}

async function begin(candidateId, type, id) {
  if (!["video", "coding"].includes(type) || !/^[a-f0-9-]{36}$/i.test(id || "")) {
    return { status: 400, message: "Invalid practice session" };
  }
  await expirePending(candidateId);
  const current = await Candidate.findById(candidateId).lean();
  const existing = current?.practiceSessions?.find((s) => s.id === id);
  if (existing) return existing.type === type && existing.state === "pending"
    ? { sessionId: id } : { status: 409, message: "Start a new practice session" };
  const session = { id, type, state: "pending", charged: false, questionsRemaining: 15, expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) };
  const filter = { _id: candidateId, practicePurchased: true, "practiceSessions.id": { $ne: id } };
  let result = await Candidate.updateOne({ ...filter, practiceUnlimitedUntil: { $gt: new Date() } }, {
    $push: { practiceSessions: session },
  });
  if (!result.modifiedCount) {
    session.charged = true;
    result = await Candidate.updateOne({ ...filter, [countField(type)]: { $gt: 0 } }, {
      $inc: { [countField(type)]: -1 }, $push: { practiceSessions: session },
    });
  }
  if (result.modifiedCount) return { sessionId: id };
  const latest = await Candidate.findById(candidateId).lean();
  if (latest?.practiceSessions?.some((s) => s.id === id && s.type === type && s.state === "pending")) return { sessionId: id };
  return { status: 402, message: "Purchase a practice plan to start this interview." };
}

function requireSession(type, action = "use") {
  return async (req, res, next) => {
    try {
      const id = req.headers["x-practice-session"];
      const candidate = await Candidate.findById(req.user._id).lean();
      const session = candidate?.practiceSessions?.find((s) => s.id === id);
      if (!session || (type && session.type !== type) || session.expiresAt <= new Date()) {
        return res.status(402).json({ message: "Return to Practice Assessment and start a new interview." });
      }
      if (action === "submit" && session.state === "completed") return res.json({ status: true, alreadyCompleted: true });
      if (action === "start" && session.state === "active" && session.startResponse) return res.json(session.startResponse);
      if (action === "submit") {
        const lockId = randomUUID();
        const lockUntil = new Date(Date.now() + 60 * 60 * 1000);
        const result = await Candidate.updateOne({ _id: req.user._id, practiceSessions: { $elemMatch: {
          id, $or: [{ state: "active" }, { state: "submitting", lockUntil: { $lt: new Date() } }],
        } } }, { $set: { "practiceSessions.$.state": "submitting", "practiceSessions.$.lockId": lockId, "practiceSessions.$.lockUntil": lockUntil } });
        if (!result.modifiedCount) return res.status(409).json({ message: "This interview is not ready or is already being submitted." });
        req.practiceLockId = lockId;
        // Failed uploads/evaluations remain retryable, without another deduction.
        const release = () => Candidate.updateOne({ _id: req.user._id, practiceSessions: { $elemMatch: { id, state: "submitting", lockId } } },
          { $set: { "practiceSessions.$.state": "active" } }).catch((error) => console.error("Practice lock release failed:", error.message));
        res.once("finish", release);
        res.once("close", release);
      } else {
        if (!["pending", "active"].includes(session.state)) return res.status(409).json({ message: "This interview is no longer active." });
        if (action === "start") {
          if (!session.charged && !access(candidate).unlimited) {
            await cancelPending(req.user._id, id);
            return res.status(402).json({ message: "Your unlimited pass has expired. Please purchase a plan." });
          }
          // A request owns the start until the response, preventing repeated starts.
          const result = await Candidate.updateOne({ _id: req.user._id, practiceSessions: { $elemMatch: { id, state: "pending" } } },
            { $set: { "practiceSessions.$.state": "starting" } });
          if (!result.modifiedCount) return res.status(409).json({ message: "Interview has already started." });
          const send = res.json.bind(res);
          res.json = (body) => {
            const ok = res.statusCode < 400 && body.status !== false && body.status !== "error" && body.data?.status !== "error";
            if (!ok && res.statusCode < 400) res.status(502);
            (async () => {
            try {
              await Candidate.updateOne({ _id: req.user._id, practiceSessions: { $elemMatch: { id, state: "starting" } } },
                { $set: { "practiceSessions.$.state": ok ? "active" : "pending",
                  ...(ok ? { "practiceSessions.$.startResponse": body } : {}) } });
              if (!ok) await cancelPending(req.user._id, id);
              send(body);
            } catch (error) {
              console.error("Practice start update failed:", error.message);
              res.status(500); send({ message: "Unable to start interview. Please try again later." });
            }
            })();
            return res;
          };
        } else if (action === "questions" && session.state !== "active") {
          return res.status(409).json({ message: "Start the interview first." });
        } else if (action === "questions") {
          const result = await Candidate.updateOne({ _id: req.user._id, practiceSessions: { $elemMatch: {
            id, state: "active", questionsRemaining: { $gt: 0 },
          } } }, { $inc: { "practiceSessions.$.questionsRemaining": -1 } });
          if (!result.modifiedCount) return res.status(409).json({ message: "All questions for this interview have been used. Please submit your interview." });
        }
      }
      req.practiceSession = session;
      next();
    } catch (error) { next(error); }
  };
}

async function complete(candidateId, session, lockId, record) {
  const result = await Candidate.updateOne({ _id: candidateId, practiceSessions: { $elemMatch: { id: session.id, state: "submitting", lockId } } }, {
    $set: { "practiceSessions.$.state": "completed" },
    $push: { [session.type === "coding" ? "codingPracticeInterview" : "practiceInterview"]: record },
  });
  if (!result.modifiedCount) throw new Error("Interview submission no longer owns the session");
}

module.exports = { begin, cancelPending, expirePending, requireSession, complete, access };
