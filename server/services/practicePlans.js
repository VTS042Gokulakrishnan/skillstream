const plans = {
  pack3: { name: "3 interviews of each type", amount: 1999, credits: 3, env: "STRIPE_PRACTICE_3_PRICE_ID", description: "3 video + 3 coding interviews. One-time payment." },
  pack5: { name: "5 interviews of each type", amount: 2949, credits: 5, env: "STRIPE_PRACTICE_5_PRICE_ID", description: "5 video + 5 coding interviews. One-time payment." },
  unlimited: { name: "One month unlimited", amount: 9900, credits: 0, env: "STRIPE_PRACTICE_MONTH_PRICE_ID", description: "Unlimited video and coding interviews for one calendar month. No auto-renewal." },
};

function nextMonth(date) {
  const result = new Date(date);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + 1);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

function demoValid(candidate, type, grantId, now = new Date()) {
  const demo = candidate?.practiceDemoAccess;
  return !!(demo?.enabled && demo.grantId && (!grantId || demo.grantId === grantId) &&
    new Date(demo.expiresAt || 0) > now && demo.allowedTypes?.includes(type));
}

function access(candidate, now = new Date()) {
  const purchased = candidate.practicePurchased === true;
  const unlimited = purchased && new Date(candidate.practiceUnlimitedUntil || 0) > now;
  const video = purchased ? Math.max(0, candidate.practiceInterviewCount || 0) : 0;
  const coding = purchased ? Math.max(0, candidate.codingPracticeInterviewCount || 0) : 0;
  const demo = candidate.practiceDemoAccess;
  const remaining = Math.max(0, demo?.remainingInterviews || 0);
  const demoVideo = demoValid(candidate, "video", null, now) && remaining > 0;
  const demoCoding = demoValid(candidate, "coding", null, now) && remaining > 0;
  return { purchased, unlimited, unlimitedUntil: candidate.practiceUnlimitedUntil || null,
    demo: { active: demoVideo || demoCoding, remainingInterviews: remaining,
      expiresAt: demo?.expiresAt || null, allowedTypes: demo?.allowedTypes || [] },
    video, coding, canVideo: unlimited || video > 0 || demoVideo, canCoding: unlimited || coding > 0 || demoCoding };
}

module.exports = { plans, nextMonth, access, demoValid };
