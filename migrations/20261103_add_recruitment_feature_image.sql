-- Add optional public feature images to recruitment opportunities.
ALTER TABLE public.vsi_recruitment_opportunities
  ADD COLUMN IF NOT EXISTS feature_image_url text;
