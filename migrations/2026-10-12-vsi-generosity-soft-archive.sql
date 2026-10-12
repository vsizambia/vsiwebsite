-- VSI Generosity: reversible pledge archiving and durable audit references.
-- Apply through the controlled database migration workflow; do not run from request handlers.

ALTER TABLE public.vsi_generosity_offers
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by text;

-- Preserve the pledge reference even if a record is ever permanently purged later.
ALTER TABLE public.vsi_generosity_audit_log
  ADD COLUMN IF NOT EXISTS offer_reference text;

UPDATE public.vsi_generosity_audit_log a
SET offer_reference = o.reference
FROM public.vsi_generosity_offers o
WHERE a.offer_id = o.id
  AND a.offer_reference IS NULL;

ALTER TABLE public.vsi_generosity_audit_log
  DROP CONSTRAINT IF EXISTS vsi_generosity_audit_log_offer_id_fkey;

ALTER TABLE public.vsi_generosity_audit_log
  DROP CONSTRAINT IF EXISTS vsi_generosity_audit_log_offer_id_not_null;

ALTER TABLE public.vsi_generosity_audit_log
  ALTER COLUMN offer_id DROP NOT NULL;

ALTER TABLE public.vsi_generosity_audit_log
  ADD CONSTRAINT vsi_generosity_audit_log_offer_id_fkey
  FOREIGN KEY (offer_id) REFERENCES public.vsi_generosity_offers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS vsi_generosity_offers_deleted_idx
  ON public.vsi_generosity_offers (deleted_at, created_at DESC);

CREATE INDEX IF NOT EXISTS vsi_generosity_audit_reference_idx
  ON public.vsi_generosity_audit_log (offer_reference, created_at DESC);

-- Existing RLS and server-role policies remain in force.

-- Keep references populated during a rolling deployment, including inserts
-- from an older application instance that does not yet send offer_reference.
CREATE OR REPLACE FUNCTION public.vsi_generosity_fill_audit_reference()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.offer_reference IS NULL AND NEW.offer_id IS NOT NULL THEN
    SELECT reference INTO NEW.offer_reference
    FROM public.vsi_generosity_offers
    WHERE id = NEW.offer_id;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS vsi_generosity_audit_reference_fill ON public.vsi_generosity_audit_log;
CREATE TRIGGER vsi_generosity_audit_reference_fill
  BEFORE INSERT OR UPDATE OF offer_id
  ON public.vsi_generosity_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.vsi_generosity_fill_audit_reference();
