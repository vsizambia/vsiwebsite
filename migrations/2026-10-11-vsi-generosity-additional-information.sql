-- Store optional general information submitted in Section 04 of the VSI Generosity form.
ALTER TABLE public.vsi_generosity_offers
  ADD COLUMN IF NOT EXISTS additional_information text;
