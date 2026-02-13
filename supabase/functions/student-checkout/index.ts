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
    const { student_id, item_id, due_date } = await req.json();

    if (!student_id || !item_id || !due_date) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
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
    });

    if (loanError) {
      return new Response(JSON.stringify({ error: loanError.message }), {
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
