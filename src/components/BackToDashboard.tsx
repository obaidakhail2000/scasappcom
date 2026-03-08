import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function BackToDashboard() {
  const navigate = useNavigate();
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2.5 rounded-xl px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all mb-3 shadow-sm"
      onClick={() => navigate("/")}
    >
      <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-primary/15">
        <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
      </span>
      Dashboard
    </Button>
  );
}
