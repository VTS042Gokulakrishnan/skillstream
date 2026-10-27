# Practice demo access

From `server/`, using its configured `MONGODB_URI`, run:

```text
node scripts/manage-practice-demo.js
```

Enter the candidate email (case-insensitive exact match). The script displays the database and candidate identity, then asks for grant/revoke. Grant defaults to **10 interviews shared across video and coding, valid for 7 days**; you can enter another allowance/duration. Type `UPDATE` to write that candidate's document. No candidate is created; duplicate matches are refused.

Grant replaces the previous demo allowance. Revoke disables demo access. Neither operation changes paid credits, Stripe records, or interview history. Refresh the Practice Assessment page afterward. No Stripe configuration is needed for demo sessions, but the existing interview/AI services must be configured.

Demo access is stored in `Candidate.practiceDemoAccess`, including an internal grant ID. Demo is used before paid access. Reservations atomically consume one shared interview; cancelled/failed setup refunds only its original grant. Started sessions are not refunded. Expiry/revocation/replacement stops existing demo sessions on their next server request; finish demonstrations before changing a grant. Exhausted/expired demo access falls back to paid entitlement for new sessions, otherwise the purchase modal is available.

Session records carry `demoGrantId`; completed interview history also records `accessSource: "demo"` and the grant ID in the existing history arrays. Profile updates cannot write practice fields. No public endpoint grants demo access. Existing accounts default to no demo access; no bulk migration is required.

Copy the changed server model, practice services, candidate controller, script, and client PracticeAssessment component to your repositories. Deploy both server and client. The legacy US-Candidate model is not used by the practice API and is unchanged.

The script has not been run against your database.
