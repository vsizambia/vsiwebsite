-- Restrict the anonymous Generosity database role to the exact columns used by
-- the public submission handler. In particular, it must not be able to set
-- email_verified_at, collection/status fields, or archive metadata.
BEGIN;

REVOKE INSERT ON TABLE public.vsi_generosity_offers FROM vsi_gen_public;
REVOKE INSERT (email_verified_at) ON TABLE public.vsi_generosity_offers FROM vsi_gen_public;
GRANT INSERT (
  id,
  reference,
  first_name,
  last_name,
  gender,
  age_range,
  email,
  phone,
  town_area,
  pickup_address,
  phone_consent,
  email_consent,
  consent_version,
  additional_information
) ON TABLE public.vsi_generosity_offers TO vsi_gen_public;

-- Public submissions may create pledge item rows, but cannot set collection
-- quantities, item notes, or update timestamps directly.
REVOKE INSERT ON TABLE public.vsi_generosity_offer_items FROM vsi_gen_public;
GRANT INSERT (
  id,
  offer_id,
  category,
  item_key,
  item_label,
  quantity_pledged,
  unit,
  size_details
) ON TABLE public.vsi_generosity_offer_items TO vsi_gen_public;

COMMIT;
