# VSI Volunteer Self-Service Portal — setup and release checklist

The portal is implemented at `/volunteer/portal` and uses a one-time code sent to the volunteer's registered email. It is intended for approved volunteers with an assigned VSI volunteer ID.

## Required environment variables

Configure these in the Vercel project for the preview environment first:

- `VOLUNTEER_PORTAL_SESSION_SECRET`: a unique random secret of at least 32 characters, separate from the admin session secret.
- `RESEND_API_KEY`: API key for the Resend email service.
- `VOLUNTEER_PORTAL_FROM_EMAIL`: a verified sender address in Resend, for example `VSI Volunteer Portal <portal@your-verified-domain>`.

Do not commit actual secrets. Do not reuse the admin password or admin session secret.

## Database migration

Apply `migrations/20261010_create_volunteer_self_service_portal.sql` using the project's controlled database migration process before enabling the portal. It creates tables for one-time challenges and revocable sessions. The migration is not run by a request handler.

## Security behavior

- A volunteer must supply their VSI ID and the email already registered on their approved application.
- Verification codes expire after 10 minutes, are single-use, and allow at most five attempts per challenge.
- Requests are rate-limited per IP and per ID/email combination.
- Session tokens are random, stored as hashes in the database, and held in an HttpOnly cookie with a two-hour expiry.
- The portal API returns only the signed-in volunteer's profile and statement; it does not expose the admin finance endpoint.
- Personal information such as date of birth, emergency contacts, safeguarding disclosures and reference contacts is not displayed.
- Finance is read-only. Expected contributions are ZMW 30 per month from the application-submission month through the current calendar month. The statement compares this against recorded membership payment amounts. It does not currently automatically apply waivers or adjustments; volunteers are told to contact VSI administration to reconcile missing records.

## Preview validation before production

1. Apply the migration to a non-production database.
2. Set the three environment variables in the preview environment and verify the sender domain in Resend.
3. Test a valid approved volunteer, wrong ID/email, pending/rejected application, expired code, incorrect code, five failed attempts, rate limiting, and sign-out/revocation.
4. Reconcile a sample statement against the admin finance ledger, including a zero-payment volunteer, a fully paid volunteer, a partial payment, and any overpayment.
5. Confirm a volunteer cannot request or read another volunteer's data by changing request payloads or URLs.
6. Confirm all endpoints return `Cache-Control: no-store` for personal data and that logs contain no verification codes, email addresses, or session tokens.
7. Do not merge to `main` or deploy to production until preview checks pass and the historical payment data has been reconciled.
