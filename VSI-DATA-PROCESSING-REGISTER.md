# VSI Data Processing Register

**Organisation:** Visionary Students Initiative (VSI), Zambia  
**System:** VSI Website / Volunteer Management System  
**Version:** 1.0  
**Prepared:** 2026-09-05  
**Status:** Internal compliance baseline — requires management/legal validation

> This register maps the personal-data processing visible in the current VSI website codebase. It is an operational compliance document, not legal advice. The retention periods below are proposed VSI operating periods, not claims that Zambian law prescribes those exact periods.

## 1. Processing inventory

| Processing area | Personal data collected/processed | Purpose | Storage / system | Access | Risk | Current status |
|---|---|---|---|---|---|---|
| Volunteer application | Full name, date of birth, nationality, gender, faith/religion, email, phone, province, district, constituency, ward, occupation/status, education, volunteer category, skills, availability, hours/week, motivation, volunteering elsewhere, past volunteer positions, references, criminal-conviction disclosure/details, disability status/certificate, profile photo, emergency contact, membership-fee acknowledgement, consent | Volunteer recruitment, suitability review, safeguarding, communication, volunteer administration | Neon/PostgreSQL volunteer application record; private Vercel Blob for profile photo | Authorised VSI/admin personnel | **High** — includes sensitive data, identity data and potentially child data | **AMBER** |
| Volunteer profile | Approved volunteer identity/profile information and associated records | Volunteer management and service administration | Neon/PostgreSQL and private Blob media | Authorised admin personnel; limited public display where intentionally published | High | AMBER |
| Volunteer activity submission | Volunteer ID, registered email/phone used for verification, activity code/name, project, directorate, SDG alignment, AU Agenda 2063 alignment, date, location, facilitator, start/end time, calculated hours, contribution/role, verification state/token | Record and verify volunteer service | Neon/PostgreSQL activity register | Volunteer submitting own record; authorised reviewers/admin | Medium-High | AMBER |
| Professional development | Development/training records, dates, provider/programme and hours, linked to volunteer | Record development received through VSI | Neon/PostgreSQL professional-development records | Authorised admin personnel | Medium | AMBER |
| Event registration | Full name, designation, email, phone, organisation, gender, disability, province, district, residential area, event and fee selection | Event registration, participation planning and event administration | Neon/PostgreSQL event registration records | Authorised event/admin personnel | High where disability/sensitive information is involved | AMBER |
| Profile/media photos | Identifiable volunteer images | Identity/profile administration and, where separately authorised, public communications | Vercel Blob; private profile-photo storage is implemented for volunteer applications | Admin; public only where intentionally published through approved media workflows | Medium-High | AMBER |
| Website cookie/consent | Cookie-consent preference stored in browser local storage | Remember website privacy/cookie choice | User browser localStorage | User/browser only | Low | GREEN |
| Rate-limiting security data | Hashed client-IP rate-limit key and timestamp | Abuse prevention and form protection | Neon/PostgreSQL rate-limit tables | System/admin operators as needed | Medium | GREEN/AMBER |
| Admin authentication | Admin credentials, session/authenticator data and security events associated with admin access | Protect privileged system access | Application auth/session mechanisms and provider infrastructure | Authorised administrators only | High | AMBER |

## 2. Volunteer application — field-level assessment

The current application form explicitly collects the following fields. The application endpoint validates and stores these values in `volunteer_applications` and stores the profile photo in private Vercel Blob storage. The current implementation also creates an IP-derived HMAC rate-limit key rather than storing the raw IP as the rate-limit identifier.

### Ordinary personal data

- Full name
- Date of birth
- Nationality
- Email address
- Phone number
- Province
- District
- Constituency
- Ward
- Current occupation/status
- Education/qualification
- Volunteer category
- Skills/experience/qualifications
- Availability
- Expected volunteer hours per week
- Motivation
- Current volunteering elsewhere and organisation/role details
- Past volunteer positions/organisations
- Reference name, organisation, phone and email
- Emergency contact name and phone
- Profile photograph

