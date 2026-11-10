-- Keep unique people reached separate from the number of sessions delivered.
ALTER TABLE vsi_impact_activities
  ADD COLUMN IF NOT EXISTS sessions_conducted integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'vsi_impact_activities_sessions_nonnegative'
  ) THEN
    ALTER TABLE vsi_impact_activities
      ADD CONSTRAINT vsi_impact_activities_sessions_nonnegative
      CHECK (sessions_conducted IS NULL OR sessions_conducted >= 0);
  END IF;
END $$;

COMMENT ON COLUMN vsi_impact_activities.sessions_conducted IS
  'Number of sessions delivered for this activity. Kept separate from unique people reached.';
