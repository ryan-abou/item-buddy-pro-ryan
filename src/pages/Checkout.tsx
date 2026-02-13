import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "@/contexts/StudentContext";
import StudentIdEntry from "@/components/StudentIdEntry";
import { getAvailableItems, getItemCategories, checkoutItem } from "@/lib/supabase-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function Checkout() {
  const { student, clear } = useStudent();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      loadItems();
      getItemCategories().then(setCategories);
    }
  }, [student, selectedCategory]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getAvailableItems(selectedCategory);
      setItems(data);
    } catch {
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (itemId: string, duration: number) => {
    if (!student) return;
    setCheckingOut(itemId);
    try {
      await checkoutItem(student.id, itemId, duration);
      toast.success("Item checked out successfully!");
      loadItems();
    } catch (e: any) {
      toast.error(e.message || "Checkout failed");
    } finally {
      setCheckingOut(null);
    }
  };

  const handleBack = () => {
    clear();
    navigate("/");
  };

  if (!student) {
    return <StudentIdEntry title="Check Out Equipment" onIdentified={() => {}} />;
  }

  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.asset_tag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl animate-fade-in">
        <button onClick={handleBack} className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-foreground touch-target">
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Check Out Equipment</h1>
          <p className="text-muted-foreground">
            Welcome, <span className="font-semibold text-foreground">{student.first_name} {student.last_name}</span>
          </p>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or asset tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-10 text-base"
            />
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "secondary"}
              className="cursor-pointer touch-target px-4 py-2 text-sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <p className="text-lg text-muted-foreground">No available items found</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{item.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">#{item.asset_tag}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{item.category}</span>
                    {item.location && <span>• {item.location}</span>}
                    <span>• {item.default_loan_duration}d loan</span>
                  </div>
                </div>
                <Button
                  onClick={() => handleCheckout(item.id, item.default_loan_duration)}
                  disabled={checkingOut === item.id}
                  className="touch-target"
                >
                  {checkingOut === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Check Out
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
