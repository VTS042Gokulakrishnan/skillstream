# Applicant review updates

- Shared drawer styling for shortlisted applicants and interviews; independent video/coding sections and labelled actions.
- Interview type and status dropdowns default to All; applicant rows sorted by original application date descending.
- One invitation form for video/coding, configurable validity, preserved valid invitations, archived completed attempts on retake.
- Drawer polling every 5 seconds; interview listing polling every 15 seconds while visible.
- Explicit video/PDF and per-recipient email statuses stored in the applicant schema. Failed email retry skips recipients already sent and checks employer access.
- Historical records without processing metadata show Not reported rather than inferred email success.

Validation: Node service tests, employer UI tests, full application compilation, and browser fixtures. Browser API calls are mocked; no production database, SMTP, AI or storage calls were made. Deploy the backend and frontend together for the new fields and retry endpoint.

Retakes use the existing invitation route and archive prior result links; invitation links are not versioned. Background processing still uses the existing server process (not a durable job queue).
