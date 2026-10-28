Implemented the five approved review fixes on 28 October 2026.

- Filled workspace action buttons use white labels/icons; disabled buttons retain readable text with a muted background.
- Logged-out employer landing header includes Job seeker linking to /.
- Community is available in both logged-out landing headers and removed from the employer workspace account menu.
- AI result columns have explicit widths, normal word wrapping, horizontal scrolling and a fixed action column. City and Work Authorization retain dedicated space and authorization values remain displayed.
- Candidate workspace uses its sidebar logo on desktop and keeps the header logo on mobile.

Validation: production webpack compilation passed; JSX checks and git diff whitespace checks passed. Local browser fixtures passed at 1440px and 390px: column widths and text, white primary-button labels, public/authenticated navigation visibility, account-menu Community removal, candidate branding and no page overflow. External services were mocked. No deployment performed.
