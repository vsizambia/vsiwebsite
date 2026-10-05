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
  ('ovc-support', '01', 'Community Service & Humanitarian Action', 'COMMUNITY IMPACT',
   'Community service, humanitarian support, OVC assistance, donations and practical action that respond to community needs.',
   '[{"key":"activities","value":0,"label":"Activities conducted"},{"key":"male","value":0,"label":"Boys reached"},{"key":"female","value":0,"label":"Girls reached"}]'::jsonb),
  ('clean-green-healthy', '02', 'Keep Zambia Clean, Green and Healthy', 'COMMUNITY ACTION',
   'Mobilising communities, schools and marketeers to help create cleaner, greener and healthier public spaces.',
   '[{"key":"activities","value":0,"label":"Activities conducted"},{"key":"marketeers","value":0,"label":"Marketeers reached"}]'::jsonb),
  ('education-support', '03', 'Education, Schools & Youth Development', 'LEARNING & OPPORTUNITY',
   'Supporting learners through school outreach, mentorship, civic learning, scholastic support and youth development opportunities.',
   '[{"key":"activities","value":0,"label":"Activities conducted"},{"key":"male","value":0,"label":"Boys reached"},{"key":"female","value":0,"label":"Girls reached"}]'::jsonb),
  ('civic-voter', '04', 'Civic & Voter Education', 'CIVIC LEADERSHIP',
   'Promoting informed citizenship, democratic participation, electoral awareness and community civic education in a non-partisan way.',
   '[{"key":"activities","value":0,"label":"Activities conducted"},{"key":"male","value":0,"label":"Boys & men reached"},{"key":"female","value":0,"label":"Girls & women reached"}]'::jsonb),
  ('youth-policy', '05', 'Youth Policy Dialogue & Participation', 'YOUTH VOICE',
   'Creating spaces for young people to participate in policy consultations, governance dialogues and national conversations.',
   '[{"key":"activities","value":0,"label":"Activities conducted"},{"key":"male","value":0,"label":"Male participants"},{"key":"female","value":0,"label":"Female participants"},{"key":"institutions","value":0,"label":"Institutions engaged"}]'::jsonb),
  ('policy-contribution', '06', 'Policy Advocacy, Research & Governance', 'POLICY & ADVOCACY',
   'Generating evidence, research, advocacy, policy submissions, dialogue and engagement that contribute to better decisions.',
   '[{"key":"activities","value":0,"label":"Activities conducted"},{"key":"documents","value":0,"label":"Policy & research outputs"},{"key":"institutions","value":0,"label":"Institutions engaged"}]'::jsonb),
  ('community-health', '07', 'Community Health & Wellbeing', 'HEALTH & WELLBEING',
   'Taking health information, wellbeing awareness, community outreach, screening, referral and health-support activities closer to people.',
   '[{"key":"activities","value":0,"label":"Activities conducted"},{"key":"male","value":0,"label":"Male reached"},{"key":"female","value":0,"label":"Female reached"}]'::jsonb),
  ('youth-skills', '08', 'Youth Skills, Innovation & Economic Empowerment', 'YOUTH DEVELOPMENT',
   'Building practical skills and opportunities through agriculture, technology, innovation, entrepreneurship, volunteering and youth capacity development.',
   '[{"key":"activities","value":0,"label":"Activities conducted"},{"key":"male","value":0,"label":"Male reached"},{"key":"female","value":0,"label":"Female reached"}]'::jsonb)
ON CONFLICT (programme_key) DO UPDATE SET
  number=EXCLUDED.number,title=EXCLUDED.title,category=EXCLUDED.category,description=EXCLUDED.description;
