-- VSI Volunteer Self-Service Portal: one-time email verification and revocable sessions.
-- Apply through the normal controlled migration process before enabling the portal.
CREATE TABLE IF NOT EXISTS volunteer_portal_challenges (
  id UUID PRIMARY KEY,
  volunteer_application_id BIGINT NULL REFERENCES volunteer_applications(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  identity_hash TEXT NOT NULL,
  client_ip_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS volunteer_portal_challenges_identity_created_idx
  ON volunteer_portal_challenges(identity_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS volunteer_portal_challenges_ip_created_idx
  ON volunteer_portal_challenges(client_ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS volunteer_portal_challenges_expiry_idx
  ON volunteer_portal_challenges(expires_at);

CREATE TABLE IF NOT EXISTS volunteer_portal_sessions (
  id BIGSERIAL PRIMARY KEY,
  volunteer_application_id BIGINT NOT NULL REFERENCES volunteer_applications(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS volunteer_portal_sessions_volunteer_expiry_idx
  ON volunteer_portal_sessions(volunteer_application_id, expires_at);
CREATE INDEX IF NOT EXISTS volunteer_portal_sessions_expiry_idx
  ON volunteer_portal_sessions(expires_at);
