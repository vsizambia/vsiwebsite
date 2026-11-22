-- Run only after the application has moved to SAFEGUARDING_DATABASE_URL.
-- This removes the temporary compatibility access retained during deployment.
DROP POLICY IF EXISTS vsi_safeguarding_legacy_access ON public.safeguarding_reports;
DROP POLICY IF EXISTS vsi_safeguarding_legacy_access ON public.safeguarding_case_notes;
DROP POLICY IF EXISTS vsi_safeguarding_legacy_access ON public.safeguarding_audit_log;
DROP POLICY IF EXISTS vsi_safeguarding_legacy_access ON public.safeguarding_users;

REVOKE ALL PRIVILEGES ON public.safeguarding_reports, public.safeguarding_case_notes, public.safeguarding_audit_log, public.safeguarding_users FROM vsi_app;
REVOKE ALL PRIVILEGES ON SEQUENCE public.safeguarding_reports_id_seq, public.safeguarding_case_notes_id_seq, public.safeguarding_audit_log_id_seq, public.safeguarding_users_id_seq FROM vsi_app;
