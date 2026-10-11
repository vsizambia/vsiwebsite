-- VSI Generosity: goods-only offers and collection tracking.
-- Apply through the controlled database migration workflow; do not run from request handlers.

CREATE TABLE IF NOT EXISTS public.vsi_generosity_offers (
  id uuid PRIMARY KEY,
  reference text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  gender text,
  age_range text,
  email text NOT NULL,
  phone text NOT NULL,
  town_area text NOT NULL,
  pickup_address text,
  phone_consent boolean NOT NULL DEFAULT false,
  email_consent boolean NOT NULL DEFAULT false,
  consent_version text NOT NULL DEFAULT '2026-10',
  status text NOT NULL DEFAULT 'offer_received'
    CHECK (status IN ('offer_received','contact_in_progress','collection_arranged','partially_collected','fully_collected','withdrawn','closed')),
  staff_notes text,
  closure_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  collection_arranged_at timestamptz,
  closed_at timestamptz
);

CREATE INDEX IF NOT EXISTS vsi_generosity_offers_created_idx
  ON public.vsi_generosity_offers (created_at DESC);
CREATE INDEX IF NOT EXISTS vsi_generosity_offers_status_idx
  ON public.vsi_generosity_offers (status);
CREATE INDEX IF NOT EXISTS vsi_generosity_offers_email_idx
  ON public.vsi_generosity_offers (lower(email));

CREATE TABLE IF NOT EXISTS public.vsi_generosity_offer_items (
  id uuid PRIMARY KEY,
  offer_id uuid NOT NULL REFERENCES public.vsi_generosity_offers(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('educational_materials','ovc_support','maternity_mothers','maternity_newborns')),
  item_key text NOT NULL,
  item_label text NOT NULL,
  quantity_pledged integer NOT NULL CHECK (quantity_pledged > 0),
  quantity_collected integer NOT NULL DEFAULT 0 CHECK (quantity_collected >= 0),
  unit text NOT NULL,
  size_details text,
  item_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (quantity_collected <= quantity_pledged)
);

CREATE INDEX IF NOT EXISTS vsi_generosity_items_offer_idx
  ON public.vsi_generosity_offer_items (offer_id);
CREATE INDEX IF NOT EXISTS vsi_generosity_items_category_idx
  ON public.vsi_generosity_offer_items (category, item_key);