### Potentially sensitive / higher-risk data

- **Gender** — personal data and potentially sensitive depending on the applicable legal classification and processing context.
- **Faith/religion** — should be treated as sensitive personal data and access-restricted.
- **Criminal conviction and offence details** — high-risk data requiring a documented purpose, restricted access and lawful handling.
- **Disability information and certificate** — health/disability-related information requires heightened protection and minimisation.
- **Date of birth** — especially important for age determination and children's-data controls.
- **Profile photograph** — personal data; do not treat an ordinary photograph as biometric data unless it is technically processed for unique identification.

## 3. Children's data

The system collects date of birth and therefore can identify whether an applicant may be a child. This makes age handling a specific compliance control rather than an assumption.

### Required VSI controls

- Define the minimum age for each volunteer category.
- If children are accepted, implement an age-verification and parental/guardian-consent workflow appropriate to the role.
- Record who gave parental/guardian consent, when, and for what processing.
- Do not expose children's profiles or photographs publicly by default.
- Restrict children's data to personnel who need it for the stated purpose.
- Apply enhanced safeguarding procedures for child-facing roles.
- Define a separate retention/disposal rule for children's records.

**Current assessment: RED/CRITICAL TO VERIFY.** The current application has a DOB and a general applicant consent checkbox, but the inspected form does not show a dedicated parental/guardian consent mechanism.

## 4. Volunteer photo processing

### Current technical controls

- The application accepts an image for the profile picture.
- The browser compresses the image before submission.
- The server validates image data and limits size.
- The profile photo is stored using Vercel Blob with `access: "private"`.
- The stored object uses a volunteer-specific path with a random suffix.

### Required governance controls

- Document the purpose of the profile photo.
- Obtain an appropriate photo/privacy notice and, where required, separate public-media consent before public publication.
- Maintain a record of withdrawal of public-media consent.
- Ensure private profile images are not exposed through public URLs or unauthorised API routes.
- Define deletion/replacement procedures when a volunteer leaves or requests deletion, subject to lawful retention requirements.

**Current assessment: AMBER.** Technical private storage is a positive control; the consent/publication governance needs formalisation.

## 5. Volunteer service/activity processing

The public activity submission flow verifies a volunteer using the VSI Volunteer ID plus a registered email or phone number before permitting submission. It records activity code/name, project, directorate, SDG and AU Agenda 2063 alignment, date, location, facilitator, start/end times and the volunteer's contribution. Hours are calculated from start/end time and the record remains unverified until VSI review.

### Compliance controls to formalise

- Purpose: evidence of actual VSI service.
- Verification status and reviewer identity should be retained as audit information.
- Location should be minimised to what is actually needed.
- Facilitator names should be handled as personal data where identifiable.
- Do not expose service records publicly unless there is a documented purpose and lawful basis.
- Retain the service record according to the approved VSI retention schedule.

**Current assessment: AMBER.** The workflow already contains identity verification and an explicit verification state.

## 6. Professional development

Professional-development hours are maintained separately from verified service hours. They should remain a distinct processing category because they evidence development received through VSI rather than volunteer service delivered to VSI.

Recommended controls:

- Keep development provider/programme/date/hours accurate.
- Record verification status and reviewer where applicable.
- Avoid collecting certificates or training documents unless necessary.
- If certificates are uploaded in future, classify them separately and apply document-storage and retention controls.

## 7. Event registration

The current event registration form collects:

- Full name
- Designation
- Email
- Phone
- Organisation/institution
- Gender
- Disability status
- Province
- District
- Residential area
- Event and fee selection

The registration endpoint validates the event, fee option, email and phone format, applies rate limiting and inserts the registration into `vsi_event_registrations`.

**Current assessment: AMBER.** Disability information should be specifically justified, access-restricted and included in the processing register. Consider whether exact residential area is necessary for every event.

## 8. Database processing

The application uses PostgreSQL/Neon for structured operational records. Current code references include volunteer applications, activity records, professional development records, event records and rate-limit records.

### Required database controls

