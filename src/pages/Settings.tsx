import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, ExternalLink, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "google_review_booster_url";

export default function Settings() {
  const { toast } = useToast();
  const [googleUrl, setGoogleUrl] = useState(() => localStorage.getItem(STORAGE_KEY) || "");

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, googleUrl);
    toast({ title: "Settings saved!", description: "Google Review URL has been updated." });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Configure your Google Review Booster system.</p>
      </div>

      <Card className="border border-border/40 shadow-card rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-primary" /> Google Review URL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Paste your Google Business review link below. Customers who rate 4-5 stars will be redirected to this link.
          </p>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Google Review Page URL</label>
            <Input
              placeholder="https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID"
              value={googleUrl}
              onChange={(e) => setGoogleUrl(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          <div className="rounded-lg bg-muted/50 border border-border/30 p-3">
            <p className="text-xs text-muted-foreground">
              💡 <strong>How to find your Google Review link:</strong> Search your restaurant on Google Maps → Click "Write a review" → Copy the URL.
            </p>
          </div>
          <Button onClick={handleSave} className="gap-2 rounded-lg">
            <Save className="h-4 w-4" /> Save Settings
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
