-- VSI Generosity email ownership verification.
-- Additive migration: existing pledge records remain treated as verified.
ALTER TABLE public.vsi_generosity_offers
  ADD COLUMN IF NOT EXISTS email_verified_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS vsi_generosity_email_verification_idx
  ON public.vsi_generosity_offers (email_verified_at, created_at DESC);

CREATE TABLE IF NOT EXISTS public.vsi_generosity_email_verifications (
  id bigserial PRIMARY KEY,
  offer_id uuid NOT NULL REFERENCES public.vsi_generosity_offers(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vsi_generosity_email_verifications_offer_idx
  ON public.vsi_generosity_email_verifications (offer_id, created_at DESC);

ALTER TABLE public.vsi_generosity_email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vsi_generosity_email_verifications FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vsi_generosity_email_verifications_server_all
  ON public.vsi_generosity_email_verifications;
CREATE POLICY vsi_generosity_email_verifications_server_all
  ON public.vsi_generosity_email_verifications
  FOR ALL TO PUBLIC
  USING (current_user <> 'vsi_gen_public')
  WITH CHECK (current_user <> 'vsi_gen_public');

REVOKE ALL ON public.vsi_generosity_email_verifications FROM PUBLIC, vsi_gen_public;
REVOKE ALL ON SEQUENCE public.vsi_generosity_email_verifications_id_seq FROM PUBLIC, vsi_gen_public;

-- Public submissions can set the new field to NULL, but cannot read or update
-- contributor records. Existing records were backfilled by the column default.
GRANT INSERT (email_verified_at) ON public.vsi_generosity_offers TO vsi_gen_public;

CREATE OR REPLACE FUNCTION public.vsi_generosity_create_email_verification(
  p_offer_id uuid,
  p_token_hash text,
  p_expires_at timestamptz
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
BEGIN
  IF p_offer_id IS NULL
     OR p_token_hash IS NULL
     OR p_token_hash !~ '^[0-9a-f]{64}$'
     OR p_expires_at <= clock_timestamp()
     OR p_expires_at > clock_timestamp() + interval '25 hours' THEN
    RAISE EXCEPTION 'Invalid email verification parameters';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.vsi_generosity_offers
    WHERE id = p_offer_id AND email_verified_at IS NULL
  ) THEN
    RETURN false;
  END IF;

  DELETE FROM public.vsi_generosity_email_verifications
  WHERE offer_id = p_offer_id AND used_at IS NULL;

  INSERT INTO public.vsi_generosity_email_verifications (offer_id, token_hash, expires_at)
  VALUES (p_offer_id, p_token_hash, p_expires_at);

  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.vsi_generosity_create_email_verification(uuid, text, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vsi_generosity_create_email_verification(uuid, text, timestamptz) TO vsi_gen_public;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'vsi_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.vsi_generosity_email_verifications TO vsi_app;
    GRANT USAGE, SELECT ON SEQUENCE public.vsi_generosity_email_verifications_id_seq TO vsi_app;
  END IF;
END $$;
