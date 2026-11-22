-- The safeguarding login route uses SAFEGUARDING_DATABASE_URL.
-- Remove the final residual direct grant from the general application role.
REVOKE ALL PRIVILEGES ON public.safeguarding_login_attempts FROM vsi_app;
REVOKE ALL PRIVILEGES ON SEQUENCE public.safeguarding_login_attempts_id_seq FROM vsi_app;
