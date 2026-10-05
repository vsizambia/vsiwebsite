-- Optional gender disaggregation for mass marketeer outreach.
-- Kept separate from male_reached/female_reached so adult marketeer data
-- never gets mixed into child reach totals.
ALTER TABLE vsi_impact_activities
  ADD COLUMN IF NOT EXISTS male_marketeers_reached integer,
  ADD COLUMN IF NOT EXISTS female_marketeers_reached integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'vsi_impact_activities_marketeer_gender_nonnegative'
  ) THEN
    ALTER TABLE vsi_impact_activities
      ADD CONSTRAINT vsi_impact_activities_marketeer_gender_nonnegative CHECK (
        COALESCE(male_marketeers_reached,0) >= 0 AND
        COALESCE(female_marketeers_reached,0) >= 0
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS vsi_impact_activities_marketeer_gender_idx
  ON vsi_impact_activities(male_marketeers_reached, female_marketeers_reached);
