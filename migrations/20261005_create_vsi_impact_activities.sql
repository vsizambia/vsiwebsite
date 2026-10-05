-- VSI Impact Activity Register
-- Stores the activity-level evidence behind the public Impact dashboard.
CREATE TABLE IF NOT EXISTS vsi_impact_activities (
  id bigserial PRIMARY KEY,
  programme_key text NOT NULL REFERENCES vsi_impact_programmes(programme_key) ON DELETE CASCADE,
  activity_name text NOT NULL,
  activity_date date NOT NULL,
  province text,
  district text,
  constituency text,
  ward text,
  partner text,
  male_reached integer,
  female_reached integer,
  marketeers_reached integer,
  documents_contributed integer,
  institutions_engaged integer,
  people_reached integer,
  items_donated integer,
  schools_supported integer,
  youth_participants integer,
  trees_planted integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT vsi_impact_activities_nonnegative CHECK (
    COALESCE(male_reached,0) >= 0 AND COALESCE(female_reached,0) >= 0 AND
    COALESCE(marketeers_reached,0) >= 0 AND COALESCE(documents_contributed,0) >= 0 AND
    COALESCE(institutions_engaged,0) >= 0 AND COALESCE(people_reached,0) >= 0 AND
    COALESCE(items_donated,0) >= 0 AND COALESCE(schools_supported,0) >= 0 AND
    COALESCE(youth_participants,0) >= 0 AND COALESCE(trees_planted,0) >= 0
  )
);
CREATE INDEX IF NOT EXISTS vsi_impact_activities_programme_idx ON vsi_impact_activities(programme_key);
CREATE INDEX IF NOT EXISTS vsi_impact_activities_date_idx ON vsi_impact_activities(activity_date DESC);
UPDATE vsi_impact_programmes SET title = 'VSI On-Campus Mentorship Programme' WHERE programme_key = 'education-support';
