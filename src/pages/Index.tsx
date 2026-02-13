import { useNavigate } from "react-router-dom";
import { Monitor, RotateCcw, ClipboardList, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="mb-12 text-center animate-fade-in">
        <div className="mb-4 flex items-center justify-center gap-3">
          <Monitor className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">
            IT Equipment Checkout
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Tap an option below to get started
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 md:gap-8 animate-fade-in">
        <button
          onClick={() => navigate("/checkout")}
          className="kiosk-btn kiosk-btn-primary"
        >
          <Monitor className="h-12 w-12" />
          <span>Check Out</span>
        </button>

        <button
          onClick={() => navigate("/return")}
          className="kiosk-btn kiosk-btn-accent"
        >
          <RotateCcw className="h-12 w-12" />
          <span>Return</span>
        </button>

        <button
          onClick={() => navigate("/my-items")}
          className="kiosk-btn kiosk-btn-secondary"
        >
          <ClipboardList className="h-12 w-12" />
          <span>My Items</span>
        </button>

        <button
          onClick={() => navigate("/staff-login")}
          className="kiosk-btn kiosk-btn-secondary"
        >
          <Shield className="h-12 w-12" />
          <span>Staff Login</span>
        </button>
      </div>

      <p className="mt-12 text-sm text-muted-foreground">
        Need help? Contact your school IT department.
      </p>
    </div>
  );
};

export default Index;
