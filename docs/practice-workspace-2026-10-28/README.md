# Practice workspace review

Implemented in practice pages only: compact setup form, camera/device checks, video question and response panels, embedded coding question, coding editor/output, submission confirmation, loading/retry and result layouts. Practice selection cards also have updated spacing and surfaces.

- Preserved existing role/resume fields, permissions, language options, code execution and submission handlers.
- Primary actions remain in the visible workspace. Long question, response, editor and output content scroll locally when needed.
- Shared BrandLoader replaces the practice spinner.
- Desktop viewport checks: 1440x900, 1366x768 and 1280x720. Mobile: 390x844.
- Browser fixtures exercise the real React components and Monaco editor, with mocked APIs; code execution returns a fixture value. No real camera recording, speech recognition, upload, payment or assessment submission was performed.
- Layout assertions cover setup continuation, device access, instructions, next question, final coding submission, video confirmation, loading and results. JSON measurements accompany screenshots.
- Application compiled with the repository's unminified production webpack check. Existing Browserslist/Babel dependency warnings remain.
- Mocked video sessions emit expected unsupported-audio errors because the test does not provide speech audio.

Open index.html to compare desktop and mobile screenshots. Main assessment pages are unchanged.
