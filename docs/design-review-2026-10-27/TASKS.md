# SkillStream content and design tasks
Created: 27 October 2026
Status: User approved implementation. Public pages, separate pricing, blog/editor, community prelaunch and signup policy flows are implemented. See IMPLEMENTATION.md for completed work, verification, configuration and remaining publication facts.

## Working agreement
Prepare content changes and individual design images together now. After the user approves the designs, implement the approved copy and UI together. Mockup text is proposed editorial copy, not final legal language or a claim that new functionality already exists. This checklist tracks project work; it does not create separate running chats.

## Pricing findings
- Candidate practice source: server/services/practicePlans.js; presentation: client/src/Components/PracticalInterview/PracticePlansModal.js.
- $19.99 USD: 3 video + 3 coding interviews; one-time payment.
- $29.49 USD: 5 video + 5 coding interviews; one-time payment.
- $99 USD: unlimited video and coding interviews for one calendar month, no automatic renewal.
- Availability depends on configured Stripe prices and webhook secret. Price availability must come from the backend; screenshots do not establish production availability.
- Employer /pricing: 14-day $0 trial subject to eligibility, $249 monthly, $2,988 annually. Annual Stripe ID is a placeholder and must not be presented as purchasable.
- Employer landing component advertises $49/$99/$189 posting packages alongside $249/month; these differ from /pricing. Reconcile against an approved server-owned catalog before release.
- Do not show invented annual savings: $2,988 equals 12 × $249.
- Existing pricing links from candidate surfaces lead to the employer-oriented /pricing. Give candidate practice its own page and clear audience navigation.
- Proposed destinations: /pricing/candidate and /pricing/employer, with /pricing as a stable audience chooser or compatibility redirect. Keep existing success/cancel URLs and preserve role and purchase intent through auth.

## Task board
Each task has three deliverables: content revision, individual design image, then combined implementation after approval.

| ID | Page or flow | Content and implementation scope | Design artifact |
| --- | --- | --- | --- |
| 01 | employer landing | See scoped tasks below | 01-employer-landing.png |
| 02 | candidate practice pricing | See scoped tasks below | 02-candidate-practice-pricing.png |
| 03 | employer pricing | See scoped tasks below | 03-employer-pricing.png |
| 04 | terms | See scoped tasks below | 04-terms.png |
| 05 | security | See scoped tasks below | 05-security.png |
| 06 | privacy | See scoped tasks below | 06-privacy.png |
| 07 | about | See scoped tasks below | 07-about.png |
| 08 | contact | See scoped tasks below | 08-contact.png |
| 09 | blog list | See scoped tasks below | 09-blog-list.png |
| 10 | blog article | See scoped tasks below | 10-blog-article.png |
| 11 | post blog | See scoped tasks below | 11-post-blog.png |
| 12 | community | See scoped tasks below | 12-community.png |
| 13 | candidate signup | See scoped tasks below | 13-candidate-signup.png |
| 14 | employer signup | See scoped tasks below | 14-employer-signup.png |
| 15 | terms modal | See scoped tasks below | 15-terms-modal.png |
| 16 | privacy modal | See scoped tasks below | 16-privacy-modal.png |
| 17 | security modal | See scoped tasks below | 17-security-modal.png |
| 18 | practice landing | See scoped tasks below | 18-practice-landing.png |

## Scoped tasks and acceptance criteria
### T01 Employer landing
- [ ] Replace generic feature slogans with job posting, candidate discovery, assessments and hiring workflow.
- [ ] Reconcile pricing teaser with employer catalog; avoid unverified statistics, customer logos, testimonials and unlimited promises.
- [ ] Use the updated navy/blue/light UI, employer CTAs and a candidate cross-link.
- [ ] Design approval; then integrate content and layout together.

