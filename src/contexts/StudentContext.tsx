import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
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
  resetTimer: () => void;
}

const INACTIVITY_TIMEOUT = 60_000; // 60 seconds

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<StudentData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const clear = useCallback(() => {
    clearTimer();
    setStudent(null);
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setStudent(null);
      timerRef.current = null;
    }, INACTIVITY_TIMEOUT);
  }, []);

  const resetTimer = useCallback(() => {
    if (student) startTimer();
  }, [student, startTimer]);

  const identify = useCallback(async (studentId: string) => {
    const data = await lookupStudent(studentId);
    if (data) {
      setStudent(data as StudentData);
      return data as StudentData;
    }
    return null;
  }, []);

  // Start/restart timer whenever student changes
  useEffect(() => {
    if (student) {
      startTimer();
    }
    return () => clearTimer();
  }, [student, startTimer]);

  return (
    <StudentContext.Provider value={{ student, identify, clear, resetTimer }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudent must be used within StudentProvider");
  return ctx;
}
