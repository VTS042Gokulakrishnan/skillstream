import { activeCompanyJobs, companyJobCount } from "./companyJobs";

test.each([ [16, 16], [0, 0], ["30", 30], [null, 0], [undefined, 0], [{}, 0], ["invalid", 0], [-1, 0], [Infinity, 0] ])(
  "handles companies-list jobs value %p as count %p",
  (value, expected) => expect(companyJobCount(value)).toBe(expected)
);

test("company detail records count only active jobs and tolerate empty records", () => {
  const active = { jobId: "1", status: "Active" };
  const jobs = [active, { status: "Deleted" }, { status: "Inactive" }, null];
  expect(companyJobCount(jobs)).toBe(1);
  expect(activeCompanyJobs(jobs)).toEqual([active]);
  expect(activeCompanyJobs(16)).toEqual([]);
});
