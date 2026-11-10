-- Keep unique people reached separate from the number of sessions delivered.
ALTER TABLE vsi_impact_activities
  ADD COLUMN IF NOT EXISTS sessions_conducted integer
  CHECK (sessions_conducted IS NULL OR sessions_conducted >= 0);

COMMENT ON COLUMN vsi_impact_activities.sessions_conducted IS
  'Number of sessions delivered for this activity. Kept separate from unique people reached.';
