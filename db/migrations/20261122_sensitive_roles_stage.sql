-- Add separate non-bypass roles for compliance, finance, and volunteer self-service.
CREATE ROLE vsi_data_protection_access NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
CREATE ROLE vsi_finance_access NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
CREATE ROLE vsi_volunteer_portal_access NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;

-- Data protection and retention records.
DROP POLICY IF EXISTS vsi_data_protection_access_all ON public.data_protection_requests;
CREATE POLICY vsi_data_protection_access_all ON public.data_protection_requests FOR ALL TO vsi_data_protection_access USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS vsi_data_protection_access_all ON public.data_protection_incidents;
CREATE POLICY vsi_data_protection_access_all ON public.data_protection_incidents FOR ALL TO vsi_data_protection_access USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS vsi_data_protection_access_all ON public.data_protection_consent_log;
CREATE POLICY vsi_data_protection_access_all ON public.data_protection_consent_log FOR ALL TO vsi_data_protection_access USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS vsi_data_protection_access_all ON public.data_retention_rules;
CREATE POLICY vsi_data_protection_access_all ON public.data_retention_rules FOR ALL TO vsi_data_protection_access USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS vsi_data_protection_access_all ON public.data_retention_actions;
CREATE POLICY vsi_data_protection_access_all ON public.data_retention_actions FOR ALL TO vsi_data_protection_access USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS vsi_data_protection_access_all ON public.volunteer_applications;
CREATE POLICY vsi_data_protection_access_all ON public.volunteer_applications FOR ALL TO vsi_data_protection_access USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS vsi_data_protection_access_all ON public.volunteer_activity_register;
CREATE POLICY vsi_data_protection_access_all ON public.volunteer_activity_register FOR ALL TO vsi_data_protection_access USING (true) WITH CHECK (true);

-- Finance administrators can manage finance records. Portal users receive read-only finance access.
DROP POLICY IF EXISTS vsi_finance_access_all ON public.volunteer_membership_payments;
CREATE POLICY vsi_finance_access_all ON public.volunteer_membership_payments FOR ALL TO vsi_finance_access USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS vsi_volunteer_portal_read ON public.volunteer_membership_payments;
CREATE POLICY vsi_volunteer_portal_read ON public.volunteer_membership_payments FOR SELECT TO vsi_volunteer_portal_access USING (true);
DROP POLICY IF EXISTS vsi_finance_access_all ON public.volunteer_donations;
CREATE POLICY vsi_finance_access_all ON public.volunteer_donations FOR ALL TO vsi_finance_access USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS vsi_volunteer_portal_read ON public.volunteer_donations;
CREATE POLICY vsi_volunteer_portal_read ON public.volunteer_donations FOR SELECT TO vsi_volunteer_portal_access USING (true);
ALTER TABLE public.volunteer_other_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vsi_finance_access_all ON public.volunteer_other_payments;
CREATE POLICY vsi_finance_access_all ON public.volunteer_other_payments FOR ALL TO vsi_finance_access USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS vsi_volunteer_portal_read ON public.volunteer_other_payments;
CREATE POLICY vsi_volunteer_portal_read ON public.volunteer_other_payments FOR SELECT TO vsi_volunteer_portal_access USING (true);
DROP POLICY IF EXISTS vsi_app_legacy_access ON public.volunteer_other_payments;
CREATE POLICY vsi_app_legacy_access ON public.volunteer_other_payments FOR ALL TO vsi_app USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS vsi_finance_access_all ON public.volunteer_finance_spending;
CREATE POLICY vsi_finance_access_all ON public.volunteer_finance_spending FOR ALL TO vsi_finance_access USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS vsi_finance_access_read_volunteers ON public.volunteer_applications;
CREATE POLICY vsi_finance_access_read_volunteers ON public.volunteer_applications FOR SELECT TO vsi_finance_access USING (true);