- Maintain a table-level inventory of all personal-data tables.
- Identify database owners/controllers and authorised administrators.
- Apply least-privilege database credentials.
- Separate production from development/test data.
- Never copy live volunteer data into development environments unless formally authorised and protected.
- Maintain backup retention and restoration procedures.
- Document deletion/anonymisation capability for each personal-data table.
- Maintain an audit trail for privileged changes where practical.

**Current assessment: AMBER.** The application architecture is structured, but formal governance around retention, deletion, access matrix and audit logging still needs completion.

## 9. Third-party processors / service providers

The current codebase visibly uses:

- **Vercel** — application hosting/deployment infrastructure.
- **Vercel Blob** — profile-photo/object storage.
- **Neon/PostgreSQL** — production structured database.
- **GitHub** — source-code repository and development workflow.
- Browser localStorage — cookie/privacy preference storage on the user's device.

VSI should maintain a processor register containing, for every provider:

1. Provider name
2. Service used
3. Data categories processed
4. Processing purpose
5. Hosting/data-region information
6. International transfer assessment
7. Contract/DPA status
8. Security commitments
9. Sub-processors where relevant
10. Deletion/return procedure
11. Incident/breach notification route
12. Contract owner at VSI

**Current assessment: RED/CRITICAL TO VERIFY** until the provider contracts, data locations and international-transfer position are documented.

## 10. International processing

The technical stack may involve infrastructure or support services outside Zambia. VSI should not assume that hosting location is equivalent to legal compliance.

For each processor, document:

- where the data is stored;
- where backups are stored;
- where support personnel may access data;
- whether sub-processors are involved;
- the lawful mechanism/assessment for any cross-border transfer;
- contractual safeguards and security measures.

## 11. Proposed retention schedule

These are **VSI proposed operational starting points**, not statutory periods. Management/legal counsel should approve them against safeguarding, finance, grant and other obligations.

| Record | Proposed starting retention | Disposal trigger |
|---|---:|---|
| Unsuccessful volunteer application | 2 years | End of retention period unless legal/safeguarding hold exists |
| Approved volunteer master profile | Active relationship + 2 years | Relationship ends and retention period expires |
| Volunteer service/activity records | Active relationship + 2 years | Retention period expires |
| Professional development records | Active relationship + 2 years | Retention period expires |
| Public-media consent | Duration of publication + 2 years | Consent withdrawn/publication ends + period |
| Event registration | Event completion + 2 years | Retention period expires |
| Data-subject requests | 3 years | Retention period expires |
| Consent records | Duration of processing + 2 years | Retention period expires |
| Security/breach records | 5 years | Retention period expires |
| Rate-limit records | Minimum period necessary for abuse prevention; review quarterly | No longer operationally necessary |
| Backups | Defined rolling period approved by VSI | Backup expires/rotates |
| Financial records | Per applicable finance/legal/grant requirement | Lawful retention period expires |

## 12. Data-subject rights workflow

VSI should establish one documented route for requests concerning:

- access to personal data;
- correction/rectification;
- information about processing;
- objection/restriction where applicable;
- deletion where legally available;
- withdrawal of consent where consent is the processing basis;
- complaints/escalation.

Each request should receive:

1. Date/time received
2. Requester identity-verification step
3. Data subject / record involved
4. Request type
5. Person responsible
6. Decision/action
7. Date completed
8. Reason where refused or limited
9. Evidence of response

## 13. Breach and security-incident procedure

VSI should maintain a written incident procedure covering:

1. Detect and contain.
2. Preserve relevant evidence and logs.
3. Determine what data and people are affected.
4. Assess risk and legal reporting requirements.
5. Escalate internally to the designated data-protection/security responsible person.
6. Make required notifications within applicable statutory timeframes.
7. Communicate with affected data subjects where required.
8. Record the incident, decision-making and corrective action.
9. Review controls after closure.

The register must include a **24-hour escalation/notification decision control** because the Data Protection Act contains a 24-hour controller notification requirement for qualifying personal-data security breaches. VSI should confirm the exact notification workflow with its designated data-protection officer/legal adviser.

