import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Download, Printer } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Posters() {
  const { toast } = useToast();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", "highlighted"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").eq("highlighted", true).gte("rating", 4).order("rating", { ascending: false }).limit(9);
      if (error) throw error;
      return data;
    },
  });

  const handleDownload = (review: any) => {
    const canvas = document.createElement("canvas");
    canvas.width = 600; canvas.height = 800;
    const ctx = canvas.getContext("2d")!;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 600, 800);
    gradient.addColorStop(0, "#2B2B2B");
    gradient.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 800);

    // Stars
    ctx.fillStyle = "#FF7A00";
    for (let i = 0; i < review.rating; i++) {
      ctx.font = "28px serif";
      ctx.fillText("★", 230 + i * 30, 200);
    }

    // Quote
    ctx.fillStyle = "#ffffff";
    ctx.font = 'italic 22px "Georgia", serif';
    ctx.textAlign = "center";
    const words = (review.text || "").split(" ");
    let line = ""; let y = 320;
    words.forEach((word: string) => {
      const test = line + word + " ";
      if (ctx.measureText(test).width > 480) { ctx.fillText(`"${line.trim()}"`, 300, y); line = word + " "; y += 32; }
      else line = test;
    });
    if (line) ctx.fillText(`"${line.trim()}"`, 300, y);

    // Divider
    ctx.fillStyle = "#FF7A00";
    ctx.fillRect(250, y + 40, 100, 2);

    // Name
    ctx.fillStyle = "#cccccc";
    ctx.font = '16px "Arial", sans-serif';
    ctx.fillText(`— ${review.customer_name}`, 300, y + 80);

    // Download
    const link = document.createElement("a");
    link.download = `poster_${review.customer_name.replace(/\s/g, "_")}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast({ title: "Poster downloaded!" });
  };

  const handlePrint = (review: any) => {
    const win = window.open("", "_blank")!;
    win.document.write(`
      <html><head><style>
        body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #2B2B2B; font-family: Georgia, serif; }
        .poster { width: 600px; padding: 80px 60px; text-align: center; color: white; }
        .stars { color: #FF7A00; font-size: 28px; margin-bottom: 40px; }
        .quote { font-style: italic; font-size: 22px; line-height: 1.6; margin-bottom: 30px; }
        .divider { width: 80px; height: 2px; background: #FF7A00; margin: 0 auto 20px; }
        .name { color: #ccc; font-size: 16px; font-family: Arial, sans-serif; }
      </style></head><body>
        <div class="poster">
          <div class="stars">${"★".repeat(review.rating)}</div>
          <div class="quote">"${review.text}"</div>
          <div class="divider"></div>
          <div class="name">— ${review.customer_name}</div>
        </div>
        <script>window.onload = () => window.print();</script>
      </body></html>
    `);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-display">Review Posters</h1>
        <p className="text-muted-foreground mt-1">Convert your best featured reviews into printable posters. Feature reviews from the Reviews page first!</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No featured reviews yet. Go to Reviews and feature your best ones!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
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
                    <p className="text-sm opacity-80">— {r.customer_name}</p>
                  </div>
                  <p className="text-center text-[10px] opacity-40 tracking-widest uppercase">Your Restaurant</p>
                </div>
                <CardContent className="p-4">
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 gap-1.5" onClick={() => handleDownload(r)}><Download className="h-3.5 w-3.5" /> Download</Button>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handlePrint(r)}><Printer className="h-3.5 w-3.5" /> Print</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
