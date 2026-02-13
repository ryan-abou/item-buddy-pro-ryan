import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "@/contexts/StudentContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  title: string;
  onIdentified: () => void;
}

export default function StudentIdEntry({ title, onIdentified }: Props) {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const { identify } = useStudent();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!studentId.trim()) {
      toast.error("Please enter your Student ID");
      return;
    }
    setLoading(true);
    try {
      const student = await identify(studentId.trim());
      if (student) {
        toast.success(`Welcome, ${student.first_name}!`);
        onIdentified();
      } else {
        toast.error("Student ID not found. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
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
        <p className="mb-8 text-muted-foreground">Enter your Student ID to continue</p>

        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="mb-4 h-16 text-center text-2xl font-mono"
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
      </div>
    </div>
  );
}