### T02 Candidate practice pricing
- [ ] Dedicated candidate pricing page; keep employer products out of candidate checkout.
- [ ] Show the three backend practice products with exact quantities, USD prices and one-time billing.
- [ ] State one calendar month and no automatic renewal for the unlimited pass.
- [ ] Confirm credit consumption, expiry, failed-session handling, tax and refund rules before final FAQ.
- [ ] Preserve selected plan through registration/login; render unavailable, loading, pending-payment, success and failure states.
- [ ] Use shared pricing data with the practice purchase modal; enforce server-side amounts and fulfillment.
- [ ] Design approval; then integrate copy, UI and role-aware links.

### T03 Employer pricing
- [ ] Reconcile landing and pricing-page catalogs with backend billing configuration.
- [ ] Display trial eligibility and actual entitlements, renewal timing, cancellation and refund terms.
- [ ] Disable annual purchase until configured; no invented discount or unsupported savings label.
- [ ] Handle trial active/expired, subscribed, restricted recruiter access and checkout failure states.
- [ ] Preserve role through auth and keep candidate practice purchases separate.
- [ ] Design approval; then integrate copy and UI.

### T04 Terms & Conditions
- [ ] One canonical document with general, candidate and employer sections; fix missing employer-terms reference.
- [ ] Cover accuracy, legitimate recruitment use, content rights, assessments, AI limitations, billing and suspension.
- [ ] Confirm operator, jurisdiction, eligibility, effective date and dispute provisions.
- [ ] Remove acceptance controls from the public article; reuse canonical content in the signup dialog.
- [ ] Design approval; final legal copy review; combined implementation.

### T05 Security Center
- [ ] Publish only verified controls and operational practices.
- [ ] Remove unsupported compliance, encryption, MFA, audit, testing and training claims.
- [ ] Include account safety, scam awareness and monitored reporting contact.
- [ ] Treat as information rather than a separate agreement.
- [ ] Design approval; control-owner verification; combined implementation.

### T06 Privacy Policy
- [ ] One canonical policy; separate candidate, employer and visitor sections as relevant.
- [ ] Map profile, resumes, applications, messages, recordings, transcripts, code, AI outputs, billing and logs.
- [ ] Specify recipients, visibility, AI providers, external services, retention, deletion and rights.
- [ ] Distinguish private practice from employer assessments and confirm actual access rules.
- [ ] Remove blanket compliance headings, placeholder dates and unsupported no-storage claims.
- [ ] Confirm legal entity, markets, cookies, provider controls, rights process and retention before publication.
- [ ] Design approval; final legal copy review; combined implementation.

### T07 About
- [ ] Describe the actual platform and distinct audience benefits.
- [ ] Verify company identity, address, testimonials and any performance claims.
- [ ] Use the existing modern UI and two clear audience CTAs.
- [ ] Design approval; combined implementation.

### T08 Contact
- [ ] Keep one shared page with candidate/employer/billing/privacy/security inquiry topics.
- [ ] Verify phone, office and monitored email; no invented SLA.
- [ ] Connect inquiry types to real routing; provide validation, loading, success and failure states.
- [ ] Add short contact-data notice and avoid asking for sensitive documents by default.
- [ ] Design approval; combined implementation.

### T09 Blog index
- [ ] Retain one resource hub with candidate and employer categories.
- [ ] Review actual backend articles; replace outdated or unsupported claims.
- [ ] Add genuine metadata, search/filter, loading/error/empty states and accessible article cards.
- [ ] Candidate landing: footer resource link initially; optional three-article section only when maintained content exists.
- [ ] Design approval; combined implementation.

### T10 Blog article
- [ ] Remove hard-coded author and fake comment count; use approved real metadata.
- [ ] Improve reading layout, contents, related resources and relevant audience CTA.
- [ ] Review rich HTML rendering and sanitization before release.
- [ ] Design approval; combined implementation.

