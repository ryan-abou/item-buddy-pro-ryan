import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { student_id, item_id, due_date, reason, teacher } = await req.json();

    if (!student_id || !item_id || !due_date || !reason) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate UUID formats
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(student_id) || !uuidRegex.test(item_id)) {
      return new Response(JSON.stringify({ error: "Invalid ID format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate due_date is a valid date
    const parsedDate = new Date(due_date);
    if (isNaN(parsedDate.getTime())) {
      return new Response(JSON.stringify({ error: "Invalid due date" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate reason length
    if (typeof reason !== "string" || reason.length > 500) {
      return new Response(JSON.stringify({ error: "Invalid reason" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (teacher && (typeof teacher !== "string" || teacher.length > 200)) {
      return new Response(JSON.stringify({ error: "Invalid teacher" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check item is available
    const { data: item } = await supabase
      .from("items")
      .select("status, name")
      .eq("id", item_id)
      .single();

    if (!item || item.status !== "available") {
      return new Response(JSON.stringify({ error: "Item is not available" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check student max items
    const { data: student } = await supabase
      .from("students")
      .select("max_items, first_name, last_name")
      .eq("id", student_id)
      .single();

    if (!student) {
      return new Response(JSON.stringify({ error: "Student not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { count } = await supabase
      .from("loans")
      .select("*", { count: "exact", head: true })
      .eq("student_id", student_id)
      .in("status", ["active", "overdue"]);

    if ((count ?? 0) >= student.max_items) {
      return new Response(JSON.stringify({ error: `Maximum of ${student.max_items} items already checked out` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create loan
    const { error: loanError } = await supabase.from("loans").insert({
      item_id,
      student_id,
      due_date,
      status: "active",
      reason,
      teacher: teacher || null,
    });

    if (loanError) {
      console.error("Loan creation error:", loanError);
      return new Response(JSON.stringify({ error: "Unable to complete checkout. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update item status
    await supabase.from("items").update({ status: "checked_out" }).eq("id", item_id);

    // Audit log
    await supabase.from("audit_log").insert({
      student_id,
      action: "checkout",
      entity_type: "loan",
      entity_id: item_id,
      details: { item_name: item.name, student_name: `${student.first_name} ${student.last_name}` },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
