import { supabase } from "@/integrations/supabase/client";

export async function lookupStudent(studentId: string) {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("student_id", studentId)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAvailableItems(category?: string) {
  let query = supabase
    .from("items")
    .select("*")
    .eq("status", "available")
    .order("name");
  if (category && category !== "All") {
    query = query.eq("category", category);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getStudentLoans(studentDbId: string) {
  const { data, error } = await supabase
    .from("loans")
    .select("*, items(*)")
    .eq("student_id", studentDbId)
    .order("checkout_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getActiveStudentLoans(studentDbId: string) {
  const { data, error } = await supabase
    .from("loans")
    .select("*, items(*)")
    .eq("student_id", studentDbId)
    .in("status", ["active", "overdue"])
    .order("checkout_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function checkoutItem(studentDbId: string, itemId: string, durationDays: number) {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + durationDays);

  // Check max items
  const activeLoans = await getActiveStudentLoans(studentDbId);
  const student = await supabase.from("students").select("max_items").eq("id", studentDbId).single();
  if (student.error) throw student.error;
  if (activeLoans.length >= (student.data?.max_items ?? 3)) {
    throw new Error(`Maximum of ${student.data?.max_items ?? 3} items already checked out`);
  }

  // Check item availability
  const item = await supabase.from("items").select("status").eq("id", itemId).single();
  if (item.error) throw item.error;
  if (item.data?.status !== "available") {
    throw new Error("Item is not available for checkout");
  }

  // Use edge function for checkout (bypasses RLS for student operations)
  const { data, error } = await supabase.functions.invoke("student-checkout", {
    body: { student_id: studentDbId, item_id: itemId, due_date: dueDate.toISOString() },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function returnItem(loanId: string) {
  const { data, error } = await supabase.functions.invoke("student-return", {
    body: { loan_id: loanId },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function getItemCategories() {
  const { data, error } = await supabase
    .from("items")
    .select("category")
    .order("category");
  if (error) throw error;
  const unique = [...new Set((data ?? []).map((d) => d.category))];
  return ["All", ...unique];
}

export async function getCurrentUserRole() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  return data?.role ?? null;
}
