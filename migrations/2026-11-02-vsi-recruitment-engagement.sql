-- VSI Recruitment & Engagement Portal
-- Apply through the controlled Neon migration process; never from a request handler.
CREATE TABLE IF NOT EXISTS vsi_recruitment_opportunities (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('permanent_staff','contract_staff','consultant','project_staff','volunteer')),
  department TEXT,
  duty_station TEXT,
  description TEXT NOT NULL,
  requirements TEXT,
  closing_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','closed','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS vsi_recruitment_opportunities_public_idx
  ON vsi_recruitment_opportunities(status, closing_date);

CREATE TABLE IF NOT EXISTS vsi_recruitment_applications (
  id BIGSERIAL PRIMARY KEY,
  opportunity_id BIGINT NOT NULL REFERENCES vsi_recruitment_opportunities(id) ON DELETE RESTRICT,
  reference_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT,
  education TEXT,
  current_occupation TEXT,
  experience TEXT,
  motivation TEXT NOT NULL,
  portfolio_url TEXT,
  cv_blob_url TEXT,
  cv_file_name TEXT,
  status TEXT NOT NULL DEFAULT 'received'
    CHECK (status IN ('received','under_review','shortlisted','interview','selected','unsuccessful','withdrawn')),
  reviewer_notes TEXT,
  consent_policy_version TEXT NOT NULL,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS vsi_recruitment_applications_opportunity_idx
  ON vsi_recruitment_applications(opportunity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS vsi_recruitment_applications_status_idx
  ON vsi_recruitment_applications(status, created_at DESC);

-- Anonymous recruitment submissions use the restricted public database role.
ALTER TABLE vsi_recruitment_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsi_recruitment_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY vsi_recruitment_public_read_opportunities ON vsi_recruitment_opportunities
  FOR SELECT TO vsi_gen_public USING (status='published' AND (closing_date IS NULL OR closing_date >= CURRENT_DATE));
CREATE POLICY vsi_recruitment_public_submit_applications ON vsi_recruitment_applications
  FOR INSERT TO vsi_gen_public WITH CHECK (status='received' AND consented_at <= NOW() AND consent_policy_version='2026-11');
GRANT SELECT ON vsi_recruitment_opportunities TO vsi_gen_public;
GRANT INSERT (opportunity_id,reference_number,full_name,email,phone,location,education,current_occupation,experience,motivation,portfolio_url,consent_policy_version)
  ON vsi_recruitment_applications TO vsi_gen_public;
GRANT USAGE, SELECT ON SEQUENCE vsi_recruitment_applications_id_seq TO vsi_gen_public;
