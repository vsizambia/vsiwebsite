-- VSI Impact Cards: controlled schema migration.
-- Apply this migration to the production PostgreSQL database before using the Admin form.
CREATE TABLE IF NOT EXISTS vsi_impact_programmes (
  programme_key text PRIMARY KEY,
  number text NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  metrics jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT vsi_impact_programmes_metrics_array CHECK (jsonb_typeof(metrics) = 'array')
);

INSERT INTO vsi_impact_programmes (programme_key, number, title, category, description, metrics)
VALUES
  ('ovc-support', '01', 'OVC Support', 'CHARITY WORK',
   'Supporting orphans and vulnerable children through community-focused charity work.',
   '[{"key":"activities","value":null,"label":"Activities conducted"},{"key":"male","value":null,"label":"Male reached"},{"key":"female","value":null,"label":"Female reached"}]'::jsonb),
  ('clean-green-healthy', '02', 'Keep Zambia Clean, Green and Healthy', 'COMMUNITY ACTION',
   'Mobilising communities and marketeers to help create cleaner, greener and healthier public spaces.',
   '[{"key":"activities","value":null,"label":"Activities conducted"},{"key":"marketeers","value":null,"label":"Marketeers reached"}]'::jsonb),
  ('education-support', '03', 'Education Support', 'LEARNING & OPPORTUNITY',
   'Helping learners access support and opportunities that can strengthen their educational journey.',
   '[{"key":"activities","value":null,"label":"Activities conducted"},{"key":"male","value":null,"label":"Male reached"},{"key":"female","value":null,"label":"Female reached"}]'::jsonb),
  ('policy-contribution', '04', 'Policy Contribution', 'POLICY & ADVOCACY',
   'Contributing evidence, recommendations and perspectives to policies affecting young people and communities.',
   '[{"key":"documents","value":null,"label":"Documents contributed"},{"key":"institutions","value":null,"label":"Ministries & departments engaged"}]'::jsonb)
ON CONFLICT (programme_key) DO NOTHING;