## 14. Data Protection Commissioner requirements to verify

VSI management should formally confirm:

- Whether VSI is required to register as a data controller and/or processor.
- The categories of processing covered by the registration.
- Whether a Data Protection Officer has been appointed where required.
- Whether required DPO/contact details are current.
- Whether annual audit requirements apply and are being met.
- Whether records of processing are maintained.
- Whether cross-border processing/transfer requirements apply.
- Whether breach-reporting procedures and records meet the applicable requirements.

## 15. Access-control matrix — minimum recommended model

| Role | Volunteer master data | Sensitive data | Photos | Activity records | Event records | Delete/export |
|---|---|---|---|---|---|---|
| System administrator | Yes | Yes, need-to-know | Yes | Yes | Yes | Restricted |
| Volunteer reviewer | Yes | Limited | Limited | Yes | Limited | No |
| Event officer | Limited | Event-required only | No/limited | No | Yes | No |
| Communications/media | No | No | Only approved/public-media assets | No | No | No |
| Volunteer | Own data only | Own data only | Own photo only | Own submissions | Own registrations where supported | Request only |

This matrix must be translated into actual application permissions and checked against the production admin roles.

## 16. Immediate RED actions

1. **Confirm DPC registration status.**
2. **Formally designate the VSI data-protection/DPO responsibility.**
3. **Implement child/parental consent and age-handling controls if under-18 volunteers or participants are accepted.**
4. **Approve the retention schedule and implement deletion/anonymisation jobs or documented manual procedures.**
5. **Complete the third-party processor/DPA and international-transfer register.**
6. **Implement a formal data-subject request register and workflow.**
7. **Implement a formal breach register and 24-hour escalation procedure.**
8. **Formalise photo/public-media consent separately from ordinary volunteer application consent.**
9. **Complete a production data inventory from Neon and confirm every personal-data table/column.**
10. **Confirm admin access and audit logging against the access matrix.**

## 17. Current technical strengths observed

- Volunteer applications have server-side validation.
- Volunteer application submissions have IP-based rate limiting using an HMAC-derived key.
- Profile pictures are stored as private Vercel Blob objects.
- File-size/type checks are present for profile photos and disability certificates.
- Activity submission requires volunteer identity verification before submission.
- Activity records have a verification state before they count toward service totals.
- Event registration validates the event and fee option server-side and applies rate limiting.
- The website now has dedicated Privacy Policy and Data Protection pages and a cookie/privacy notice.
- Admin authentication includes an authenticator/2FA step.

## 18. Evidence sources reviewed

This baseline was prepared from the current `main` branch code, including:

- `app/volunteer/apply/page.js`
- `app/api/volunteers/route.js`
- `app/activities/submit/page.js`
- `app/events/EventRegistration.js`
- `app/api/events/register/route.js`
- current application tree and API tree

The volunteer application source shows the actual collection of DOB, nationality, gender, faith, contact/location, references, criminal-conviction disclosure, disability/certificate, photo, emergency contact, membership-fee acknowledgement and consent. fileciteturn68file0L2-L10

The volunteer API confirms server-side validation, storage in the volunteer application record, private Vercel Blob storage for profile photos and rate-limiting based on an HMAC-derived client-IP key. fileciteturn69file0L2-L10

The activity submission flow verifies volunteer identity using the Volunteer ID plus a registered contact detail, then records activity/project/directorate/alignment information and activity details before review/verification. fileciteturn70file0L2-L10

The event registration flow collects participant identity/contact, organisation, gender, disability and location information and stores registrations in `vsi_event_registrations` after server-side validation and rate limiting. fileciteturn73file0L2-L10 fileciteturn74file0L2-L10

## 19. Approval

**VSI management approval required:**

- Data Protection Officer / responsible person: ____________________
- Approved by: ____________________
- Date: ____________________
- Retention schedule approved: Yes / No
- Processor register approved: Yes / No
- Child-data procedure approved: Yes / No
- Breach procedure approved: Yes / No
- DPC registration status confirmed: Yes / No
