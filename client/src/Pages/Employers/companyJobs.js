// The companies-list API returns a count; company details return job records.
export function activeCompanyJobs(jobs) {
  return Array.isArray(jobs)
    ? jobs.filter((job) => job?.status === "Active")
    : [];
}

export function companyJobCount(jobs) {
  if (Array.isArray(jobs)) return activeCompanyJobs(jobs).length;
  if (typeof jobs !== "number" && typeof jobs !== "string") return 0;
  const count = Number(jobs);
  return Number.isFinite(count) && count >= 0 ? Math.floor(count) : 0;
}