CREATE TABLE IF NOT EXISTS public.vsi_generosity_rate_limits (
  id bigserial PRIMARY KEY,
  key_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS vsi_generosity_rate_limits_key_created_idx
  ON public.vsi_generosity_rate_limits (key_hash, created_at DESC);

CREATE TABLE IF NOT EXISTS public.vsi_generosity_audit_log (
  id bigserial PRIMARY KEY,
  offer_id uuid NOT NULL REFERENCES public.vsi_generosity_offers(id) ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS vsi_generosity_audit_offer_idx
  ON public.vsi_generosity_audit_log (offer_id, created_at DESC);

-- The anonymous application role may create offers, add offer items and maintain
-- its own hashed-IP rate-limit rows. It cannot read contributor records.
GRANT INSERT (id, reference, first_name, last_name, gender, age_range, email, phone, town_area, pickup_address, phone_consent, email_consent, consent_version)
  ON public.vsi_generosity_offers TO vsi_gen_public;
GRANT SELECT (id, reference, created_at) ON public.vsi_generosity_offers TO vsi_gen_public;
GRANT INSERT (id, offer_id, category, item_key, item_label, quantity_pledged, unit, size_details)
  ON public.vsi_generosity_offer_items TO vsi_gen_public;
GRANT SELECT (id) ON public.vsi_generosity_offer_items TO vsi_gen_public;

-- Administrative operations use the existing privileged server-side pool.


-- Defense in depth: RLS is enforced even for table owners that do not have
-- BYPASSRLS. The privileged server connection is explicitly allowed; the
-- public submission role receives INSERT-only policies on offer tables.
ALTER TABLE public.vsi_generosity_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vsi_generosity_offers FORCE ROW LEVEL SECURITY;
ALTER TABLE public.vsi_generosity_offer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vsi_generosity_offer_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.vsi_generosity_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vsi_generosity_rate_limits FORCE ROW LEVEL SECURITY;
ALTER TABLE public.vsi_generosity_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vsi_generosity_audit_log FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vsi_generosity_offers_server_all ON public.vsi_generosity_offers;
CREATE POLICY vsi_generosity_offers_server_all ON public.vsi_generosity_offers
  FOR ALL TO PUBLIC
  USING (current_user <> 'vsi_gen_public')
  WITH CHECK (current_user <> 'vsi_gen_public');
DROP POLICY IF EXISTS vsi_generosity_offers_public_insert ON public.vsi_generosity_offers;
CREATE POLICY vsi_generosity_offers_public_insert ON public.vsi_generosity_offers
  FOR INSERT TO vsi_gen_public
  WITH CHECK (true);

DROP POLICY IF EXISTS vsi_generosity_items_server_all ON public.vsi_generosity_offer_items;
CREATE POLICY vsi_generosity_items_server_all ON public.vsi_generosity_offer_items
  FOR ALL TO PUBLIC
  USING (current_user <> 'vsi_gen_public')
  WITH CHECK (current_user <> 'vsi_gen_public');
DROP POLICY IF EXISTS vsi_generosity_items_public_insert ON public.vsi_generosity_offer_items;
CREATE POLICY vsi_generosity_items_public_insert ON public.vsi_generosity_offer_items
  FOR INSERT TO vsi_gen_public
  WITH CHECK (true);

-- Rate-limit rows are visible and deletable only for the HMAC key that the
-- backend sets transaction-locally for the current request.
DROP POLICY IF EXISTS vsi_generosity_rate_server_all ON public.vsi_generosity_rate_limits;
CREATE POLICY vsi_generosity_rate_server_all ON public.vsi_generosity_rate_limits
  FOR ALL TO PUBLIC
  USING (current_user <> 'vsi_gen_public')
  WITH CHECK (current_user <> 'vsi_gen_public');

-- Rate limiting is encapsulated in a SECURITY DEFINER function. The public
-- role cannot query or mutate rate-limit rows directly, nor can it alter the
-- per-request key used by the policy. The function runs atomically under the
-- trusted migration owner and exposes only a boolean allow/deny result.
CREATE OR REPLACE FUNCTION public.vsi_generosity_allow_submission(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
DECLARE
  v_count integer;
  v_window interval;
BEGIN
  IF p_key_hash IS NULL OR p_key_hash = '' OR p_limit < 1 OR p_window_seconds < 1 THEN
    RAISE EXCEPTION 'Invalid rate-limit parameters';
  END IF;
  v_window := make_interval(secs => p_window_seconds);
  PERFORM pg_advisory_xact_lock(hashtext(p_key_hash));
  DELETE FROM public.vsi_generosity_rate_limits
   WHERE created_at < clock_timestamp() - v_window;
  SELECT count(*)::integer INTO v_count
    FROM public.vsi_generosity_rate_limits
   WHERE key_hash = p_key_hash
     AND created_at >= clock_timestamp() - v_window;
  IF v_count >= p_limit THEN
    RETURN false;
  END IF;
  INSERT INTO public.vsi_generosity_rate_limits (key_hash) VALUES (p_key_hash);
  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.vsi_generosity_allow_submission(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vsi_generosity_allow_submission(text, integer, integer) TO vsi_gen_public;

DROP POLICY IF EXISTS vsi_generosity_audit_server_all ON public.vsi_generosity_audit_log;
CREATE POLICY vsi_generosity_audit_server_all ON public.vsi_generosity_audit_log
  FOR ALL TO PUBLIC
  USING (current_user <> 'vsi_gen_public')
  WITH CHECK (current_user <> 'vsi_gen_public');

-- Remove broad/default table grants before granting the smallest required
-- public-submission permissions. Public callers cannot SELECT offer/item data.
REVOKE ALL ON public.vsi_generosity_offers FROM PUBLIC, vsi_gen_public;
REVOKE ALL ON public.vsi_generosity_offer_items FROM PUBLIC, vsi_gen_public;
REVOKE ALL ON public.vsi_generosity_audit_log FROM PUBLIC, vsi_gen_public;
REVOKE ALL ON public.vsi_generosity_rate_limits FROM PUBLIC, vsi_gen_public;
REVOKE ALL ON SEQUENCE public.vsi_generosity_rate_limits_id_seq FROM PUBLIC, vsi_gen_public;

GRANT INSERT (id, reference, first_name, last_name, gender, age_range, email, phone, town_area, pickup_address, phone_consent, email_consent, consent_version)
  ON public.vsi_generosity_offers TO vsi_gen_public;
GRANT INSERT (id, offer_id, category, item_key, item_label, quantity_pledged, unit, size_details)
  ON public.vsi_generosity_offer_items TO vsi_gen_public;
GRANT SELECT, INSERT, DELETE ON public.vsi_generosity_rate_limits TO vsi_gen_public;
GRANT USAGE, SELECT ON SEQUENCE public.vsi_generosity_rate_limits_id_seq TO vsi_gen_public;

-- Production may use the existing restricted application login for the admin
-- API. Grant access only if that role exists; never grant admin privileges to
-- the anonymous/public submission role.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'vsi_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.vsi_generosity_offers TO vsi_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.vsi_generosity_offer_items TO vsi_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.vsi_generosity_audit_log TO vsi_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.vsi_generosity_rate_limits TO vsi_app;
    GRANT USAGE, SELECT ON SEQUENCE public.vsi_generosity_rate_limits_id_seq TO vsi_app;
    GRANT USAGE, SELECT ON SEQUENCE public.vsi_generosity_audit_log_id_seq TO vsi_app;
  END IF;
END $$;
