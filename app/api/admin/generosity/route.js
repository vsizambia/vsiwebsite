import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";

const unauthorized = () => NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
const allowedStatuses = ["offer_received","contact_in_progress","collection_arranged","partially_collected","fully_collected","withdrawn","closed"];
const clean = (value, max = 2000) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function GET(request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  try {
    const [summary, offers] = await Promise.all([
      pool.query(`SELECT
        COUNT(*)::int AS offers_total,
        COUNT(DISTINCT lower(email))::int AS contributors,
        COALESCE((SELECT SUM(quantity_pledged) FROM public.vsi_generosity_offer_items),0)::bigint AS quantities_pledged,
        COALESCE((SELECT SUM(quantity_collected) FROM public.vsi_generosity_offer_items),0)::bigint AS quantities_collected,
        COUNT(*) FILTER (WHERE status IN ('offer_received','contact_in_progress'))::int AS awaiting_collection,
        COUNT(*) FILTER (WHERE status='collection_arranged')::int AS collection_arranged,
        COUNT(*) FILTER (WHERE status='partially_collected')::int AS partially_collected,
        COUNT(*) FILTER (WHERE status='fully_collected')::int AS fully_collected
        FROM public.vsi_generosity_offers`),
      pool.query(`SELECT o.id,o.reference,o.first_name,o.last_name,o.gender,o.age_range,o.email,o.phone,o.town_area,o.pickup_address,o.additional_information,o.phone_consent,o.email_consent,o.status,o.staff_notes,o.closure_reason,o.created_at,o.updated_at,o.collection_arranged_at,o.closed_at,
        COALESCE(json_agg(json_build_object(
          'id',i.id,'category',i.category,'itemKey',i.item_key,'itemLabel',i.item_label,
          'quantityPledged',i.quantity_pledged,'quantityCollected',i.quantity_collected,
          'unit',i.unit,'sizeDetails',i.size_details,'itemNotes',i.item_notes
        ) ORDER BY i.category,i.item_label) FILTER (WHERE i.id IS NOT NULL),'[]'::json) AS items
        FROM public.vsi_generosity_offers o
        LEFT JOIN public.vsi_generosity_offer_items i ON i.offer_id=o.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT 500`)
    ]);
    return NextResponse.json({ summary: summary.rows[0] || {}, offers: offers.rows });
  } catch (error) {
    console.error("VSI Generosity admin GET failed:", error);
    return NextResponse.json({ error: "Unable to load the VSI Generosity dashboard. Confirm the approved database migration has been applied." }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  let client;
  try {
    const body = await request.json();
    const id = clean(body?.id, 80);
    const status = clean(body?.status, 40);
    const staffNotes = body?.staffNotes === undefined ? undefined : clean(body.staffNotes, 4000);
    const closureReason = body?.closureReason === undefined ? undefined : clean(body.closureReason, 1000);
    const contact = body?.contact === undefined ? undefined : {
      firstName: clean(body.contact?.firstName, 80),
      lastName: clean(body.contact?.lastName, 80),
      email: clean(body.contact?.email, 254).toLowerCase(),
      phone: clean(body.contact?.phone, 40),
      townArea: clean(body.contact?.townArea, 120),
      pickupAddress: clean(body.contact?.pickupAddress, 300) || null,
    };
    const itemUpdates = body?.items;
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "A valid pledge ID is required." }, { status: 400 });
    if (status && !allowedStatuses.includes(status)) return NextResponse.json({ error: "Choose a valid collection status." }, { status: 400 });
    if (itemUpdates !== undefined && (!Array.isArray(itemUpdates) || itemUpdates.length > 30)) return NextResponse.json({ error: "Invalid item updates." }, { status: 400 });
    if (contact && (!contact.firstName || !contact.lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) || !/^[+0-9()\s-]{7,40}$/.test(contact.phone) || !contact.townArea)) {
      return NextResponse.json({ error: "Please provide a valid name, email, phone number and collection town / area." }, { status: 400 });
    }
    if (status === "closed" && !closureReason) return NextResponse.json({ error: "Please record a reason before closing this pledge." }, { status: 400 });
    if (status === "withdrawn" && !closureReason) return NextResponse.json({ error: "Please record a reason before withdrawing this pledge." }, { status: 400 });

    client = await pool.connect();
    await client.query("BEGIN");
    const current = await client.query("SELECT id,reference,status FROM public.vsi_generosity_offers WHERE id=$1 FOR UPDATE", [id]);
    if (!current.rowCount) { await client.query("ROLLBACK"); return NextResponse.json({ error: "Generosity pledge not found." }, { status: 404 }); }

    if (contact) {
      await client.query(
        `UPDATE public.vsi_generosity_offers SET first_name=$2,last_name=$3,email=$4,phone=$5,town_area=$6,pickup_address=$7,updated_at=NOW() WHERE id=$1`,
        [id,contact.firstName,contact.lastName,contact.email,contact.phone,contact.townArea,contact.pickupAddress]
      );
    }

    const changedItems = [];
    if (itemUpdates) {
      for (const update of itemUpdates) {
        const itemId = clean(update?.id, 80);
        if (!/^[0-9a-f-]{36}$/i.test(itemId)) {
          await client.query("ROLLBACK");
          return NextResponse.json({ error: "A valid pledge item ID is required." }, { status: 400 });
        }
        const existingItem = await client.query(
          "SELECT quantity_pledged,quantity_collected FROM public.vsi_generosity_offer_items WHERE id=$1 AND offer_id=$2 FOR UPDATE",
          [itemId,id]
        );
        if (!existingItem.rowCount) {
          await client.query("ROLLBACK");
          return NextResponse.json({ error: "A pledge item does not belong to this offer." }, { status: 400 });
        }
        const pledged = update?.quantityPledged === undefined ? Number(existingItem.rows[0].quantity_pledged) : Number(update.quantityPledged);
        const collected = update?.quantityCollected === undefined ? Number(existingItem.rows[0].quantity_collected) : Number(update.quantityCollected);
        if (!Number.isSafeInteger(pledged) || pledged < 1 || pledged > 1000000 || !Number.isSafeInteger(collected) || collected < 0 || collected > pledged) {
          await client.query("ROLLBACK");
          return NextResponse.json({ error: "Pledged quantities must be whole numbers from 1 to 1,000,000, and collected quantities must be between zero and the pledge." }, { status: 400 });
        }
        const result = await client.query(
          `UPDATE public.vsi_generosity_offer_items
           SET quantity_pledged=$1,quantity_collected=$2,updated_at=NOW()
           WHERE id=$3 AND offer_id=$4
           RETURNING id,item_label,quantity_pledged,quantity_collected`,
          [pledged,collected,itemId,id]
        );
        changedItems.push(result.rows[0]);
      }
    }
    const quantities = await client.query(
      "SELECT COUNT(*)::int AS item_count,COUNT(*) FILTER (WHERE quantity_collected=quantity_pledged)::int AS complete_count,COALESCE(SUM(quantity_collected),0)::bigint AS collected,COALESCE(SUM(quantity_pledged),0)::bigint AS pledged FROM public.vsi_generosity_offer_items WHERE offer_id=$1",
      [id]
    );
    const q = quantities.rows[0];
    let nextStatus = status || current.rows[0].status;
    if (itemUpdates?.length && !status) {
      if (Number(q.complete_count) === Number(q.item_count) && Number(q.item_count) > 0) nextStatus = "fully_collected";
      else if (Number(q.collected) > 0) nextStatus = "partially_collected";
    }
    if (nextStatus === "fully_collected" && (Number(q.item_count) === 0 || Number(q.complete_count) !== Number(q.item_count))) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Mark a pledge fully collected only after every pledged item quantity has been received." }, { status: 400 });
    }
    if (nextStatus === "partially_collected" && (Number(q.collected) <= 0 || Number(q.complete_count) === Number(q.item_count))) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Partially collected requires at least one received item and some quantity still outstanding." }, { status: 400 });
    }
    if (nextStatus === "collection_arranged" && Number(q.collected) > 0 && Number(q.complete_count) === Number(q.item_count)) nextStatus = "fully_collected";
    const updated = await client.query(
      `UPDATE public.vsi_generosity_offers SET
       status=$1,
       staff_notes=CASE WHEN $2::boolean THEN $3 ELSE staff_notes END,
       closure_reason=CASE WHEN $4::boolean THEN $5 ELSE closure_reason END,
       collection_arranged_at=CASE WHEN $1='collection_arranged' THEN COALESCE(collection_arranged_at,NOW()) ELSE collection_arranged_at END,
       closed_at=CASE WHEN $1 IN ('withdrawn','closed','fully_collected') THEN COALESCE(closed_at,NOW()) ELSE NULL END,
       updated_at=NOW()
       WHERE id=$6 RETURNING reference,status,staff_notes,closure_reason,collection_arranged_at,closed_at,updated_at`,
      [nextStatus,staffNotes!==undefined,staffNotes??null,closureReason!==undefined,closureReason??null,id]
    );
    await client.query(
      "INSERT INTO public.vsi_generosity_audit_log (offer_id,action,details,actor) VALUES ($1,$2,$3::jsonb,$4)",
      [id,"offer_updated",JSON.stringify({status:nextStatus,items:changedItems,contactChanged:contact!==undefined,staffNotesChanged:staffNotes!==undefined,closureReasonChanged:closureReason!==undefined}),"admin"]
    );
    await client.query("COMMIT");
    return NextResponse.json({ ok: true, offer: updated.rows[0] });
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    console.error("VSI Generosity admin PATCH failed:", error);
    return NextResponse.json({ error: "Unable to save the generosity pledge." }, { status: 500 });
  } finally {
    client?.release();
  }
}


export async function DELETE(request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  const id = clean(new URL(request.url).searchParams.get("id"), 80);
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "A valid pledge ID is required." }, { status: 400 });
  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    const found = await client.query("SELECT id,reference FROM public.vsi_generosity_offers WHERE id=$1 FOR UPDATE", [id]);
    if (!found.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Generosity pledge not found." }, { status: 404 });
    }
    const reference = found.rows[0].reference;
    await client.query("DELETE FROM public.vsi_generosity_offers WHERE id=$1", [id]);
    await client.query("COMMIT");
    return NextResponse.json({ ok: true, reference });
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    console.error("VSI Generosity admin DELETE failed:", error);
    return NextResponse.json({ error: "Unable to delete the generosity pledge." }, { status: 500 });
  } finally {
    client?.release();
  }
}
