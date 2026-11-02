-- VSI Recruitment email ownership verification.
-- Pending applications remain stored privately but are excluded from the Admin dashboard
-- until the applicant completes the single-use email verification link.

ALTER TABLE public.vsi_recruitment_applications
  ADD COLUMN IF NOT EXISTS email_verified_at timestamptz;

CREATE INDEX IF NOT EXISTS vsi_recruitment_applications_verified_idx
  ON public.vsi_recruitment_applications (email_verified_at, created_at DESC);

CREATE TABLE IF NOT EXISTS public.vsi_recruitment_email_verifications (
  id bigserial PRIMARY KEY,
  application_id bigint NOT NULL
    REFERENCES public.vsi_recruitment_applications(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE
    CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vsi_recruitment_email_verifications_application_idx
  ON public.vsi_recruitment_email_verifications (application_id, created_at DESC);

ALTER TABLE public.vsi_recruitment_email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vsi_recruitment_email_verifications FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vsi_recruitment_email_verifications_server_all
  ON public.vsi_recruitment_email_verifications;
CREATE POLICY vsi_recruitment_email_verifications_server_all
  ON public.vsi_recruitment_email_verifications
  FOR ALL TO PUBLIC
  USING (current_user <> 'vsi_gen_public')
  WITH CHECK (current_user <> 'vsi_gen_public');

REVOKE ALL ON public.vsi_recruitment_email_verifications FROM PUBLIC, vsi_gen_public;
REVOKE ALL ON SEQUENCE public.vsi_recruitment_email_verifications_id_seq FROM PUBLIC, vsi_gen_public;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'vsi_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE
      ON public.vsi_recruitment_email_verifications TO vsi_app;
    GRANT USAGE, SELECT
      ON SEQUENCE public.vsi_recruitment_email_verifications_id_seq TO vsi_app;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.vsi_recruitment_create_email_verification(
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
    RAISE EXCEPTION 'Invalid email verification parameters';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.vsi_recruitment_applications
    WHERE id = p_application_id AND email_verified_at IS NULL
  ) THEN
    RETURN false;
  END IF;

  DELETE FROM public.vsi_recruitment_email_verifications
  WHERE application_id = p_application_id AND used_at IS NULL;

  INSERT INTO public.vsi_recruitment_email_verifications
    (application_id, token_hash, expires_at)
  VALUES (p_application_id, p_token_hash, p_expires_at);

  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.vsi_recruitment_create_email_verification(bigint, text, timestamptz)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vsi_recruitment_create_email_verification(bigint, text, timestamptz)
  TO vsi_gen_public;
