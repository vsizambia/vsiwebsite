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
