import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "@/contexts/StudentContext";
import StudentIdEntry from "@/components/StudentIdEntry";
import { getAvailableItems, getItemCategories, checkoutItem } from "@/lib/supabase-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Search, Loader2, CheckCircle2, X } from "lucide-react";
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

  // Checkout form state
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [duration, setDuration] = useState("");
  const [reason, setReason] = useState("");
  const [teacher, setTeacher] = useState("");

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

  const openCheckoutForm = (item: any) => {
    setSelectedItem(item);
    setDuration(String(item.default_loan_duration));
    setReason("");
    setTeacher("");
  };

  const closeCheckoutForm = () => {
    setSelectedItem(null);
    setDuration("");
    setReason("");
    setTeacher("");
  };

  const handleCheckout = async () => {
    if (!student || !selectedItem) return;
    const days = parseInt(duration, 10);
    if (!days || days < 1) {
      toast.error("Enter a valid number of days");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    setCheckingOut(selectedItem.id);
    try {
      await checkoutItem(student.id, selectedItem.id, days, reason.trim(), teacher.trim() || undefined);
      toast.success("Item checked out successfully!");
      closeCheckoutForm();
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

        {/* Checkout form overlay */}
        {selectedItem && (
          <div className="mb-6 rounded-xl border-2 border-primary bg-card p-5 shadow-lg animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{selectedItem.name}</h2>
                <span className="font-mono text-xs text-muted-foreground">#{selectedItem.asset_tag}</span>
              </div>
              <button onClick={closeCheckoutForm} className="rounded-full p-1 hover:bg-muted touch-target">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  How many days do you need it? <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Number of days"
                  className="h-12 text-base"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Why do you need it? <span className="text-destructive">*</span>
                </label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Science project, class presentation..."
                  className="min-h-[80px] text-base"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Which teacher sent you? <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <Input
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  placeholder="Teacher name"
                  className="h-12 text-base"
                />
              </div>

              <Button
                onClick={handleCheckout}
                disabled={checkingOut === selectedItem.id}
                className="h-12 text-base touch-target"
              >
                {checkingOut === selectedItem.id ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Confirm Check Out
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

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
                    <span>• {item.default_loan_duration}d default</span>
                  </div>
                </div>
                <Button
                  onClick={() => openCheckoutForm(item)}
                  disabled={selectedItem?.id === item.id}
                  className="touch-target"
                >
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  Check Out
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
