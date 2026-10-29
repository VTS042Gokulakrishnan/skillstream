# Demo booking email API

`POST /api/demo-booking` sends a demo request using Nodemailer. It does not reserve a calendar slot or store bookings. Use the deployed backend's domain in place of `https://yourdomain.com`.

## Deployment

1. Configure the variables in `demo-booking.env.example` in your backend hosting environment (or the server's `.env`). Use SMTP credentials supplied by your email provider; the sender must be authorized by that provider. Never commit real credentials.
2. Set `DEMO_BOOKING_TO` to your sales inbox. Set `DEMO_BOOKING_ALLOWED_ORIGINS` to comma-separated frontend origins, including protocol and port where applicable, without trailing slashes.
3. Deploy the updated server using your existing hosting workflow and restart the Node process. This endpoint uses the existing server and port; no additional dependency or database migration is needed. Ensure your reverse proxy forwards `/api/demo-booking` and the host can reach SMTP port 587 (STARTTLS) or 465 (TLS).
4. Submit a test request and verify arrival in the configured inbox. HTTP 200 means SMTP accepted the message, not guaranteed inbox delivery.

## Website integration

The GoHighLevel website origin is `https://demo.skillstremjobs.us`. Set the backend environment variable `DEMO_BOOKING_ALLOWED_ORIGINS=https://demo.skillstremjobs.us` (also included in the configuration example).

The website must POST to the deployed Node backend's URL. Hosting the website on GoHighLevel does not deploy this Express endpoint there; use `https://<backend-domain>/api/demo-booking` as the fetch URL below. For direct browser submissions, leave `DEMO_BOOKING_API_KEY` unset. Connect this request to your form's submit handler and replace the sample values with the visitor's field values.

```js
const response = await fetch("https://yourdomain.com/api/demo-booking", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "John Doe",
    email: "john@company.com",
    month: "Jan",
    day: "12",
    time: "2:30 PM",
    page: "Skill Stream AI demo",
    submittedAt: new Date().toISOString()
  })
});
const result = await response.json();
if (!response.ok) throw new Error(result.message);
// Display result.message to the visitor.
```

All seven fields are required strings. Months use Jan–Dec and times use a 12-hour clock with AM/PM. The requested date has no year or timezone in this payload; confirm these with the requester. `submittedAt` is client-supplied metadata; the email also includes a server-generated `receivedAt`.

## Webhook / other backend

Send the same JSON with `Content-Type: application/json`. For private server-to-server use, configure `DEMO_BOOKING_API_KEY` and include `Authorization: Bearer <your-key>`. When configured, the key is required on every POST. Keep it on your calling backend; never embed it in a public website. Leave it unset for direct public website submissions.

Requests without an Origin header work for backend callers. CORS is a browser restriction, not authentication. The endpoint allows five attempts per IP per ten minutes, in memory per process. Behind a proxy, configure Express trust proxy only for your actual trusted proxy topology; otherwise clients may share the proxy's limit. For multiple instances or larger public campaigns, enforce shared rate limits and bot protection at your gateway. There is no deduplication: retrying a request can send another email.

Responses: 200 sent, 400 invalid payload/JSON, 401 missing/invalid key, 403 disallowed origin, 413 oversized body, 415 wrong content type, 429 rate limited, 503 missing email configuration, 502 mail transport failure.

Run isolated tests with `node --test tests/demo-booking.test.js` from `server`. Tests use a mock mail transport and send no email.
