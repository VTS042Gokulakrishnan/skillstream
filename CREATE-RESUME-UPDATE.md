# Create Resume builder update

## Candidate flow

- The logged-in candidate header (desktop and mobile) opens `/create-resume` inside SkillStream. Logged-out visitors still do not see Create Resume.
- The initial page lists the candidate's saved editable resumes, with preview thumbnails, **Preview**, **Use this resume**, Edit, Duplicate, Download PDF, and Delete actions. First-time users see an empty state and Create resume.
- Five templates: Classic Serif, Modern Professional, Executive, Technical, Graduate. New Technical and Graduate resumes start with appropriate section orders. Switching an existing resume's template preserves its content and customized section order.
- Editor: content accordions, repeatable entries, bold/italic/bullet formatting, section headings/order/visibility, font/size/spacing/margins/accent, A4/Letter, and live preview.
- Save stores a draft. PDF preview and download save current edits first. Live preview shows continuous content; PDF preview shows actual exported pagination.
- A download starts the browser download and then asks whether to use the resume for the profile and future applications. **Not now** only closes the prompt. Browsers do not report that a user has finished saving a download, so the prompt accurately says the download has started.
- **Use this resume** confirms, generates the selected saved revision as a text PDF, uploads it to the existing S3 bucket, and updates `Candidate.resume`, `isResumeUploaded`, and `allResumes`. Existing entries become Secondary; the new PDF becomes Primary. Legacy `resume`-only profiles are preserved as a secondary entry. Each inserted entry has an `_id` for CV Manager's existing primary/delete controls.
- Existing job applications keep their original resume reference. Future applications use the new primary via the current job application code.
- Repeating Use on the same revision reuses its revision-specific S3 key and avoids duplicate CV entries. Saving changes creates a new revision and therefore a new PDF URL when explicitly used.
- Deleting a builder draft does not delete its already-published CV/application PDFs.
- Unsaved navigation supports Save and leave / Discard / Continue editing, including in-app links and Back/Forward within browser history. Refresh/close uses the browser's native unsaved-change warning. Save failure keeps the editor and its draft open.

## Copy to your deployed repositories

Client:
- `src/Pages/ResumeBuilder/` (all new files; tests may be excluded from deployment packaging)
- `src/App.js` (protected `/create-resume` route and import)
- `src/Components/Header/Header1.js` (candidate Create Resume links)

Server:
- `app.js` (mount `/api/v1/resume-builder`)
- `models/resumeDocument.js`
- `router/resumeBuilder.js`
- `services/resumeBuilder/` (template renderer, PDF generation, primary-resume update)
- `tests/resume-builder.test.js`
- `Dockerfile` if deploying with this Docker image

No database reset or migration script is needed. Mongoose creates the separate `resumedocuments` collection when the first draft is saved. Existing CV Manager documents are updated only after explicit Use confirmation.

## Server runtime / deployment

The existing server package already declares `puppeteer`, `aws-sdk`, and `mongoose`; no new package dependency was added.

PDF export needs Chrome/Chromium and its platform libraries on the backend host.
- Dockerfile now installs `chromium` and `fonts-liberation`, sets `RESUME_CHROME_PATH=/usr/bin/chromium`, and sets `RESUME_CHROME_NO_SANDBOX=true` for this existing root-run image. Rebuild the image for these changes.
- Non-Docker deployment: install Chrome using Puppeteer's browser installer (`npx puppeteer browsers install chrome`; on Linux use `--install-deps` where supported), or set `RESUME_CHROME_PATH` to an installed Chrome/Chromium executable. Keep `RESUME_CHROME_NO_SANDBOX` unset unless your container runtime requires it.
- Existing storage configuration is reused: `AWS_BUCKET_NAME_IMAGE`, `AWS_ACCESS_KEY_ID`, `AWS_ACCESS_KEY_SECRET`, plus your existing AWS region configuration. Uses the same public-read URL convention as current CV Manager upload.
- PDF rendering runs with JavaScript disabled and outbound page requests blocked. Two PDF jobs per process can run at once; additional callers receive a retry message.

