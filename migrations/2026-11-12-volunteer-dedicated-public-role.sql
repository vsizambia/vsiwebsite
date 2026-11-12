-- Give public volunteer submissions a dedicated NOBYPASSRLS login.
-- The existing vsi_public login inherits Neon-wide read/write roles and must not
-- be used for this workflow's applicant records or verification tokens.

CREATE SCHEMA IF NOT EXISTS vsi_private AUTHORIZATION neondb_owner;
REVOKE ALL ON SCHEMA vsi_private FROM PUBLIC, vsi_public, neon_superuser;
GRANT USAGE ON SCHEMA vsi_private TO vsi_app;

-- Move verification tokens out of the public schema.
DO $$
BEGIN
  IF to_regclass('public.volunteer_application_email_verifications') IS NOT NULL
     AND to_regclass('vsi_private.volunteer_application_email_verifications') IS NULL THEN
    ALTER TABLE public.volunteer_application_email_verifications SET SCHEMA vsi_private;
  END IF;
END $$;

REVOKE ALL ON TABLE vsi_private.volunteer_application_email_verifications
  FROM PUBLIC, vsi_public, neon_superuser, vsi_volunteer_public;
REVOKE ALL ON SEQUENCE vsi_private.volunteer_application_email_verifications_id_seq
  FROM PUBLIC, vsi_public, neon_superuser, vsi_volunteer_public;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE vsi_private.volunteer_application_email_verifications TO vsi_app;
GRANT USAGE, SELECT
  ON SEQUENCE vsi_private.volunteer_application_email_verifications_id_seq TO vsi_app;

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

  DELETE FROM vsi_private.volunteer_application_email_verifications
  WHERE application_id = p_application_id AND used_at IS NULL;

  INSERT INTO vsi_private.volunteer_application_email_verifications
    (application_id, token_hash, expires_at)
  VALUES (p_application_id, p_token_hash, p_expires_at);

  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.vsi_volunteer_create_email_verification(bigint,text,timestamptz)
  FROM PUBLIC, vsi_public, neon_superuser;
GRANT EXECUTE ON FUNCTION public.vsi_volunteer_create_email_verification(bigint,text,timestamptz)
  TO vsi_volunteer_public, vsi_app;

-- Remove broad grants inherited from Neon read_write role creation and grant
-- only the exact columns and operations used by the public application endpoint.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM vsi_volunteer_public;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM vsi_volunteer_public;
ALTER DEFAULT PRIVILEGES FOR ROLE neondb_owner IN SCHEMA public
  REVOKE ALL ON TABLES FROM vsi_volunteer_public;
ALTER DEFAULT PRIVILEGES FOR ROLE neondb_owner IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM vsi_volunteer_public;

GRANT INSERT (
  full_name,date_of_birth,nationality,gender,faith,email,phone,province,district,
  constituency,ward,location,current_occupation,education,category,skills,
  availability,hours_per_week,motivation,volunteering_elsewhere,
  other_volunteering_details,past_volunteer_positions,reference_name,
  reference_organization,reference_phone,reference_email,criminal_conviction,
  criminal_offence_details,disability,disability_certificate,
  disability_certificate_name,profile_picture,emergency_name,emergency_phone,
  membership_fee_acknowledged,consent,privacy_policy_version,
  privacy_notice_accepted_at,photo_processing_consent,public_media_consent,
  guardian_name,guardian_relationship,guardian_phone,guardian_email,
  guardian_consent,guardian_consent_at
) ON public.volunteer_applications TO vsi_volunteer_public;
GRANT SELECT (id,created_at) ON public.volunteer_applications TO vsi_volunteer_public;
GRANT UPDATE (profile_picture) ON public.volunteer_applications TO vsi_volunteer_public;
GRANT USAGE ON SEQUENCE public.volunteer_applications_id_seq TO vsi_volunteer_public;

GRANT SELECT (key_hash,created_at), INSERT (key_hash), DELETE
  ON public.volunteer_application_rate_limits TO vsi_volunteer_public;
GRANT USAGE ON SEQUENCE public.volunteer_application_rate_limits_id_seq TO vsi_volunteer_public;

GRANT INSERT (subject_type,subject_id,consent_type,policy_version,granted)
  ON public.data_protection_consent_log TO vsi_volunteer_public;
GRANT USAGE ON SEQUENCE public.data_protection_consent_log_id_seq TO vsi_volunteer_public;

DROP POLICY IF EXISTS vsi_volunteer_public_insert ON public.volunteer_applications;
CREATE POLICY vsi_volunteer_public_insert
  ON public.volunteer_applications FOR INSERT TO vsi_volunteer_public
  WITH CHECK (true);
DROP POLICY IF EXISTS vsi_volunteer_public_recent_lookup ON public.volunteer_applications;
CREATE POLICY vsi_volunteer_public_recent_lookup
  ON public.volunteer_applications FOR SELECT TO vsi_volunteer_public
  USING (created_at >= now() - interval '10 minutes');
DROP POLICY IF EXISTS vsi_volunteer_public_profile_picture_update ON public.volunteer_applications;
CREATE POLICY vsi_volunteer_public_profile_picture_update
  ON public.volunteer_applications FOR UPDATE TO vsi_volunteer_public
  USING (created_at >= now() - interval '10 minutes')
  WITH CHECK (created_at >= now() - interval '10 minutes');

DROP POLICY IF EXISTS vsi_volunteer_public_rate_limit_select ON public.volunteer_application_rate_limits;
CREATE POLICY vsi_volunteer_public_rate_limit_select
  ON public.volunteer_application_rate_limits FOR SELECT TO vsi_volunteer_public
  USING (true);
DROP POLICY IF EXISTS vsi_volunteer_public_rate_limit_insert ON public.volunteer_application_rate_limits;
CREATE POLICY vsi_volunteer_public_rate_limit_insert
  ON public.volunteer_application_rate_limits FOR INSERT TO vsi_volunteer_public
  WITH CHECK (true);
DROP POLICY IF EXISTS vsi_volunteer_public_rate_limit_delete ON public.volunteer_application_rate_limits;
CREATE POLICY vsi_volunteer_public_rate_limit_delete
  ON public.volunteer_application_rate_limits FOR DELETE TO vsi_volunteer_public
  USING (created_at < now() - interval '1 hour');

DROP POLICY IF EXISTS vsi_volunteer_public_consent_insert ON public.data_protection_consent_log;
CREATE POLICY vsi_volunteer_public_consent_insert
  ON public.data_protection_consent_log FOR INSERT TO vsi_volunteer_public
  WITH CHECK (subject_type = 'volunteer' AND granted = true);
