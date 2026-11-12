-- Volunteer application email ownership verification.
-- Existing applications are preserved as historically verified; new applications
-- remain unverified until the applicant completes the single-use email link.
ALTER TABLE public.volunteer_applications
  ADD COLUMN IF NOT EXISTS email_verified_at timestamptz;

UPDATE public.volunteer_applications
SET email_verified_at = created_at
WHERE email_verified_at IS NULL;

ALTER TABLE public.volunteer_applications
  ALTER COLUMN email_verified_at DROP DEFAULT;

CREATE INDEX IF NOT EXISTS volunteer_applications_email_verified_idx
  ON public.volunteer_applications (email_verified_at, created_at DESC);

CREATE TABLE IF NOT EXISTS public.volunteer_application_email_verifications (
  id bigserial PRIMARY KEY,
  application_id bigint NOT NULL REFERENCES public.volunteer_applications(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS volunteer_application_email_verifications_application_idx
  ON public.volunteer_application_email_verifications (application_id, created_at DESC);

ALTER TABLE public.volunteer_application_email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_application_email_verifications FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS volunteer_application_email_verifications_server_all
  ON public.volunteer_application_email_verifications;
CREATE POLICY volunteer_application_email_verifications_server_all
  ON public.volunteer_application_email_verifications
  FOR ALL TO PUBLIC
  USING (current_user <> 'vsi_public')
  WITH CHECK (current_user <> 'vsi_public');

REVOKE ALL ON public.volunteer_application_email_verifications FROM PUBLIC, vsi_public;
REVOKE ALL ON SEQUENCE public.volunteer_application_email_verifications_id_seq FROM PUBLIC, vsi_public;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'vsi_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE
      ON public.volunteer_application_email_verifications TO vsi_app;
    GRANT USAGE, SELECT
      ON SEQUENCE public.volunteer_application_email_verifications_id_seq TO vsi_app;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.vsi_volunteer_create_email_verification(
  p_application_id bigint,
  p_token_hash text,
  p_expires_at timestamptz
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
BEGIN
  IF p_application_id IS NULL
     OR p_token_hash IS NULL
     OR p_token_hash !~ '^[0-9a-f]{64}$'
     OR p_expires_at <= clock_timestamp()
     OR p_expires_at > clock_timestamp() + interval '25 hours' THEN
    RAISE EXCEPTION 'Invalid volunteer email verification parameters';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.volunteer_applications
    WHERE id = p_application_id AND email_verified_at IS NULL
  ) THEN
    RETURN false;
  END IF;

  DELETE FROM public.volunteer_application_email_verifications
  WHERE application_id = p_application_id AND used_at IS NULL;

  INSERT INTO public.volunteer_application_email_verifications
    (application_id, token_hash, expires_at)
  VALUES (p_application_id, p_token_hash, p_expires_at);

  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.vsi_volunteer_create_email_verification(bigint, text, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vsi_volunteer_create_email_verification(bigint, text, timestamptz)
  TO vsi_public, vsi_app;
