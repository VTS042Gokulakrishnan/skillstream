const restrictedDomains = [
  "hrpundits.com",
  "vivatechsolutions.io",
  "growthiq.net",
];
function billingRestricted(user) {
  const email = String(user?.email || "").toLowerCase();
  return (
    user?.access === "User" ||
    email === "nischalakrishna@gmail.com" ||
    restrictedDomains.includes(email.split("@")[1])
  );
}
module.exports = { billingRestricted };
