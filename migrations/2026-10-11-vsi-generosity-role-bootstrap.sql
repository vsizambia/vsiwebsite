-- VSI Generosity production role bootstrap
-- Run once in the Official VSI Website production branch using the Neon SQL
-- Editor as an authorized database owner. Do NOT use Neon API "Create role" for
-- this role: that workflow may attach elevated Neon roles.
--
-- Set/reset the password using the Neon Console after creation. Never commit
-- a database password or place it in source control.
--
-- This role is intentionally not a table owner and has no elevated attributes.
CREATE ROLE vsi_gen_public
  LOGIN
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOINHERIT
  NOREPLICATION
  NOBYPASSRLS;

-- Verify these return false for elevated attributes and membership.
SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb,
       rolreplication, rolbypassrls, rolcanlogin
FROM pg_roles
WHERE rolname = 'vsi_gen_public';

SELECT pg_has_role('vsi_gen_public', 'neon_superuser', 'MEMBER')
       AS is_neon_superuser_member;