-- Volunteer portal sessions and one-time challenges are isolated from the main application login.
ALTER TABLE public.volunteer_portal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_portal_challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vsi_volunteer_portal_access_all ON public.volunteer_portal_sessions;
CREATE POLICY vsi_volunteer_portal_access_all ON public.volunteer_portal_sessions FOR ALL TO vsi_volunteer_portal_access USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS vsi_volunteer_portal_access_all ON public.volunteer_portal_challenges;
CREATE POLICY vsi_volunteer_portal_access_all ON public.volunteer_portal_challenges FOR ALL TO vsi_volunteer_portal_access USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS vsi_app_legacy_access ON public.volunteer_portal_sessions;
CREATE POLICY vsi_app_legacy_access ON public.volunteer_portal_sessions FOR ALL TO vsi_app USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS vsi_app_legacy_access ON public.volunteer_portal_challenges;
CREATE POLICY vsi_app_legacy_access ON public.volunteer_portal_challenges FOR ALL TO vsi_app USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS vsi_volunteer_portal_read_profile ON public.volunteer_applications;
CREATE POLICY vsi_volunteer_portal_read_profile ON public.volunteer_applications FOR SELECT TO vsi_volunteer_portal_access USING (true);
DROP POLICY IF EXISTS vsi_volunteer_portal_read_activities ON public.volunteer_activity_register;
CREATE POLICY vsi_volunteer_portal_read_activities ON public.volunteer_activity_register FOR SELECT TO vsi_volunteer_portal_access USING (true);

-- Anonymous safeguarding rate limits stay available only to the safeguarding intake login.
ALTER TABLE public.safeguarding_public_rate_limits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vsi_safeguarding_ingest_rate_limits ON public.safeguarding_public_rate_limits;
CREATE POLICY vsi_safeguarding_ingest_rate_limits ON public.safeguarding_public_rate_limits FOR ALL TO vsi_safeguarding_ingest USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS vsi_app_legacy_access ON public.safeguarding_public_rate_limits;
CREATE POLICY vsi_app_legacy_access ON public.safeguarding_public_rate_limits FOR ALL TO vsi_app USING (true) WITH CHECK (true);

-- Public impact reporting continues through the existing application API with explicit RLS.
ALTER TABLE public.vsi_impact_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vsi_impact_programmes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vsi_app_admin_all ON public.vsi_impact_activities;
CREATE POLICY vsi_app_admin_all ON public.vsi_impact_activities FOR ALL TO vsi_app USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS vsi_app_admin_all ON public.vsi_impact_programmes;
CREATE POLICY vsi_app_admin_all ON public.vsi_impact_programmes FOR ALL TO vsi_app USING (true) WITH CHECK (true);

GRANT USAGE ON SCHEMA public TO vsi_data_protection_access, vsi_finance_access, vsi_volunteer_portal_access;

GRANT SELECT, UPDATE, DELETE ON public.data_protection_requests TO vsi_data_protection_access;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_protection_incidents TO vsi_data_protection_access;
GRANT SELECT, DELETE ON public.data_protection_consent_log TO vsi_data_protection_access;
GRANT SELECT, UPDATE ON public.data_retention_rules TO vsi_data_protection_access;
GRANT SELECT, INSERT ON public.data_retention_actions TO vsi_data_protection_access;
GRANT SELECT, UPDATE, DELETE ON public.volunteer_applications TO vsi_data_protection_access;
GRANT SELECT, DELETE ON public.volunteer_activity_register TO vsi_data_protection_access;
GRANT USAGE ON SEQUENCE public.data_protection_incidents_id_seq, public.data_retention_actions_id_seq TO vsi_data_protection_access;

GRANT SELECT ON public.volunteer_applications TO vsi_finance_access;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteer_membership_payments, public.volunteer_donations, public.volunteer_other_payments, public.volunteer_finance_spending TO vsi_finance_access;
GRANT USAGE ON SEQUENCE public.volunteer_membership_payments_id_seq, public.volunteer_donations_id_seq, public.volunteer_other_payments_id_seq, public.volunteer_finance_spending_id_seq TO vsi_finance_access;

GRANT SELECT ON public.volunteer_applications, public.volunteer_activity_register, public.volunteer_membership_payments, public.volunteer_donations, public.volunteer_other_payments TO vsi_volunteer_portal_access;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteer_portal_sessions, public.volunteer_portal_challenges TO vsi_volunteer_portal_access;
GRANT USAGE ON SEQUENCE public.volunteer_portal_sessions_id_seq TO vsi_volunteer_portal_access;
