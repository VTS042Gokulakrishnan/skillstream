# Design review package

18 individual image concepts generated with the built-in image_gen tool. All await user review; no implementation approval is recorded.

- [Open gallery](index.html)
- [Task checklist](TASKS.md)
- [Content draft](CONTENT-DRAFT.md)
- [Prompt set](prompts.json)

## Individual images

- [01 — Employer landing](01-employer-landing.png)
  - Review note: Align the landing teaser and full employer catalog. Sample pipeline data is illustrative. Confirm billing/cancellation terms; use 2026 in the footer.
- [02 — Candidate practice pricing](02-candidate-practice-pricing.png)
  - Review note: Verified repository prices and quantities. Replace generated “Most popular” with “More practice”; availability must come from the backend.
- [03 — Employer pricing](03-employer-pricing.png)
  - Review note: Annual checkout is currently unconfigured. Remove generated “risk-free” claim. Confirm trial entitlements and renewal wording.
- [04 — Terms & Conditions](04-terms.png)
  - Review note: Layout concept only. Legal entity, jurisdiction and effective date are unresolved. Use the written content draft rather than generated legal clauses.
- [05 — Security Center](05-security.png)
  - Review note: Publish only verified safeguards. Replace unverified “most opportunities are genuine” and platform-only communication wording.
- [06 — Privacy Policy](06-privacy.png)
  - Review note: Visibility, providers, retention and rights need factual confirmation. Do not publish the generated summary as the final policy.
- [07 — About Us](07-about.png)
  - Review note: Use verified product capabilities. Generated people are illustrative, not actual employees or testimonials.
- [08 — Contact Us](08-contact.png)
  - Review note: Contact details come from the repository. Help Center CTA is only appropriate if a real destination exists; otherwise remove it.
- [09 — Blog / Resources](09-blog-list.png)
  - Review note: Proposed article topics, not live published content. Metadata and destination links need real sources.
- [10 — Blog article](10-blog-article.png)
  - Review note: Draft article content is in CONTENT-DRAFT.md. Correct the generated STAR expansion to situation, task, action, result.
- [11 — Post blog / Editor](11-post-blog.png)
  - Review note: Draft/review persistence and authorization are proposed implementation work. Do not expose unsupported controls.
- [12 — Community](12-community.png)
  - Review note: Prelaunch concept; no fake posts, counts or publishing form. A live community requires separate feature work.
- [13 — Candidate signup](13-candidate-signup.png)
  - Review note: Require explicit acceptance for all new-account methods. Preserve form entries when opening policy links.
- [14 — Employer signup](14-employer-signup.png)
  - Review note: Same shared registration component with employer terms and authority wording. Background is illustrative.
- [15 — Terms modal](15-terms-modal.png)
  - Review note: Use a single Return to signup action; remove redundant buttons and technical acceptance-recording note. Reuse actual signup background.
- [16 — Privacy modal](16-privacy-modal.png)
  - Review note: Do not promise deletion in account settings unless supported; describe the verified rights-request process. Reuse actual signup background.
- [17 — Security modal](17-security-modal.png)
  - Review note: Informational dialog, no mandatory acceptance. Background is illustrative; use approved signup copy.
- [18 — Practice landing](18-practice-landing.png)
  - Review note: Reuse the same candidate practice catalog. Standardize “coding interviews” rather than implying one question equals one credit.

## Status

- [x] Source review and pricing distinction.
- [x] Create project task checklist with acceptance criteria.
- [x] Prepare content proposals and unresolved factual decisions.
- [x] Generate and visually inspect 18 separate concepts.
- [x] Save concepts to this project directory.
- [ ] User design approval / requested revisions.
- [ ] Confirm operational and legal details.
- [ ] Implement approved content and design together.
- [ ] Verify responsive behavior, accessibility, role flows and billing/policy handling.

Images are concept artwork, not screenshots of an implemented site. Small generated text and nav variations are superseded by the written draft and review notes. Mobile states are part of implementation acceptance criteria, not separate mockup deliverables in this package.

