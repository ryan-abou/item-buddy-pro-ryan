import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "@/contexts/StudentContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  title: string;
  onIdentified: () => void;
}

export default function StudentIdEntry({ title, onIdentified }: Props) {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { identify } = useStudent();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const trimmed = studentId.trim();
    if (!trimmed) {
      toast.error("Please enter your Student ID");
      return;
    }
    if (!/^\d{10}$/.test(trimmed)) {
      toast.error("Student ID must be exactly 10 digits");
      return;
    }
    setLoading(true);
    try {
      const student = await identify(trimmed);
      if (student) {
        toast.success(`Welcome, ${student.first_name}!`);
        onIdentified();
      } else {
        setShowRegister(true);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please enter your first and last name");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("students").insert({
        student_id: studentId.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      const student = await identify(studentId.trim());
      if (student) {
        toast.success(`Welcome, ${student.first_name}! You're registered.`);
        onIdentified();
      }
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md animate-fade-in">
        <button
          onClick={() => navigate("/")}
          className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground touch-target"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <h1 className="mb-2 text-3xl font-bold text-foreground">{title}</h1>
        <p className="mb-8 text-muted-foreground">
          {showRegister ? "First time? Enter your name to get started." : "Enter your 10-digit Student ID to continue"}
        </p>

        {!showRegister ? (
          <>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Student ID (10 digits)"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.replace(/\D/g, "").slice(0, 10))}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="mb-4 h-16 text-center text-2xl font-mono"
              maxLength={10}
              autoFocus
            />
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="h-14 w-full text-lg font-semibold"
              size="lg"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue"}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
              Student ID: <span className="font-mono font-semibold text-foreground">{studentId}</span>
            </div>
            <div>
              <Label>First Name</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 h-12 text-lg"
                autoFocus
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                className="mt-1 h-12 text-lg"
              />
            </div>
            <Button
              onClick={handleRegister}
              disabled={loading}
              className="h-14 w-full text-lg font-semibold"
              size="lg"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Register & Continue"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setShowRegister(false); setFirstName(""); setLastName(""); }}
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
