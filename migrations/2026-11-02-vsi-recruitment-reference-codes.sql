-- Sequential monthly VSI HRD recruitment references.
-- Format: VSI/HRD/YYYY/MMYYNNN (e.g. VSI/HRD/2026/1126001).
-- The counter is maintained in the database so concurrent submissions cannot duplicate a number.
CREATE TABLE IF NOT EXISTS public.vsi_recruitment_reference_counters (
  period_key text PRIMARY KEY CHECK (period_key ~ '^[0-9]{6}$'),
  last_number integer NOT NULL CHECK (last_number >= 1),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vsi_recruitment_reference_counters ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.vsi_recruitment_reference_counters FROM PUBLIC, vsi_public, vsi_gen_public;

CREATE OR REPLACE FUNCTION public.vsi_recruitment_next_reference()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
DECLARE
  v_local_now timestamp;
  v_year text;
  v_month text;
  v_period_key text;
  v_sequence integer;
BEGIN
  v_local_now := timezone('Africa/Lusaka', clock_timestamp());
  v_year := to_char(v_local_now, 'YYYY');
  v_month := to_char(v_local_now, 'MM');
  v_period_key := v_year || v_month;

  INSERT INTO public.vsi_recruitment_reference_counters (period_key, last_number)
  VALUES (v_period_key, 1)
  ON CONFLICT (period_key)
  DO UPDATE SET
    last_number = public.vsi_recruitment_reference_counters.last_number + 1,
    updated_at = now()
  RETURNING last_number INTO v_sequence;

  RETURN 'VSI/HRD/' || v_year || '/' || v_month || right(v_year, 2) || lpad(v_sequence::text, 3, '0');
END;
$function$;

REVOKE ALL ON FUNCTION public.vsi_recruitment_next_reference() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vsi_recruitment_next_reference() TO vsi_public, vsi_gen_public;
