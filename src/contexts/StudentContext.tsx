import React, { createContext, useContext, useState, useCallback } from "react";
import { lookupStudent } from "@/lib/supabase-helpers";

interface StudentData {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  grade: string | null;
  max_items: number;
}

interface StudentContextType {
  student: StudentData | null;
  identify: (studentId: string) => Promise<StudentData | null>;
  clear: () => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<StudentData | null>(null);

  const identify = useCallback(async (studentId: string) => {
    const data = await lookupStudent(studentId);
    if (data) {
      setStudent(data as StudentData);
      return data as StudentData;
    }
    return null;
  }, []);

  const clear = useCallback(() => setStudent(null), []);

  return (
    <StudentContext.Provider value={{ student, identify, clear }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudent must be used within StudentProvider");
  return ctx;
}
