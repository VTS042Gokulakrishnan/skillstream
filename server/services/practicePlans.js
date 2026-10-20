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

function access(candidate, now = new Date()) {
  const purchased = candidate.practicePurchased === true;
  const unlimited = purchased && new Date(candidate.practiceUnlimitedUntil || 0) > now;
  const video = purchased ? Math.max(0, candidate.practiceInterviewCount || 0) : 0;
  const coding = purchased ? Math.max(0, candidate.codingPracticeInterviewCount || 0) : 0;
  return { purchased, unlimited, unlimitedUntil: candidate.practiceUnlimitedUntil || null,
    video, coding, canVideo: unlimited || video > 0, canCoding: unlimited || coding > 0 };
}

module.exports = { plans, nextMonth, access };
