-- Restrict direct access to recruitment submission rate-limit records.
-- The public API uses narrowly scoped SECURITY DEFINER functions instead of
-- reading, inserting, deleting, or modifying the rate-limit table directly.

CREATE OR REPLACE FUNCTION public.vsi_recruitment_lock_submission_email(p_email_hash text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
BEGIN
  IF p_email_hash IS NULL OR p_email_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'Invalid recruitment submission key';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_email_hash));

  DELETE FROM public.vsi_recruitment_submission_limits
  WHERE created_at < pg_catalog.now() - interval '1 day';
END;
$function$;

CREATE OR REPLACE FUNCTION public.vsi_recruitment_register_submission(p_email_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
DECLARE
  v_recent_count integer;
BEGIN
  IF p_email_hash IS NULL OR p_email_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'Invalid recruitment submission key';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_email_hash));

  SELECT count(*)::integer
    INTO v_recent_count
  FROM public.vsi_recruitment_submission_limits
  WHERE email_hash = p_email_hash
    AND created_at > pg_catalog.now() - interval '1 hour';

  IF v_recent_count >= 5 THEN
    RETURN false;
  END IF;

  INSERT INTO public.vsi_recruitment_submission_limits (email_hash)
  VALUES (p_email_hash);

  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.vsi_recruitment_lock_submission_email(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.vsi_recruitment_register_submission(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vsi_recruitment_lock_submission_email(text) TO vsi_public, vsi_gen_public;
GRANT EXECUTE ON FUNCTION public.vsi_recruitment_register_submission(text) TO vsi_public, vsi_gen_public;

DROP POLICY IF EXISTS vsi_recruitment_public_rate_limit
  ON public.vsi_recruitment_submission_limits;

REVOKE ALL ON TABLE public.vsi_recruitment_submission_limits
  FROM PUBLIC, vsi_public, vsi_gen_public;
