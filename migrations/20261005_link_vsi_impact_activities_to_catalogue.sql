-- Link Impact activity records to the official VSI Master Activity Catalogue.
ALTER TABLE vsi_impact_activities
ADD COLUMN IF NOT EXISTS catalogue_activity_code text;

CREATE INDEX IF NOT EXISTS vsi_impact_activities_catalogue_code_idx
ON vsi_impact_activities(catalogue_activity_code);

UPDATE vsi_impact_activities a
SET catalogue_activity_code = c.activity_code
FROM vsi_master_activity_catalogue c
WHERE a.catalogue_activity_code IS NULL
  AND a.activity_name = c.activity;
