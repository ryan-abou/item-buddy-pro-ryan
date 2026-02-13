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
    const { loan_id } = await req.json();

    if (!loan_id) {
      return new Response(JSON.stringify({ error: "Missing loan_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get loan
    const { data: loan } = await supabase
      .from("loans")
      .select("*, items(name), students(first_name, last_name)")
      .eq("id", loan_id)
      .single();

    if (!loan) {
      return new Response(JSON.stringify({ error: "Loan not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (loan.status === "returned") {
      return new Response(JSON.stringify({ error: "Item already returned" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update loan
    await supabase
      .from("loans")
      .update({ status: "returned", return_at: new Date().toISOString() })
      .eq("id", loan_id);

    // Update item status back to available
    await supabase
      .from("items")
      .update({ status: "available" })
      .eq("id", loan.item_id);

    // Audit log
    await supabase.from("audit_log").insert({
      student_id: loan.student_id,
      action: "return",
      entity_type: "loan",
      entity_id: loan.item_id,
      details: { item_name: loan.items?.name, student_name: `${loan.students?.first_name} ${loan.students?.last_name}` },
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
