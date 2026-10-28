export function accountRole(pathname, { initialRole, isVendor } = {}) {
  if (pathname === "/employers" && (isVendor || initialRole === "Vendor")) return "Vendor";
  if (pathname === "/employers" || pathname === "/pricing/employer") return "Employer";
  return "Candidate";
}

export function loginDestination(data, location) {
  if (!data.profileCompleted || (data.role === "Candidate" && !data.isResumeUploaded)) {
    return `/update-profile/${data.accessToken}`;
  }
  if (data.role === "Vendor") return "/vendor/dashboard";
  if (data.role === "Employer") return data.subscribed ? "/employer-dashboard" : "/pricing/employer";
  if (/^\/(find-jobs|job-detail\/|employers-list|employers\/)/.test(location.pathname)) {
    return location.pathname + location.search;
  }
  return "/candidate-dashboard";
}

export function saveSession(data) {
  const values = { token: data.accessToken, Role: data.role, UserId: data.userId,
    ProfileCompleted: data.profileCompleted, ResumeUploaded: data.isResumeUploaded,
    Subscribed: data.subscribed, linkedinAccessToken: data.linkedInloggedIn };
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null) localStorage.setItem(key, String(value));
  });
  window.dispatchEvent(new Event("skillstream-auth"));
}
