# Public UI correction and employer redesign plan

Planning only. No application code changed. References: three supplied screenshots, supplied 16.2-second Oorwin recording, and current local source (including existing uncommitted changes).

## 1. Candidate hero crop and spacing

Evidence: screenshots 1 and 3 have different apparent content scales and photo crops; screenshot 2 has an oversized header and a nearly invisible white wordmark. Screenshots alone cannot establish browser zoom or CSS viewport size. Current CandidateLanding.css combines an uncapped container, a fixed 350px photo height, object-fit: cover, object-position: 61% center, and a negative search-panel margin. This makes the crop change with width. The two-column hero persists down to 520px. Multiple header variants need a layout audit before attributing every gap to one rule.

Plan: establish one shared header height and content gutter; remove duplicate header offsets; use a bounded content width and deliberate image aspect ratio; preserve the face and laptop focal area with breakpoint-specific positioning. Stack the hero earlier where the copy/photo become cramped. Reserve layout space for the search panel and expanded filters instead of relying on fragile overlap. Use a consistent 24–32px hero/card gap and 48–64px section spacing, adjusted for small screens.

Accept: no clipped face, stretched image, horizontal overflow, obstructed search controls, or unexplained blank strip. Compare at 100% zoom at 1920x1080, 1440x900, 1366x768, 1024x768, 768x1024, and 390x844; also check 125%/150% scaling and 200% browser zoom for reflow. Include collapsed/expanded filters and mobile menu states.

## 2. Guest navigation and search access

Working interpretation of the unfinished phrase “not show in header until”: until candidate login. Hide Find Jobs and Companies from guest desktop and mobile headers. Keep the landing search form, which opens /find-jobs without requiring login. Preserve title, city and advanced filters; plan URL query parameters so refresh/back/share retain the search. Keep other marketing pages public; “only find-jobs” is interpreted within job/company browsing, not as removing access to About, pricing or legal pages.

Proposed route rules: guest search results remain public; company directory/details and job detail/apply/save actions require candidate login, retaining the intended destination. Restore Find Jobs and Companies for authenticated candidates only; employer navigation remains employer-specific. Confirm job-detail gating before implementation if public job detail pages are intended. Hiding links is not an access control: inspect route guards and existing server enforcement separately.

## 3. Restore original logo

PublicShell.js currently uses a text-only SkillStream wordmark. Header1.js uses assets/logo-twos.png for the original dark-letter logo and logo-white-new.png in another branch; this matches the mobile contrast problem. Reuse the original assets across new public headers, footers and auth surfaces. Dark lettering on light backgrounds; white variant only on dark backgrounds. Preserve aspect ratio, consistent visible size and clear space. Do not regenerate the production logo from the mockup.

## 4. Update sign-in modal

Use the new visual system: navy heading, blue primary action, rounded white panel, consistent form labels, input heights and spacing. Candidate title: “Sign in to your candidate account”; employer title: “Sign in to your employer account”. Keep password visibility, forgot password, existing supported social sign-in, validation/loading/error feedback, and registration links. Verify focus trapping, Escape/close, focus return and small-screen scrolling. Cover password reset and confirmation flows so the old styling does not reappear.

## 5. Context-specific registration and login

Register.js accepts initialRole but still renders Candidate/Employer tabs. Remove the role selector entirely. Resolve the account context from the page and carry it through login, registration, password reset, confirmation, Google/Microsoft sign-in and return destinations. Candidate pages offer candidate registration/login; employer landing and employer pricing offer employer registration/login. Generic public pages default to candidate context. Keep employer-specific fields and existing consent requirements. Verify server role validation rather than trusting hidden UI values.

## 6. Keep and redesign vendor login exclusively on /employers

Keep the Login as Vendor button and vendor sign-in modal on the exact /employers route, in both desktop and mobile navigation. Do not show vendor entry points or open the vendor modal on / (the candidate landing page), other candidate pages, employer pricing, or other public routes. This supersedes the earlier proposal to remove public vendor login.

Redesign the vendor sign-in modal using the same original logo, navy headings, blue primary button, rounded white panel, input sizes and spacing as the new candidate/employer auth design. Title: “Sign in to your vendor account”; action: “Sign in”. Keep vendor identity fixed with no Candidate/Employer/Vendor selector. Preserve existing vendor authentication, password visibility, password recovery, validation, loading/error feedback and successful vendor-dashboard navigation. Carry vendor context through supported recovery/auth flows without adding new registration or social-login capabilities. Verify keyboard focus, close/Escape handling and mobile scrolling. On navigation away from /employers, close/reset the vendor modal so its state cannot leak into candidate pages. Existing vendor accounts, data, backend functionality and signed-in vendor dashboards remain intact.

## 7. Employer page concept and motion

Video observations: 0–3s centered gradient hero and dashboard preview; approximately 4s product cards; 6s tabbed feature panel; 7–10s supporting sections; 12s FAQ; 13–15s awards/footer. The recording scrolls quickly, so precise original animation timing cannot be established from these samples. The motion values below are proposals.

Use SkillStream colors from the source: navy #102347, primary blue #0784f6 / #087cf0, muted #60718b, ice #f7fbfd, and logo cyan. Avoid copying Oorwin's purple branding, claims, awards or customer logos.

Page sequence:
1. Original logo and employer-specific header; Employer login / Get started, plus a secondary Login as Vendor action exclusively on /employers. The initial generated concept predates this correction; the final design must include this action and the redesigned vendor modal.
2. Centered navy-to-blue hero: “Build your next great team.” Start hiring and Explore hiring tools actions.
3. Large illustrative recruiting dashboard overlapping the hero boundary, with space reserved in document flow.
4. Four product cards: job posting, candidate discovery, assessments, hiring workflow.
5. Tabbed showcase: post a role, discover candidates, assess skills, manage hiring.
6. Three-step hiring explanation, employer pricing link, FAQ, final registration CTA and navy footer.

Motion specification: hero text fades/slides 16px over 450ms; dashboard enters over 600ms with very subtle depth on desktop; feature cards reveal once in 80ms staggered intervals; tab changes crossfade in 200ms; CTA hover uses 150ms color/shadow changes. Optional slow cyan background drift, with no layout movement. No scroll hijacking. Respect reduced-motion preferences, stop offscreen effects, and use a static dashboard on touch/small screens. Use existing supported features; all mock dashboard content is illustrative.

## Implementation order and verification

1. Agree on design direction and the stated guest job-detail assumption.
2. Consolidate logo/header presentation and guest navigation rules.
3. Correct candidate hero sizing and spacing.
4. Unify context-specific auth modals; retain and redesign vendor sign-in exclusively on /employers.
5. Implement the employer design and motion.
6. Verify guest/candidate/employer/vendor navigation, direct URLs, successful and failed login, OAuth role continuity where supported, search filter persistence, modal accessibility, reduced motion and all viewport comparisons. Confirm vendor login appears and works on /employers in desktop/mobile navigation, is absent from / and other public routes, and resets when leaving /employers. Use focused behavior tests for route/auth rules and screenshot review for layout.

Likely touchpoints: client/src/Pages/HomeNew/CandidateLanding.css; AgencyLandingPage.js; Components/Header/Header1.js, Header.js, HeaderEmp.js and Header.css; Components/CandidateUI/PortalTheme.css; Components/PublicSite/PublicShell.js and PublicSite.css; Pages/Public/PublicPages.js; Pages/Auth/Login.js and Register.js plus related auth components; App.js and current route guards. Inspect exact ownership before editing to preserve existing work.
