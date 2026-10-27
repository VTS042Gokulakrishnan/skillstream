# Candidate UI update

Implemented the approved light theme with compact typography, navy text, blue actions, white cards, subtle borders, and responsive layouts. The existing SkillStream logo and navigation destinations are retained.

## Included

- Dashboard: real application-status pie chart, counters, notifications, recent applications, and career tools.
- Applied jobs, shortlisted jobs, and received job alerts: compact tables, working date filters, five records per page, loading/error/empty states, and existing view/remove actions.
- CV Manager: saved rÃ©sumÃ©s and a preview shown first. Upload controls appear only when there is no rÃ©sumÃ© or Change rÃ©sumÃ© is clicked. Existing AI enhancement, primary selection, and removal remain available.
- Profile: identity banner, summary, experience, education, and information sidebar.
- Messages: conversation layout, empty selection state, and socket cleanup. Existing message APIs are retained.
- Companies: horizontal search/location/industry filters, nine cards per page, and company detail pages with three active jobs per page. Company details exclude deleted/inactive employer jobs. The companies-list API returns a numeric total, displayed as jobs (not open jobs); array responses count active jobs.
- Practice: video/coding cards, centered purchase action and existing plans modal, shared history filters, setup, device checks, live video/coding layouts, submission/retry states, and results.
- Practice results use the report link for the exact session ID. No sample scores are shown. Payment/demo access checks and session IDs are preserved.

Shortlisted Jobs now includes the updated workspace header/sidebar, saved-date filtering, and existing shortlist view/remove APIs. Find Jobs and Job Single receive only the updated shared header styling; their page layouts and Easy Apply are unchanged by this follow-up. No server files were changed for this UI pass.

## Copy to your client repository

Copy the following paths relative to `client/`, keeping the same directory structure:

```text
src/App.js
src/Components/CandidateUI/                      (entire new directory)
src/Components/Sidebar/CandidatesSidebar.js
src/Components/PracticalInterview/SetupForm.js
src/Components/PracticalInterview/PracticalInterview.js
src/Components/PracticalInterview/PracticeStates.js
src/Components/PracticalInterview/PracticeInterviewLanding/CodingPractice.js
src/Pages/Candidates/Candidates-Dashboard/Dashboard.js
src/Pages/Candidates/Candidates-Dashboard/AppliedJobs.js
src/Pages/Candidates/Candidates-Dashboard/ShortlistedJobs.js
src/Pages/Candidates/Candidates-Dashboard/JobAlerts.js
src/Pages/Candidates/Candidates-Dashboard/CVManager.js
src/Pages/Candidates/Candidates-Dashboard/ProfileView.js
src/Pages/Candidates/Candidates-Dashboard/Messages.js
src/Pages/Candidates/Candidates-Dashboard/PracticeAssessment.js
src/Pages/Employers/EmployersList.js
src/Pages/Employers/EmployersSingle.js
src/Pages/Employers/companyJobs.js
```

No new package dependencies or database migration are required for these UI changes. Keep the previously implemented practice payment/demo server changes and PracticePlansModal files installed.

## Validation

- Full client webpack compilation passed using the existing dependency installation in the sibling client repository. Compilation ran in memory with minification and lint plugin disabled; it was not a deployment build. Existing dependency/source-map warnings remain.
- The original six focused React tests passed: five-item pagination/date filtering, alert loading/retry, saved-rÃ©sumÃ©-first setup, exact-session report selection, missing report state, and unpaid purchase-modal behavior.
- Shortlist/header follow-up: all 11 React tests passed, including saved-job API/link mapping, legacy saved-date filtering, five-row pagination, failed/successful removal, and header-only route scope/cleanup. JSX and CSS syntax checks passed. No fresh full deployment build or browser visual check was run for this follow-up.
- JSX syntax and stylesheet parsing checked; undefined-variable checks run on changed components.
- Browser access is disabled in this session's Work settings. Rendered appearance at laptop/desktop/mobile sizes and real camera/microphone/screen-sharing were not visually or end-to-end validated. No live payments, interview credits, or production data were used during verification.

After copying, run your normal client build and review the routes above locally. Check both purchased/demo and unpaid practice states, upload a replacement rÃ©sumÃ© only when intended, and complete a demo interview to verify recording and report availability in your environment.


## Candidate landing: approved Option 1 (corrected selection, October 26, 2026)

The `/` route now uses `Header1`, the same shared header as Find Jobs and Job Single, and opts into the existing header-only theme. Existing logged-out Login/Register menus and logged-in account behavior are retained. Other public headers are not replaced.

The candidate landing now follows Option 1: split photo hero with a wide search bar, compact Boost/Prep/Learn cards, career-discovery band, video/coding practice cards, categories, FAQs, contact form, and navy footer. Local shaded SVG icons and all existing actions are retained. The hero reuses the existing front-view-smiley-woman-desk-giving-thumbs-up.jpg asset rather than the generated mockup photo. The footer is owned by this page so App no longer renders a duplicate footer at `/`. Existing role-specific signed-in redirects remain unchanged.

