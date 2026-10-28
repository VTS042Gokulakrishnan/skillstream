# Employer and candidate UI revisions — 28 October 2026

Approved scope: items 1–8 from the review conversation. The existing company/candidate save handlers, recruitment actions and initial employer setup gate are retained.

## Changes

- Resume Search: one skill multiselect with custom skills; Boolean query remains independent. Both conditions are combined when searching. Removed the disabled query preview and repeated AND/OR skill rows.
- Resume Search and AI Resume Search: Stop search aborts the browser request and invalidates stale results. A fresh search can start immediately. Reset also invalidates the current Resume Search request.
- Shared loading UI: `Components/Loader/BrandLoader.js` and its stylesheet own the logo, animation and page/compact/button variants. Used by both search pages and the shared resume drawer. Reduced-motion support is included. Future loader changes can be made centrally.
- AI results: icon-only Analyse action with tooltip and accessible name; fixed action column and horizontal table scrolling.
- Resume preview: All Applicants, Shortlisted, Saved and Interviews use the same PDF/DOCX drawer as Resume Search. Signed URLs, fetch errors, retry, canceled loads and mobile drawer width are handled centrally. Existing download and keyword highlighting remain.
- Company and candidate profile editors: numbered section cards, consistent spacing, upload areas and inputs; all existing form fields and save actions remain.
- Sign-in/sign-up dialogs: 16px top margin with normal modal scrolling.
- Job details: removed the route footer.
- Candidate navigation: employer-style navy sidebar, logo, line icons and active state; candidate edit profile now opts into the workspace theme.
- Employer landing: new locally stored recruiter/team banner.
- Public employer header: removed Hiring tools and How it works from desktop/mobile navigation. The corresponding landing content remains.

## Scope limits

Stop search stops the browser request and prevents stale results from being shown. The server exposes no cancellation endpoint; an AI task already dispatched to the external service may continue there.

Validation uses local test data. No deployment, real email, payment or production AI operation is performed by the browser checks.

## Verification completed

- Full application compilation passed using the unminified production webpack configuration.
- Nine client unit tests and six backend regression tests passed.
- JSX undefined/duplicate-property checks and diff whitespace checks passed.
- Browser fixtures verified both searches stop/restart, independent skill and Boolean submission, icon-only Analyse, all four resume drawer entry points, actual PDF and DOCX rendering, candidate profile/sidebar and auth dialogs at desktop/mobile widths.
- Auth dialogs settle at 16px on desktop and 24px on mobile (including the library's mobile margin). Local screenshots omit externally hosted CAPTCHA/identity provider widgets because external requests were blocked during testing.
- Screenshots are available in index.html. Production integrations and deployment remain outside this local verification.
