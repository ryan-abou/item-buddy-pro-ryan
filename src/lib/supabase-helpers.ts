import { supabase } from "@/integrations/supabase/client";

export async function lookupStudent(studentId: string) {
  const { data, error } = await supabase.functions.invoke("student-lookup", {
    body: { student_id: studentId },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data?.student ?? null;
}

export async function registerStudent(studentId: string, firstName: string, lastName: string) {
  const { data, error } = await supabase.functions.invoke("student-register", {
    body: { student_id: studentId, first_name: firstName, last_name: lastName },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data?.student ?? null;
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
  const { data, error } = await supabase.functions.invoke("student-loans", {
    body: { student_db_id: studentDbId, active_only: false },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data?.loans ?? [];
}

export async function getActiveStudentLoans(studentDbId: string) {
  const { data, error } = await supabase.functions.invoke("student-loans", {
    body: { student_db_id: studentDbId, active_only: true },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data?.loans ?? [];
}

export async function checkoutItem(
  studentDbId: string,
  itemId: string,
  durationDays: number,
  reason: string,
  teacher?: string
) {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + durationDays);

  // Use edge function for checkout (bypasses RLS for student operations)
  const { data, error } = await supabase.functions.invoke("student-checkout", {
    body: {
      student_id: studentDbId,
      item_id: itemId,
      due_date: dueDate.toISOString(),
      reason,
      teacher: teacher || undefined,
    },
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
