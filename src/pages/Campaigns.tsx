import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Zap, Clock, Send } from "lucide-react";
import { motion } from "framer-motion";

const campaigns = [
  { id: 1, name: "Weekend Brunch Special", type: "Promotion", status: "active", sent: 342, opened: 289, redeemed: 67 },
  { id: 2, name: "Happy Hour 2-for-1", type: "Discount", status: "active", sent: 510, opened: 421, redeemed: 134 },
  { id: 3, name: "New Menu Launch", type: "Announcement", status: "completed", sent: 1200, opened: 890, redeemed: 0 },
  { id: 4, name: "Birthday Club Offer", type: "Automated", status: "active", sent: 89, opened: 76, redeemed: 45 },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function Campaigns() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Create and manage promotion campaigns.</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> New Campaign</Button>
      </div>

      <div className="grid gap-4">
        {campaigns.map((c) => (
          <motion.div key={c.id} variants={item}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      {c.type === "Automated" ? <Zap className="h-5 w-5 text-primary" /> : <Send className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{c.name}</span>
                        <Badge variant={c.status === "active" ? "default" : "secondary"} className="text-[10px]">{c.status}</Badge>
                        <Badge variant="outline" className="text-[10px]">{c.type}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-6 text-center">
                    <div>
                      <p className="text-lg font-bold">{c.sent}</p>
                      <p className="text-[10px] text-muted-foreground">Sent</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{c.opened}</p>
                      <p className="text-[10px] text-muted-foreground">Opened</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{c.redeemed}</p>
                      <p className="text-[10px] text-muted-foreground">Redeemed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
