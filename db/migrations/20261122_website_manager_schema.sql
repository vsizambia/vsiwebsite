-- Website manager schema is provisioned by migrations, never by request handlers.
-- The application role receives only the table operations required by the manager.

CREATE TABLE IF NOT EXISTS public.website_pages (
  id bigserial PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  draft_content jsonb NOT NULL DEFAULT '[]'::jsonb,
  published_content jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.website_page_versions (
  id bigserial PRIMARY KEY,
  page_id bigint NOT NULL REFERENCES public.website_pages(id) ON DELETE CASCADE,
  content jsonb NOT NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS website_page_versions_page_id_created_at_idx
  ON public.website_page_versions (page_id, created_at DESC);

ALTER TABLE public.website_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_page_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS transitional_vsi_app_access ON public.website_pages;
CREATE POLICY transitional_vsi_app_access
  ON public.website_pages FOR ALL TO vsi_app
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS transitional_vsi_app_access ON public.website_page_versions;
CREATE POLICY transitional_vsi_app_access
  ON public.website_page_versions FOR ALL TO vsi_app
  USING (true) WITH CHECK (true);

REVOKE ALL PRIVILEGES ON TABLE public.website_pages, public.website_page_versions FROM PUBLIC;
REVOKE ALL PRIVILEGES ON SEQUENCE public.website_pages_id_seq, public.website_page_versions_id_seq FROM PUBLIC;

GRANT USAGE ON SCHEMA public TO vsi_app;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.website_pages, public.website_page_versions TO vsi_app;
GRANT USAGE, SELECT
  ON SEQUENCE public.website_pages_id_seq, public.website_page_versions_id_seq TO vsi_app;
