import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, Image } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const reviews = [
  { id: 1, name: "Sarah M.", rating: 5, text: "Best pasta I've ever had! The ambiance was perfect for our anniversary dinner.", date: "Mar 7, 2026", source: "Google", highlighted: true },
  { id: 2, name: "Mike T.", rating: 4, text: "Great food, slightly slow service on a busy night. Would still recommend.", date: "Mar 6, 2026", source: "Yelp", highlighted: false },
  { id: 3, name: "Emily R.", rating: 5, text: "Amazing brunch menu. The avocado toast and the mimosas were perfect!", date: "Mar 5, 2026", source: "Google", highlighted: true },
  { id: 4, name: "James K.", rating: 5, text: "The chef's special was out of this world. Every dish was beautifully presented.", date: "Mar 5, 2026", source: "Direct", highlighted: false },
  { id: 5, name: "Lisa W.", rating: 3, text: "Food was good but the noise level was quite high. Hard to have a conversation.", date: "Mar 4, 2026", source: "Google", highlighted: false },
  { id: 6, name: "David P.", rating: 5, text: "Incredible seafood platter. Fresh ingredients, wonderful presentation.", date: "Mar 3, 2026", source: "Yelp", highlighted: true },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function Reviews() {
  const [filter, setFilter] = useState<"all" | "highlighted">("all");
  const filtered = filter === "highlighted" ? reviews.filter((r) => r.highlighted) : reviews;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display">Reviews</h1>
          <p className="text-muted-foreground mt-1">Manage and highlight your best customer reviews.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All Reviews</Button>
          <Button variant={filter === "highlighted" ? "default" : "outline"} size="sm" onClick={() => setFilter("highlighted")}>
            <Star className="h-4 w-4 mr-1" /> Highlighted
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((r) => (
          <motion.div key={r.id} variants={item}>
            <Card className={`transition-all hover:shadow-lg border-0 shadow-sm rounded-2xl ${r.highlighted ? 'ring-1 ring-primary/20' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 flex-1">
                    <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-primary">{r.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{r.name}</span>
                        <div className="flex">
                          {Array.from({ length: r.rating }).map((_, j) => (
                            <Star key={j} className="h-3.5 w-3.5 fill-primary text-primary" />
                          ))}
                          {Array.from({ length: 5 - r.rating }).map((_, j) => (
                            <Star key={j} className="h-3.5 w-3.5 text-muted-foreground/30" />
                          ))}
                        </div>
                        <Badge variant="secondary" className="text-[10px]">{r.source}</Badge>
                        {r.highlighted && <Badge className="text-[10px] bg-primary/10 text-primary border-0">Featured</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{r.text}</p>
                      <p className="text-xs text-muted-foreground/60 mt-2">{r.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><ThumbsUp className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Image className="h-4 w-4" /></Button>
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