### T11 Post blog / editorial workspace
- [ ] Restrict publishing on the server to authorized editors; verify the currently public route and posting endpoint.
- [ ] Add audience/category/summary/image-alt fields as supported by an updated schema.
- [ ] Draft, preview and review actions in mockup are proposed new functionality; implement persistence and permissions before exposing them.
- [ ] Validate uploads and sanitize article content; meaningful error and unsaved-change states.
- [ ] Design approval; combined implementation.

### T12 Community
- [ ] Replace sample people, sample posts and fixed engagement counts.
- [ ] Initial concept is an honest prelaunch page with functional resources links.
- [ ] A live forum is a separate feature requiring posts, comments, persistence, reporting, moderation, permissions and community guidelines.
- [ ] Do not ship decorative nonfunctional publishing or like controls.
- [ ] Design approval; combined implementation of agreed scope.

### T13–T14 Candidate and employer signup
- [ ] Shared visual component with explicit role selection and role-specific copy.
- [ ] Correct policy links; employer terms included for employer signup.
- [ ] Terms agreement and privacy acknowledgment separate from optional marketing permissions.
- [ ] Consistent completion for email, Google and Microsoft new-account flows.
- [ ] Server records accepted document versions, role and timestamp; validates required acceptance.
- [ ] Returning from policy dialogs preserves input; users can reopen either document after partial completion.
- [ ] Role changes update applicable terms; keep sign-in separate from new-account acceptance.
- [ ] Design approval; combined content, UI and backend changes.

### T15–T17 Terms, privacy and security dialogs
- [ ] Correct headings and content: Terms shows terms, Privacy shows privacy, Security shows security.
- [ ] Reuse versioned canonical text, with concise summaries linking to full documents.
- [ ] Role-aware summary, scrollable body, mobile layout, keyboard focus trap, Escape/close and focus return.
- [ ] Reading or closing a modal must not itself record agreement.
- [ ] Security is informational. Required agreement occurs on signup submission.
- [ ] Design approval; combined implementation.

### T18 Practice landing
- [ ] Explain both video and coding practice, relevant preparation steps and realistic feedback expectations.
- [ ] Replace outdated hero and nonfunctional CTA; align with modern candidate UI.
- [ ] Display candidate pricing teaser from the same catalog and link to the full candidate pricing page.
- [ ] Provide recording/processing notices at the actual assessment entry point.
- [ ] Design approval; combined implementation.

## Shared release tasks
- [ ] Extract shared public-page header, footer, buttons, typography and layout tokens from updated UI without leaking global CSS.
- [ ] Keep current URLs working with redirects if new canonical URLs are introduced.
- [ ] Verify mobile layouts, keyboard access, contrast, dialog focus and forms.
- [ ] Verify candidate/employer navigation, signed-out flow, both auth methods and pricing return paths.
- [ ] Verify catalog values and unavailable products, policy version storage and role restrictions.
- [ ] Set meaningful page titles, descriptions, canonical links and article metadata.
- [ ] Publish only approved legal content and verified business information.
- [ ] No live billing, content publishing or deployment in the concept phase.

## Content decisions still needed
Legal operator and governing law; operating markets; minimum account age; retention periods; employer access to practice and assessment data; provider settings; verified security controls; monitored reporting contacts; refund, tax, cancellation, credit-expiry and usage-limit policies; actual employer catalog; who can publish; community launch scope.

## Evidence and limitations
Source review only. No production Stripe account, deployment configuration, customer data or live content collection was inspected. Pricing values above are repository values, not verified live offers. The current workspace contains unrelated resume-builder changes; those are outside this task.
Policy references from initial review:
- https://www.ftc.gov/business-guidance/privacy-security
- https://www.hhs.gov/hipaa/for-professionals/covered-entities/index.html
- https://developers.openai.com/api/docs/guides/your-data

## Design delivery
Individual generated PNGs and the complete prompt set live beside this checklist. Image generation uses the built-in image_gen tool. Generated UI text is for visual review; this checklist and approved copy are the implementation source of truth.

