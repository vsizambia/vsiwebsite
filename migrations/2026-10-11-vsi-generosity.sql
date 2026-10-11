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
GRANT SELECT, INSERT, DELETE ON public.vsi_generosity_rate_limits TO vsi_gen_public;
GRANT USAGE, SELECT ON SEQUENCE public.vsi_generosity_rate_limits_id_seq TO vsi_gen_public;

-- Administrative operations use the existing privileged server-side pool.
