-- Use the existing vsi_gen_public login (NOBYPASSRLS) for the public VSI recruitment endpoint.
-- Its connection string is managed in Vercel as RECRUITMENT_PUBLIC_DATABASE_URL.

GRANT USAGE ON SCHEMA public TO vsi_gen_public;

-- Public visitors may read only currently published opportunities.
GRANT SELECT ON public.vsi_recruitment_opportunities TO vsi_gen_public;

-- The submission route may insert an application and receive only its generated id.
GRANT INSERT ON public.vsi_recruitment_applications TO vsi_gen_public;
GRANT SELECT (id) ON public.vsi_recruitment_applications TO vsi_gen_public;
GRANT USAGE, SELECT ON SEQUENCE public.vsi_recruitment_applications_id_seq
  TO vsi_gen_public;

DROP POLICY IF EXISTS vsi_recruitment_public_return_application_id
  ON public.vsi_recruitment_applications;
CREATE POLICY vsi_recruitment_public_return_application_id
  ON public.vsi_recruitment_applications
  FOR SELECT TO vsi_gen_public
  USING (true);

-- Duplicate checking returns only a boolean, never applicant data.
CREATE OR REPLACE FUNCTION public.vsi_recruitment_application_exists(
  p_opportunity_id bigint,
  p_email text
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.vsi_recruitment_applications
    WHERE opportunity_id = p_opportunity_id
      AND lower(trim(email)) = lower(trim(p_email))
  );
$function$;

REVOKE ALL ON FUNCTION public.vsi_recruitment_application_exists(bigint, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vsi_recruitment_application_exists(bigint, text)
  TO vsi_gen_public;

GRANT EXECUTE ON FUNCTION public.vsi_recruitment_next_reference()
  TO vsi_gen_public;
GRANT EXECUTE ON FUNCTION public.vsi_recruitment_create_email_verification(bigint, text, timestamptz)
  TO vsi_gen_public;
GRANT EXECUTE ON FUNCTION public.vsi_recruitment_lock_submission_email(text)
  TO vsi_gen_public;
GRANT EXECUTE ON FUNCTION public.vsi_recruitment_register_submission(text)
  TO vsi_gen_public;
