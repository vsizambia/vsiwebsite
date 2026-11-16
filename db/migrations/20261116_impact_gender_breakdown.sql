-- Separate people reached by age/sex category for reliable dashboard reporting.
-- Existing male_reached/female_reached fields are retained unchanged because historical
-- entries do not consistently distinguish children from adults.
ALTER TABLE public.vsi_impact_activities
  ADD COLUMN IF NOT EXISTS boys_reached integer,
  ADD COLUMN IF NOT EXISTS girls_reached integer,
  ADD COLUMN IF NOT EXISTS men_reached integer,
  ADD COLUMN IF NOT EXISTS women_reached integer;

ALTER TABLE public.vsi_impact_activities
  ADD CONSTRAINT vsi_impact_activities_boys_reached_nonnegative CHECK (boys_reached IS NULL OR boys_reached >= 0),
  ADD CONSTRAINT vsi_impact_activities_girls_reached_nonnegative CHECK (girls_reached IS NULL OR girls_reached >= 0),
  ADD CONSTRAINT vsi_impact_activities_men_reached_nonnegative CHECK (men_reached IS NULL OR men_reached >= 0),
  ADD CONSTRAINT vsi_impact_activities_women_reached_nonnegative CHECK (women_reached IS NULL OR women_reached >= 0);
