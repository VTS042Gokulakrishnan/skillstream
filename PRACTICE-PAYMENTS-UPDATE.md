# Candidate practice payments update

## Agreed behavior

- No free practices for new or existing candidates after migration.
- $19.99 USD adds **3 video and 3 coding** interviews.
- $29.49 USD adds **5 video and 5 coding** interviews.
- $99 USD buys one calendar month of unlimited video and coding interviews, with no automatic renewal. An additional pass extends an active pass by one calendar month. Month-end dates clamp to the last day of the next month, in UTC.
- Pack credits do not expire. Existing credits remain available while unlimited access is active and resume being used after it expires.
- Before the first purchase, no balances are displayed. The Purchase Practice Interviews button opens the plans modal. Only selecting a plan opens Stripe Checkout. Success and cancellation return directly to `/practiceInterview`.
- Access is granted only after server-side payment verification. The webhook and return-page verification can run concurrently without applying a payment twice.

## Copy these files to the deployed repositories

Client (paths relative to `client/`):

```text
src/Pages/Candidates/Candidates-Dashboard/PracticeAssessment.js
src/Components/PracticalInterview/PracticePlansModal.js          (new)
src/Components/PracticalInterview/practiceApi.js                 (new)
src/Components/PracticalInterview/SetupForm.js
src/Components/PracticalInterview/PracticalInterview.js
src/Components/PracticalInterview/PracticeInterviewLanding/CodingPractice.js
src/Components/PracticalInterview/PracticeInterviewLanding/PracticeInterviewLanding.js
```

Server (paths relative to `server/`):

```text
app.js
models/candidateModel.js
controller/Auth.js
controller/PracticalInterview.js
controller/subscription.js
router/PracticalInterview.js
controller/practicePayments.js                                (new)
services/practicePlans.js                                     (new)
services/practiceBilling.js                                   (new)
services/practiceSessions.js                                  (new)
scripts/reset-practice-balances.js                            (new)
tests/practice-payments.test.js                               (new)
practice-payments.env.example                                 (new)
```

No new production package dependencies. Existing employer checkout URLs and billing logic remain in place. Candidate checkout through the old subscription endpoints returns a message directing users to Practice Assessment. The old shared webhook no longer resets candidate balances.

## Stripe configuration

Create three **one-time** USD prices in the same Stripe account as the existing server `STRIPE_API_KEY`. Do not create a recurring price for the month pass.

| Price | Server environment variable |
| --- | --- |
| $19.99 | `STRIPE_PRACTICE_3_PRICE_ID` |
| $29.49 | `STRIPE_PRACTICE_5_PRICE_ID` |
| $99.00 | `STRIPE_PRACTICE_MONTH_PRICE_ID` |

Create a dedicated webhook endpoint:

```text
https://YOUR-SERVER/api/v1/practiceInterview/payments/webhook
```

Subscribe it to `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Put its signing secret in `STRIPE_PRACTICE_WEBHOOK_SECRET`. Keep the existing employer webhook configured separately. The new endpoint accepts raw JSON before the normal JSON parser.

Verify `client` is the deployed frontend origin, and `MONGODB_URI` is the intended database. Restart/redeploy the server after changing environment variables. Prices remain unavailable in the modal until configured; Stripe price amount, currency, and one-time type are also validated before checkout. No Stripe price IDs are needed in client code.

## Reset existing balances

Run from `server/`, with its usual dependencies installed and the intended `MONGODB_URI` configured. **The script has not been run against your database.**

1. Pause practice starts, new candidate purchases and payment fulfillment during the deployment maintenance window. Let old practice sessions finish first. Reconcile/expire outstanding old $15 Checkout sessions so a late old payment does not expect credits from the retired handler.
2. Deploy the server and configure the new Stripe prices/webhook while practice traffic remains paused.
3. Preview:

   ```text
   node scripts/reset-practice-balances.js
   ```

4. Verify the displayed database name and candidate count, then apply:

   ```text
   node scripts/reset-practice-balances.js --apply
   ```

5. Deploy the client, test purchases in Stripe test mode first, then reopen practice traffic and webhook delivery.

The script snapshots practice fields in `practice_balance_backup_v1`, clears both balances, clears unlimited access and practice sessions, and hides balances until the next purchase. It preserves profiles, assessment history and processed payment IDs. The `practice_migrations` record prevents a completed migration from being applied again, including against candidates created afterward. An interrupted run resumes from its original backup and refuses to overwrite changed balances.

Rollback preview and apply:

```text
node scripts/reset-practice-balances.js --rollback
node scripts/reset-practice-balances.js --rollback --apply
```

Rollback only restores candidates whose reset fields and payment IDs have not changed since reset. It skips candidates with new purchases/activity. Do not delete the backup or migration collections during rollout. Run only one migration process at a time. Rollback restores old balance fields; restoring free-access behavior also requires reverting the application changes.

## Interview accounting and failure behavior

A pack credit is reserved when the candidate submits the setup form. Failed setup cancels the reservation. A failed initial AI request also refunds it. Unstarted reservations expire after two hours and are reclaimed on the next dashboard visit or start request. Once the initial interview response succeeds, that attempt consumes the reserved credit; abandoning a started interview does not refund it. Unlimited sessions never consume pack credits.

Practice sessions are valid for two hours. Repeated initial requests return the same initial response. Video sessions allow at most 15 follow-up question requests. Submissions use a lock and save history once; retries do not charge another credit. Failed submissions remain retryable within the session window. A server crash during submission leaves a lock that becomes retryable after one hour. Deleting a report does not restore a credit. New video/PDF object keys include the session ID so one practice does not overwrite another.

## Verification

Completed locally: **12 integration tests passed** against a temporary MongoDB instance; syntax validation passed for all 19 changed JavaScript files. The actual dashboard/modal components were bundled in an isolated browser preview with a mock API to check hidden pre-purchase balances, modal pricing, payment return, both paid balances, and unlimited expiry. A full client production build and real Stripe/AI/S3/SMTP end-to-end tests have not been run.

The integration suite requires a disposable MongoDB database in `PRACTICE_TEST_MONGODB_URI`:

```text
node --test tests/practice-payments.test.js
```

Never point that variable at production. The suite covers zero/free balances, paid packs for both types, payment retries, invalid payments, calendar-month expiry, concurrent starts, setup refunds, submission deduplication, signatures and checkout redirects.

Before release, complete one Stripe test-mode checkout for each plan and check the deployed frontend return URL, webhook delivery, both real AI interview flows, upload/feedback delivery, and employer billing. Local isolated tests do not verify external AI, S3, SMTP or Stripe account configuration.

Stripe references: [Checkout fulfillment](https://docs.stripe.com/checkout/fulfillment) and [webhook signature verification](https://docs.stripe.com/events/manage-webhook-endpoints#signature-errors).
