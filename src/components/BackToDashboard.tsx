import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function BackToDashboard() {
  const navigate = useNavigate();
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 rounded-xl px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all mb-3"
      onClick={() => navigate("/")}
    >
      <LayoutDashboard className="h-4 w-4" />
      Dashboard
    </Button>
  );
}
