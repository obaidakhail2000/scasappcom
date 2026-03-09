import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquareWarning, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { generateAutoReply } from "@/lib/review-analysis";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function PrivateFeedback() {
  const { data: reviews = [] } = useQuery({
    queryKey: ["private-feedback"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .lte("rating", 3)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-4xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          <MessageSquareWarning className="h-6 w-6 text-destructive" /> Private Feedback
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Negative reviews (1-3 stars) captured privately instead of going to Google.
        </p>
      </motion.div>

      <motion.div variants={item}>
        <Card className="border border-border/50 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <MessageSquareWarning className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="font-semibold">{reviews.length}</p>
                  <p className="text-[10px] text-muted-foreground">Total Feedback</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <motion.div variants={item}>
            <Card className="border border-border/50 shadow-sm rounded-2xl">
              <CardContent className="p-12 text-center">
                <MessageSquareWarning className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No negative feedback yet. Great job! 🎉</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : reviews.map((r) => (
          <motion.div key={r.id} variants={item}>
            <Card className="border border-border/50 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-destructive">{r.customer_name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{r.customer_name}</span>
                      <div className="flex gap-px">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`h-3 w-3 ${j < r.rating ? "fill-destructive text-destructive" : "text-muted-foreground/20"}`} />
                        ))}
                      </div>
                      {(r as any).table_number && (
                        <Badge variant="outline" className="text-[9px] h-4">Table {(r as any).table_number}</Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto">
                        <Calendar className="h-3 w-3" />
                        {new Date(r.created_at).toLocaleString()}
                      </span>
                    </div>
                    {r.text && <p className="text-sm text-foreground/80 mt-2">{r.text}</p>}
                    <div className="mt-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-[10px] text-muted-foreground font-medium">🏪 Auto-Reply</p>
                      <p className="text-[11px] text-foreground/70 mt-0.5">{generateAutoReply(r.rating)}</p>
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