Copy these files for this follow-up (relative to client/):

```text
src/App.js
src/Components/CandidateUI/PortalTheme.js
src/Components/CandidateUI/PortalTheme.css
src/Pages/HomeNew/AgencyLandingPage.js
src/Pages/HomeNew/CandidateLanding.css
src/Pages/HomeNew/CareerIcon.js
src/assets/front-view-smiley-woman-desk-giving-thumbs-up.jpg
src/Pages/HomeNew/CandidateLanding.test.js
src/Components/CandidateUI/PortalFlows.test.js
```

Keep the previously updated shared Header1 component and its assets/styles installed. No packages, backend changes, database script, or Next.js migration are required. Category links use the existing keyword-search navigation contract; they are not a new backend taxonomy. The contact form uses the existing `/api/v1/contact/email/send/details` endpoint with its required subject and region fields. No test messages were sent to the live service.

Validation: 18 React tests passed across landing and existing portal flows, including search payloads, advanced filters, contact error/retry/success, signed-in redirects, and the landing's header-only styling scope. JSX and CSS syntax passed. The browser could not reach either localhost preview address (connection timeout), so no rendered desktop/mobile or complete header visual validation was achieved. No fresh deployment build was run for this follow-up.

Option 1 correction: JSX/CSS syntax checks and all 18 landing/portal tests passed again. No browser visual review or production build was completed for this layout correction.


## Nine requested corrections — October 26, 2026 (supersedes earlier landing notes)

1. Candidate sidebar now uses navy backgrounds, cyan active state, and local shaded vector icons. Account dropdown clicks no longer toggle the sidebar.
2. Account menus no longer use the full-page `user-sidebar` class that added top padding. Independent popup styles normalize row spacing and an avatar fallback prevents broken profile images.
3. Candidate-facing resume/resumes wording uses plain ASCII e throughout JS UI copy, including modal labels and practice setup. API identifiers and uploaded filenames are unchanged.
4. CV preview's external link is a filled blue button.
5. Shared header navigation typography is normalized. Logged-out navigation retains Blogs/About/Contact, adds Find Jobs/Companies/Create Resume, Employers Page and Login as Vendor. Both desktop/mobile login instances receive the vendor flag; switching mode updates the existing Login effect.
6. Practice setup/device/result spacing is reduced, the setup action stays reachable, and device dialogs scroll within the viewport. Media/session/payment behavior is unchanged.
7. Landing container now grows to 1600px with responsive side padding.
8. Landing contact form removed. Navy footer restores About/Pricing/Blog/Contact, resources, email, phone, address and socials. Site Map now opens an on-page expandable navigation section instead of incorrectly pointing to Contact. LinkedIn uses the company page rather than the previous admin/dashboard URL.
9. New local hero image recreates the woman/laptop photo from the approved reference. Generated with the built-in image-generation tool; it is not an exact pixel crop of the small screenshot.

Additional copy list for these corrections, relative to client/ (also keep the earlier full UI copy list):

```text
src/Components/Header/Header1.js
src/Components/Sidebar/CandidatesSidebar.js
src/Components/CandidateUI/ (entire directory)
src/Pages/Auth/Login.js
src/Pages/Candidates/Candidates-Dashboard/CVManager.js
src/Pages/Candidates/Candidates-Dashboard/Dashboard.js
src/Components/PracticalInterview/SetupForm.js
src/Components/PracticalInterview/PracticeStates.js
src/Pages/HomeNew/ (entire directory)
src/assets/landing-professional-hero.png
```

Validation: all 18 landing/portal tests passed, including footer restoration and removal of the form. JSX syntax checks passed for the shared header, sidebar, login, landing, and icon components; both updated stylesheets parsed successfully. No live authentication, contact requests, or database writes were performed. Browser rendering at desktop/laptop/mobile and real media sessions still need local visual verification; no deployment build was run.

Hero generation prompt: recreate only the upper-right photo from the approved landing design, preserving the woman with blue shirt, laptop, and bright office; wide rectangular photographic asset with no text, controls, logos or borders. Source reference: exec-2363f472-6f6f-4282-b3da-ca971c29a50f.png. Workspace asset: client/src/assets/landing-professional-hero.png.


## Landing side-gap correction

Removed the landing container maximum-width cap. Hero, cards, sections, and footer now share a fluid container with 32px outer gutters above 900px, 20px at 900px and below, and 14px at 520px and below. Copy `client/src/Pages/HomeNew/CandidateLanding.css` for this correction. Existing typography and behavior are unchanged. CSS parsing and breakpoint calculations checked; no browser visual verification performed.
