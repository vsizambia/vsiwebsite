-- Add the user-defined Other category to VSI Generosity pledges.
-- Safe to run against existing data; existing category values remain valid.
ALTER TABLE public.vsi_generosity_offer_items
  DROP CONSTRAINT IF EXISTS vsi_generosity_offer_items_category_check;

ALTER TABLE public.vsi_generosity_offer_items
  ADD CONSTRAINT vsi_generosity_offer_items_category_check
  CHECK (category IN ('educational_materials','ovc_support','maternity_mothers','maternity_newborns','other'));
