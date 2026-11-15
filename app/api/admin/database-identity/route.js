import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET(request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401, headers });
  }

  try {
    const result = await pool.query(`
      SELECT
        current_user AS role_name,
        session_user AS session_role,
        current_database() AS database_name,
        role_info.rolsuper AS superuser,
        role_info.rolcreatedb AS create_db,
        role_info.rolcreaterole AS create_role,
        role_info.rolreplication AS replication,
        role_info.rolbypassrls AS bypass_rls,
        EXISTS (
          SELECT 1
          FROM pg_auth_members membership
          JOIN pg_roles parent_role ON parent_role.oid = membership.roleid
          WHERE membership.member = role_info.oid
            AND parent_role.rolname = 'neon_superuser'
        ) AS member_of_neon_superuser
      FROM pg_roles role_info
      WHERE role_info.rolname = current_user
    `);

    if (!result.rows[0]) {
      return NextResponse.json({ error: "Database role information unavailable." }, { status: 503, headers });
    }

    return NextResponse.json(result.rows[0], { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "Database identity check failed." }, { status: 503, headers });
  }
}
