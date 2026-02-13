import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "@/contexts/StudentContext";
import StudentIdEntry from "@/components/StudentIdEntry";
import { getStudentLoans } from "@/lib/supabase-helpers";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function MyItems() {
  const { student, clear } = useStudent();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setLoading(true);
      getStudentLoans(student.id)
        .then(setLoans)
        .catch(() => toast.error("Failed to load items"))
        .finally(() => setLoading(false));
    }
  }, [student]);

  const handleBack = () => {
    clear();
    navigate("/");
  };

  if (!student) {
    return <StudentIdEntry title="My Items" onIdentified={() => {}} />;
  }

  const isOverdue = (loan: any) => loan.status === "active" && new Date(loan.due_date) < new Date();

  const statusDisplay = (loan: any) => {
    if (loan.status === "returned") return <Badge variant="secondary">Returned</Badge>;
    if (isOverdue(loan)) return <Badge variant="destructive">Overdue</Badge>;
    return <Badge className="bg-success text-success-foreground">Active</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl animate-fade-in">
        <button onClick={handleBack} className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-foreground touch-target">
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Items</h1>
          <p className="text-muted-foreground">
            Loan history for <span className="font-semibold text-foreground">{student.first_name} {student.last_name}</span>
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : loans.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <p className="text-lg text-muted-foreground">No loan history</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {loans.map((loan) => (
              <div key={loan.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{loan.items?.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">#{loan.items?.asset_tag}</span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Checked out: {format(new Date(loan.checkout_at), "MMM d, yyyy")}
                      {" • "}
                      Due: {format(new Date(loan.due_date), "MMM d, yyyy")}
                      {loan.return_at && (
                        <> • Returned: {format(new Date(loan.return_at), "MMM d, yyyy")}</>
                      )}
                    </div>
                  </div>
                  {statusDisplay(loan)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
