# VSI least-privilege database roles

The production application uses separate server-side PostgreSQL logins for sensitive workflows. Database passwords are provisioned in Neon and stored only as encrypted Vercel environment variables. Never commit connection strings or passwords.

| Workflow | Vercel environment variable | Database login | Scope |
| --- | --- | --- | --- |
| General VSI application | `DATABASE_URL` | `vsi_app` | General admin and programme operations |
| Safeguarding administration | `SAFEGUARDING_DATABASE_URL` | `vsi_safeguarding_app` | Safeguarding cases, notes, audit, and safeguarding accounts |
| Data protection administration | `DATA_PROTECTION_ADMIN_DATABASE_URL` | `vsi_data_protection_app` | Data-protection requests, incidents, consent, retention, and required volunteer retention operations |
| Finance administration | `VOLUNTEER_FINANCE_DATABASE_URL` | `vsi_finance_app` | Membership payments, donations, other payments, and spending |
| Volunteer self-service | `VOLUNTEER_PORTAL_DATABASE_URL` | `vsi_volunteer_portal_app` | Portal sessions and challenges plus read-only volunteer profile, activity, and payment views |

Each application login is a `NOBYPASSRLS` member of a non-login access role. Direct broad grants and default grants are revoked after role provisioning. Access is limited by explicit table grants and RLS policies.

Public submission logins remain separate from administrative logins. In particular, the safeguarding intake role can submit reports and use its rate-limit table but cannot read safeguarding reports.

## Migration order

1. Apply `20261122_sensitive_roles_stage.sql` to add RLS policies and grants while retaining temporary `vsi_app` compatibility policies.
2. Provision the three login roles in Neon and configure the encrypted Vercel variables listed above.
3. Deploy the application changes and verify compliance, finance, and volunteer portal workflows.
4. Apply `20261122_sensitive_roles_revoke_legacy.sql` to remove `vsi_app` access to the sensitive tables.

The cleanup migration must not be applied before the dedicated connections are deployed.
