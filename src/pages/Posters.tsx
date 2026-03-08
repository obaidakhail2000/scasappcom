import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Download, Printer, Palette } from "lucide-react";
import { motion } from "framer-motion";

const posterReviews = [
  { id: 1, name: "Sarah M.", rating: 5, text: "Best pasta I've ever had! The ambiance was perfect for our anniversary dinner.", style: "elegant" },
  { id: 2, name: "Emily R.", rating: 5, text: "Amazing brunch menu. The avocado toast and the mimosas were perfect!", style: "modern" },
  { id: 3, name: "David P.", rating: 5, text: "Incredible seafood platter. Fresh ingredients, wonderful presentation.", style: "classic" },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Posters() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-display">Review Posters</h1>
        <p className="text-muted-foreground mt-1">Convert your best reviews into printable wall posters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posterReviews.map((r) => (
          <motion.div key={r.id} variants={item}>
            <Card className="overflow-hidden hover:shadow-xl transition-all border-0 shadow-md rounded-2xl">
              <div className="aspect-[3/4] bg-gradient-to-br from-foreground to-foreground/80 p-8 flex flex-col justify-between text-background">
                <div className="flex justify-center">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <div className="text-center space-y-4">
                  <p className="text-lg font-display italic leading-relaxed">"{r.text}"</p>
                  <div className="w-12 h-px bg-primary mx-auto" />
                  <p className="text-sm opacity-80">— {r.name}</p>
                </div>
                <p className="text-center text-[10px] opacity-40 tracking-widest uppercase">Your Restaurant Name</p>
              </div>
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 gap-1.5"><Download className="h-3.5 w-3.5" /> Download</Button>
                  <Button size="sm" variant="outline" className="gap-1.5"><Printer className="h-3.5 w-3.5" /> Print</Button>
                  <Button size="sm" variant="outline"><Palette className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
