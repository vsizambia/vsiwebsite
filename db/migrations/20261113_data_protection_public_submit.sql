-- Apply as the database owner on the production branch before deploying
-- the application change. The app login is created separately and receives
-- EXECUTE only; it must not receive direct access to either table.

CREATE TABLE IF NOT EXISTS public.data_protection_request_rate_limits (
  id bigserial PRIMARY KEY,
  ip_hash text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS data_protection_request_rate_limits_ip_time_idx
  ON public.data_protection_request_rate_limits (ip_hash, requested_at DESC);

ALTER TABLE public.data_protection_request_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_protection_request_rate_limits FORCE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.vsi_submit_data_protection_request(
  p_ip_hash text,
  p_request_type text,
  p_requester_name text,
  p_requester_email text,
  p_details text
)
RETURNS TABLE(id bigint, received_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_count integer;
BEGIN
  IF p_ip_hash IS NULL
    OR p_ip_hash !~ '^[0-9a-f]{64} ('access', 'correction', 'deletion', 'withdraw_consent', 'processing_information', 'complaint')
    OR length(btrim(p_requester_name)) = 0
    OR length(p_requester_name) > 200
    OR p_requester_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    OR length(p_requester_email) > 254
    OR length(coalesce(p_details, '')) > 10000
  THEN
    RAISE EXCEPTION 'INVALID_REQUEST' USING ERRCODE = '22023';
  END IF;

  -- Serialize requests from the same hashed IP so concurrent submissions
  -- cannot bypass the five-per-15-minute limit.
  PERFORM pg_advisory_xact_lock(hashtext('data-protection:' || p_ip_hash));

  -- Keep only one day of hashed-IP rate-limit records.
  DELETE FROM public.data_protection_request_rate_limits
  WHERE requested_at < now() - interval '24 hours';

  SELECT count(*) INTO v_count
  FROM public.data_protection_request_rate_limits
  WHERE ip_hash = p_ip_hash
    AND requested_at >= now() - interval '15 minutes';

  IF v_count >= 5 THEN
    RAISE EXCEPTION 'RATE_LIMITED' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.data_protection_request_rate_limits (ip_hash)
  VALUES (p_ip_hash);

  RETURN QUERY
  INSERT INTO public.data_protection_requests (
    request_type, requester_name, requester_email, details
  )
  VALUES (
    p_request_type,
    btrim(p_requester_name),
    lower(btrim(p_requester_email)),
    nullif(btrim(coalesce(p_details, '')), '')
  )
  RETURNING data_protection_requests.id, data_protection_requests.received_at;
END;
$function$;

REVOKE ALL ON TABLE public.data_protection_request_rate_limits FROM PUBLIC;
REVOKE ALL ON SEQUENCE public.data_protection_request_rate_limits_id_seq FROM PUBLIC;
REVOKE ALL ON FUNCTION public.vsi_submit_data_protection_request(text, text, text, text, text) FROM PUBLIC;

GRANT USAGE ON SCHEMA public TO vsi_data_protection_api;
GRANT EXECUTE ON FUNCTION public.vsi_submit_data_protection_request(text, text, text, text, text)
  TO vsi_data_protection_api;

    OR p_request_type IS NULL
    OR p_requester_name IS NULL
    OR p_requester_email IS NULL
    OR p_request_type NOT IN ('access', 'correction', 'deletion', 'withdraw_consent', 'processing_information', 'complaint')
    OR length(btrim(p_requester_name)) = 0
    OR length(p_requester_name) > 200
    OR p_requester_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    OR length(p_requester_email) > 254
    OR length(coalesce(p_details, '')) > 10000
  THEN
    RAISE EXCEPTION 'INVALID_REQUEST' USING ERRCODE = '22023';
  END IF;

  -- Serialize requests from the same hashed IP so concurrent submissions
  -- cannot bypass the five-per-15-minute limit.
  PERFORM pg_advisory_xact_lock(hashtext('data-protection:' || p_ip_hash));

  -- Keep only one day of hashed-IP rate-limit records.
  DELETE FROM public.data_protection_request_rate_limits
  WHERE requested_at < now() - interval '24 hours';

  SELECT count(*) INTO v_count
  FROM public.data_protection_request_rate_limits
  WHERE ip_hash = p_ip_hash
    AND requested_at >= now() - interval '15 minutes';

  IF v_count >= 5 THEN
    RAISE EXCEPTION 'RATE_LIMITED' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.data_protection_request_rate_limits (ip_hash)
  VALUES (p_ip_hash);

  RETURN QUERY
  INSERT INTO public.data_protection_requests (
    request_type, requester_name, requester_email, details
  )
  VALUES (
    p_request_type,
    btrim(p_requester_name),
    lower(btrim(p_requester_email)),
    nullif(btrim(coalesce(p_details, '')), '')
  )
  RETURNING data_protection_requests.id, data_protection_requests.received_at;
END;
$function$;

REVOKE ALL ON TABLE public.data_protection_request_rate_limits FROM PUBLIC;
REVOKE ALL ON SEQUENCE public.data_protection_request_rate_limits_id_seq FROM PUBLIC;
REVOKE ALL ON FUNCTION public.vsi_submit_data_protection_request(text, text, text, text, text) FROM PUBLIC;

GRANT USAGE ON SCHEMA public TO vsi_data_protection_api;
GRANT EXECUTE ON FUNCTION public.vsi_submit_data_protection_request(text, text, text, text, text)
  TO vsi_data_protection_api;
