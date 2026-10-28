# Employer redesign requirements — revision 2

These requirements supersede conflicting visual details in the generated mockups. This delivery updates design artifacts; application behavior is not yet implemented.

## Initial profile setup

- This is first-time mandatory onboarding, separate from the later View Profile page.
- No sidebar, app navigation, global search, notification menu, workspace switcher, or links to other pages.
- The only submission/navigation action is Save & continue. No skip, cancel, draft, or back action.
- Keep all existing profile fields and supported upload/options available, using expandable sections where necessary. Retain existing validation rules; required asterisks in generated artwork are illustrative and must not silently change the data contract.
- Enforce completion at the shared route/access layer and protected employer APIs, using server-confirmed completion status. Hiding links or trusting localStorage alone is insufficient.
- Incomplete employers must return to setup on direct URLs, refresh, browser history, new tabs, and login. Do not render protected page content during the completion check.
- Save & continue validates and persists the profile; unlock the workspace only after the server confirms completion. Save failures retain values and keep access locked.

## Resume avatars

- Render the candidate photo when available and loadable.
- Missing or failed photos use the uppercase first letter of first name plus first letter of last name in a colored circular avatar: Rahul Sharma → RS; Neha Patel → NP.
- Use a stable background color with accessible contrast. A single available name uses its first letter; a wholly missing name uses a neutral fallback. Never fabricate a profile photo.

## Boolean search and existing options

- Expose AND (all skills), OR (any skills), and NOT (excluded skills) inputs and a synchronized editable Boolean expression. Define grouping, quoted phrases and validation consistently between frontend and backend before shipping.
- Preserve existing skill selection, custom skill creation, adding/removing skill rows, AND/OR operator choices, job-title input, searchable state/city multi-selects including All, dependent location behavior, distance in miles and its disabling rules, Search, and Reset.
- Preserve result selection, resume viewing, saving, Send Email, Add to Job with job selection, Forward Resume, Edit Details, and existing pagination/filtering behavior.
- Edit Details is available for exactly one selected candidate, matching current code. The generated image shows it beside a multiple-selection example; implementation must disable it in that state.
- Existing source reviewed: client/src/Pages/Candidates/CandidatesList.js. NOT and a directly editable Boolean query extend the currently visible AND/OR builder; wire them end-to-end rather than presenting unsupported controls.

## Feature parity across all employer pages

- Before implementing each page, inventory its active fields, filters, actions, menus, modals, role/plan permissions, uploads, downloads, validation, and API behavior.
- Map every existing option to its redesigned location. An image is a layout reference, not a complete feature specification or permission to remove controls.
- Keep controls reachable on narrow screens and preserve loading, empty, error, disabled and success states.
- Verify onboarding route/API restrictions, successful save/unlock and failed-save behavior; avatar missing/broken-photo cases; Boolean grouping and operators; existing search actions and permission gates.

## Revision prompts

Built-in image generation tool used with the original mockups as edit references.

### 01-profile-completion-v2

Edit the reference into INITIAL EMPLOYER ACCOUNT SETUP, not company profile management. Preserve SkillStream blue/navy/cyan typography and polished visual style. Completely REMOVE sidebar, all navigation links, global search, workspace switcher, notification bell, avatar menus, preview panel and Save as draft. Plain white top brand strip with non-clickable SkillStream wordmark only. Center a wide white setup form on icy pale background. Title 'Complete your profile', subtitle 'Complete your profile to unlock your employer workspace.' Small lock icon with 'Workspace access is locked until setup is complete'. Fields organized into Company details (company name, phone, website, established year, team size, primary industry, company description), Location (country, state, city, address), Optional details collapsed section for logo/cover uploads and social links. Keep field labels readable. Only ONE navigation/submission button, exactly 'Save & continue' at bottom right. No cancel, skip, back, save draft, exit, dashboard or other page links. Controls for selecting values are fine. This is a first-time required setup form, not a public company profile. Landscape high fidelity UI image.

### 02-resume-search-v2

Edit reference Resume search screen preserving SkillStream navy sidebar and white/blue design. Add prominent Boolean search panel below title: separate labeled input fields 'All these skills (AND)' value React, TypeScript; 'Any of these skills (OR)' value Next.js, Redux; 'Exclude skills (NOT)' value PHP. Show editable 'Boolean query' input: React AND TypeScript AND (Next.js OR Redux) NOT PHP. Add skill and remove-skill controls with AND/OR operator selection and a small Add custom skill action. Keep Job title input, searchable multi-select State and City with All option, Distance (miles) slider, Search and Reset controls, experience, notice period, salary filters. Use efficient two-column layout filters left and candidate results right. Every candidate must have circular avatar: first Aisha Khan real photo, second Rahul Sharma NO PHOTO instead white 'RS' in purple circle, third Neha Patel NO PHOTO instead 'NP' in teal circle. Never blank avatar or silhouette. Keep View resume and Save on cards. Show bulk selection checkboxes and action toolbar 'Send email', 'Add to job', 'Forward resume', 'Edit details'. Keep count, sort and pagination. Professional crisp readable dense layout. 1600x1100 landscape if needed to accommodate all controls.