API: all endpoints use existing Bearer authentication and enforce Candidate role and document ownership. GET/POST `/api/v1/resume-builder`; GET/PATCH/DELETE `/:id`; POST `/:id/duplicate`, `/:id/pdf`, `/:id/use`. Save, delete, PDF and use send the expected revision. Conflicts return 409 without overwriting the other tab's draft.

The browser and server template files intentionally contain the same renderer, with ESM vs CommonJS exports because the client/server are deployed independently. Update both copies together; the backend test checks their parity.

## Verification

- Backend tests exercise validation/HTML escaping, hidden content, renderer parity, primary update shape, authentication, ownership, revision conflicts, PDF download without promotion, S3 failure without promotion, successful explicit promotion, duplication, and deletion. DB/S3/PDF calls are mocked in API tests; no production data is touched.
- Final regression run: 25 frontend tests across the builder, candidate portal, and landing page; 5 backend tests passed.
- Frontend tests cover saved-card flow, explicit confirmation, download opt-out, failed save preservation, save-before-download revision selection, template content retention, empty-title preview safety, and failed upload retry state.
- Isolated builder webpack compilation and headless Chrome desktop/mobile checks use sample data and a mocked API.
- Real local Chrome generates all five templates and a multipage sample; exported text and rendered pages were reviewed.
- Full-app production compilation in this workspace is currently blocked by incomplete local React files (`client/node_modules/react/cjs/react.production.min.js` missing). No dependency reinstall was performed.
- Real S3 upload and database promotion must be smoke-tested in your staging deployment after copying these files and configuring the PDF browser. They were not run against your production account.

Tests from server: `node --test tests/resume-builder.test.js`.
Frontend: `npm test -- --watchAll=false --runInBand ResumeBuilder.test.js`.

## Follow-up fixes: saved settings, calendar dates, card actions

- Fixed reopening saved resumes when MongoDB omitted empty `settings.headings`. Client and server restore missing nested defaults on read; model now uses `minimize: false`. Existing documents need no reset or migration.
- Experience and Projects now use calendar pickers. New dates display DD/MM/YY in the editor and MM/YY in the resume/PDF. Month-only/year-only legacy values retain their precision. Unrecognized legacy strings remain visible with a review message until replaced. Present checkboxes disable the end date; reversed ranges are rejected on client save and server validation.
- Card actions now have visible boxed icons and labels (Edit, Duplicate, Download PDF, Delete), wrapping into two columns on mobile.
- PDF browser selection now checks `RESUME_CHROME_PATH`, then `PUPPETEER_EXECUTABLE_PATH`, Puppeteer's downloaded browser, then installed system Chrome/Edge/Chromium. An explicitly configured invalid path returns a clear error instead of silently choosing a different browser. Restart the backend after copying the updated service. No environment edit is needed on this Windows machine if Chrome remains in its standard install location.
- Optional explicit Windows configuration: `RESUME_CHROME_PATH=C:/Program Files/Google/Chrome/Application/chrome.exe`. For deployment without a system browser, install Puppeteer's Chrome or use the Docker configuration above.

Copy the updated builder folder (including new `ResumeDates.js`), client `package.json`/`package-lock.json`, server `models/resumeDocument.js`, `router/resumeBuilder.js`, and entire `services/resumeBuilder/` folder (including new `browser.js`). The client now explicitly declares the already-used Day.js dependency; run `npm install` in the destination client if necessary.

Follow-up verification: 9 frontend tests and 8 backend tests passed. Isolated builder compiled; real calendar and boxed actions were reviewed in headless Chrome. A sample PDF generated successfully through automatic Chrome detection with no `RESUME_CHROME_PATH`. No live S3/database writes were performed.
