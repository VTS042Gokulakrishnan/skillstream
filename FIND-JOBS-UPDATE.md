# Find Jobs update

Implemented locally for manual copying. The existing site header is unchanged.

## Behavior

- Blue/gray Find Jobs layout with search, advanced search, sidebar filters, sort, job cards, five jobs per page, and mobile filter drawer. Desktop top spacing is 48px (28px on mobile), with a centered 1440px maximum content width.
- Candidate preferred locations appear horizontally above the results. Change locations opens a Save/Cancel editor. Saving updates the authenticated candidate's `preferred_locations`, clears temporary searches/filters, and refreshes recommendations. Clearing all cities removes the location restriction. Existing skill-based recommendations still apply.
- Public lists, keyword search, global search, and AI search results require the same `userId` + `jobId` to be Active in both `jobs` and `employers.jobs`. Removing the embedded job hides it on the next fetch, even before cleanup. An already-open page refreshes when fetched again; this is not live push removal.
- Public detail links use the same availability check and show an unavailable message for removed jobs. Applications check availability before and after AI analysis and require an active embedded job when writing the employer application.
- Employer job deletion soft-deletes the standalone record and removes the embedded job. Repeating deletion cannot decrement the job count twice. Application history is retained. Employer-account deletion hides its standalone jobs too.
- Deletion uses a transaction on replica sets/Atlas. Standalone MongoDB hides listings first; retry completes a partial failure.

## Files to copy

Paths below are relative to the respective repository root. Copy server files together before releasing the client.

**Client**

```text
src/Pages/Find-Job/JobList.js
src/Pages/Find-Job/JobList.css                     NEW
src/Pages/Find-Job/JobSingle.js
```

**Server**

```text
controller/KeywordSearch.js
controller/candidate/Applyjobs.js
controller/candidate/jobPreferences.js            NEW
controller/employer/Jobs.js
controller/superAdminAccess.js
models/jobsModel.js
router/candidate/Candidate.js
router/employer/Jobs.js
services/jobAvailability.js                      NEW
services/jobDeletion.js                          NEW
scripts/reconcile-deleted-jobs.js                 NEW
tests/job-listing.test.js                         NEW (validation only)
```

Preserve the existing `Applyjobs.js` filename casing in your server repository. No production dependency or package-lock changes are required. Earlier practice-payment changes are documented separately in `PRACTICE-PAYMENTS-UPDATE.md`.

## Database cleanup

Run from the **server repository directory**, using its existing dependencies and `MONGODB_URI` environment variable (or `.env`). Verify that it points to the intended database. The script prints the database name and dry-run/apply mode.

1. Back up the database and preview:

```text
node scripts/reconcile-deleted-jobs.js --report jobs-preview.json
```

2. Review the JSON report. Only `missing_employer` and `missing_employer_job` are eligible for automatic cleanup. Duplicate IDs, wrong owners, missing identifiers, and status mismatches are reported for manual review and skipped.
3. Pause employer posting/editing/deletion and account-deletion jobs during the apply window. Use a fresh report filename:

```text
node scripts/reconcile-deleted-jobs.js --apply --report jobs-applied.json
```

The script backs up each complete affected job in `job_reconciliation_backups` before setting `status: "Deleted"`, `deletedAt`, `deletionReason`, and `reconciliationId`. Run metadata is stored in `job_reconciliation_runs`. It does not delete job documents or application history. Already-Deleted records are skipped on repeat runs. Save the printed `runId`.

4. Preview rollback using that run ID, then apply if required:

```text
node scripts/reconcile-deleted-jobs.js --rollback YOUR_RUN_ID
node scripts/reconcile-deleted-jobs.js --rollback YOUR_RUN_ID --apply
```

Rollback restores only the lifecycle fields changed by that run, and skips records whose cleanup markers have since changed. It does not recreate employer jobs; restored orphan listings remain hidden by the availability check. Use the same maintenance window for rollback.

Report files are never overwritten. Reconciliation scans records individually, so allow time on large databases. An index on `employers.userId` helps the availability lookup; inspect existing indexes and query performance before adding indexes to production.

## Verification and release checks

- Seven integration tests passed on both standalone MongoDB and a local replica set. They cover exact active matches, immediate exclusion after embedded removal, ownership isolation, shared search filtering, repeated deletion, employer-account deletion, preferences, cleanup preview/apply/repeat/rollback, and history retention.
- The actual Find Jobs component bundles successfully against isolated dependencies. Mock DOM interaction checks pass for initial rendering, preference Cancel, preference Save and results refresh, job-type filtering, and clearing filters.
- Browser tooling was unavailable, so visual desktop/mobile review remains a release check. Full client production build, real Atlas Search, external AI, and production API end-to-end checks have not been run.
- No production data was changed and nothing was deployed.

To rerun the database suite, set `JOBS_TEST_MONGODB_URI` to a disposable test database and run from server:

```text
node --test tests/job-listing.test.js
```

Before deployment, run the normal client production build; check desktop/mobile spacing with the existing header; verify a signed-in candidate can save/clear locations; and verify an employer-deleted job disappears from listing and real keyword search and cannot be opened/applied to.
