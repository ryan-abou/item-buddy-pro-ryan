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
    const { student_id, first_name, last_name } = await req.json();

    // Validate student_id
    if (!student_id || typeof student_id !== "string") {
      return new Response(JSON.stringify({ error: "Student ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmedId = student_id.trim();
    if (!/^\d{6,12}$/.test(trimmedId)) {
      return new Response(JSON.stringify({ error: "Student ID must be 6-12 digits" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate names
    if (!first_name || typeof first_name !== "string" || !last_name || typeof last_name !== "string") {
      return new Response(JSON.stringify({ error: "First and last name are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmedFirst = first_name.trim();
    const trimmedLast = last_name.trim();

    if (trimmedFirst.length === 0 || trimmedFirst.length > 100 || trimmedLast.length === 0 || trimmedLast.length > 100) {
      return new Response(JSON.stringify({ error: "Names must be between 1 and 100 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!/^[A-Za-z\s\-']+$/.test(trimmedFirst) || !/^[A-Za-z\s\-']+$/.test(trimmedLast)) {
      return new Response(JSON.stringify({ error: "Names can only contain letters, spaces, hyphens, and apostrophes" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if student already exists
    const { data: existing } = await supabase
      .from("students")
      .select("id")
      .eq("student_id", trimmedId)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: "Student ID already registered" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase.from("students").insert({
      student_id: trimmedId,
      first_name: trimmedFirst,
      last_name: trimmedLast,
      email: `${trimmedId}@fcstu.org`,
    }).select().single();

    if (error) {
      console.error("Registration error:", error);
      return new Response(JSON.stringify({ error: "Failed to register student" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ student: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
