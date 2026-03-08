import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CalendarClock, Send, Instagram, Facebook, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const scheduledPosts = [
  { id: 1, platform: "Instagram", content: "🍕 New weekend special! Try our truffle pizza...", date: "Mar 10, 2026", status: "scheduled" },
  { id: 2, platform: "Facebook", content: "Happy Hour is back! 2-for-1 cocktails every...", date: "Mar 9, 2026", status: "scheduled" },
  { id: 3, platform: "Instagram", content: "Meet our new head chef! We're thrilled to...", date: "Mar 8, 2026", status: "published" },
];

const platformIcon = (p: string) => {
  if (p === "Instagram") return <Instagram className="h-4 w-4" />;
  if (p === "Facebook") return <Facebook className="h-4 w-4" />;
  return <MessageSquare className="h-4 w-4" />;
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function Marketing() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-display">Marketing</h1>
        <p className="text-muted-foreground mt-1">Schedule posts and manage your social media presence.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-display">Create Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {["Instagram", "Facebook", "SMS"].map((p) => (
                  <Button key={p} variant="outline" size="sm" className="gap-1.5 rounded-xl">
                    {platformIcon(p)} {p}
                  </Button>
                ))}
              </div>
              <Textarea placeholder="Write your post content..." className="min-h-[120px] resize-none rounded-xl" />
              <div className="flex flex-col sm:flex-row gap-3">
                <Input type="datetime-local" className="sm:w-auto rounded-xl" />
                <Button className="gap-2"><Send className="h-4 w-4" /> Schedule Post</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-display">Scheduled</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {scheduledPosts.map((p) => (
                <div key={p.id} className="p-3 rounded-2xl bg-muted/40 space-y-2">
                  <div className="flex items-center gap-2">
                    {platformIcon(p.platform)}
                    <span className="text-sm font-medium">{p.platform}</span>
                    <Badge variant={p.status === "published" ? "default" : "secondary"} className="ml-auto text-[10px]">
                      {p.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{p.content}</p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                    <CalendarClock className="h-3 w-3" /> {p.date}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
