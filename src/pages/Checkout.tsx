import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "@/contexts/StudentContext";
import { useKioskKeyboard } from "@/contexts/KioskKeyboardContext";
import StudentIdEntry from "@/components/StudentIdEntry";
import { getAvailableItems, getItemCategories, checkoutItem } from "@/lib/supabase-helpers";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Search, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function Checkout() {
  const { student, clear } = useStudent();
  const navigate = useNavigate();
  const { attachInput, detachInput } = useKioskKeyboard();
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

  const searchRef = useRef<HTMLInputElement>(null);
  const durationRef = useRef<HTMLInputElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const teacherRef = useRef<HTMLInputElement>(null);

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
    detachInput();
    setSelectedItem(item);
    setDuration(String(item.default_loan_duration));
    setReason("");
    setTeacher("");
  };

  const closeCheckoutForm = () => {
    detachInput();
    setSelectedItem(null);
    setDuration("");
    setReason("");
    setTeacher("");
  };

  const handleCheckout = async () => {
    if (!student || !selectedItem) return;
    detachInput();
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
      clear();
      navigate("/");
    } catch (e: any) {
      toast.error(e.message || "Checkout failed");
    } finally {
      setCheckingOut(null);
    }
  };

  const handleBack = () => {
    detachInput();
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
    <div className="min-h-screen bg-background p-6 pb-72">
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

        <Dialog open={!!selectedItem} onOpenChange={(open) => { if (!open) closeCheckoutForm(); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedItem?.name}</DialogTitle>
              <span className="font-mono text-xs text-muted-foreground">#{selectedItem?.asset_tag}</span>
            </DialogHeader>

            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  How many days do you need it? <span className="text-destructive">*</span>
                </label>
                <Input
                  ref={durationRef}
                  type="text"
                  inputMode="none"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  onFocus={() => attachInput(durationRef.current, setDuration, duration, "numeric")}
                  placeholder="Number of days"
                  className="h-12 text-base"
                  readOnly
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Why do you need it? <span className="text-destructive">*</span>
                </label>
                <Textarea
                  ref={reasonRef}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  onFocus={() => attachInput(reasonRef.current, setReason, reason, "full")}
                  placeholder="e.g. Science project, class presentation..."
                  className="min-h-[80px] text-base"
                  readOnly
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Which teacher sent you? <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <Input
                  ref={teacherRef}
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  onFocus={() => attachInput(teacherRef.current, setTeacher, teacher, "alpha")}
                  placeholder="Teacher name"
                  className="h-12 text-base"
                  inputMode="none"
                  readOnly
                />
              </div>

              <Button
                onClick={handleCheckout}
                disabled={checkingOut === selectedItem?.id}
                className="h-12 text-base touch-target"
              >
                {checkingOut === selectedItem?.id ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Confirm Check Out
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Search by name or asset tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => attachInput(searchRef.current, setSearch, search, "full")}
              className="h-12 pl-10 text-base"
              inputMode="none"
            />
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "secondary"}
              className="cursor-pointer touch-target px-4 py-2 text-sm"
              onClick={() => { detachInput(); setSelectedCategory(cat); }}
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
