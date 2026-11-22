-- Run only after the compliance, finance, and volunteer portal pools are live.
-- Remove legacy main-app access to data-protection records.
DROP POLICY IF EXISTS transitional_vsi_app_access ON public.data_protection_requests;
DROP POLICY IF EXISTS transitional_vsi_app_access ON public.data_protection_incidents;
DROP POLICY IF EXISTS vsi_app_admin_all ON public.data_protection_consent_log;
DROP POLICY IF EXISTS transitional_vsi_app_access ON public.data_retention_rules;
DROP POLICY IF EXISTS transitional_vsi_app_access ON public.data_retention_actions;
REVOKE ALL PRIVILEGES ON public.data_protection_requests, public.data_protection_incidents, public.data_protection_consent_log, public.data_retention_rules, public.data_retention_actions FROM vsi_app;
REVOKE ALL PRIVILEGES ON SEQUENCE public.data_protection_consent_log_id_seq, public.data_protection_incidents_id_seq, public.data_protection_requests_id_seq, public.data_retention_actions_id_seq, public.data_retention_rules_id_seq FROM vsi_app;

-- Remove legacy main-app access to finance records.
DROP POLICY IF EXISTS vsi_app_admin_all ON public.volunteer_membership_payments;
DROP POLICY IF EXISTS vsi_app_admin_all ON public.volunteer_donations;
DROP POLICY IF EXISTS vsi_app_admin_all ON public.volunteer_finance_spending;
DROP POLICY IF EXISTS vsi_app_legacy_access ON public.volunteer_other_payments;
REVOKE ALL PRIVILEGES ON public.volunteer_membership_payments, public.volunteer_donations, public.volunteer_other_payments, public.volunteer_finance_spending FROM vsi_app;
REVOKE ALL PRIVILEGES ON SEQUENCE public.volunteer_membership_payments_id_seq, public.volunteer_donations_id_seq, public.volunteer_other_payments_id_seq, public.volunteer_finance_spending_id_seq FROM vsi_app;

-- Remove legacy main-app access to volunteer portal sessions and one-time challenges.
DROP POLICY IF EXISTS vsi_app_legacy_access ON public.volunteer_portal_sessions;
DROP POLICY IF EXISTS vsi_app_legacy_access ON public.volunteer_portal_challenges;
REVOKE ALL PRIVILEGES ON public.volunteer_portal_sessions, public.volunteer_portal_challenges FROM vsi_app;
REVOKE ALL PRIVILEGES ON SEQUENCE public.volunteer_portal_sessions_id_seq FROM vsi_app;

-- The safeguarding intake role alone manages anonymous rate-limit entries.
DROP POLICY IF EXISTS vsi_app_legacy_access ON public.safeguarding_public_rate_limits;
REVOKE ALL PRIVILEGES ON public.safeguarding_public_rate_limits FROM vsi_app;
REVOKE ALL PRIVILEGES ON SEQUENCE public.safeguarding_public_rate_limits_id_seq FROM vsi_app;
