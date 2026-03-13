import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Star, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRef, useEffect } from "react";
import QRCode from "qrcode";

export default function Posters() {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const { data: reviews = [] } = useQuery({
    queryKey: ["poster-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .gte("rating", 4)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const reviewUrl = `${window.location.origin}/review`;

  useEffect(() => {
    if (qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, reviewUrl, { width: 200, margin: 2 });
    }
  }, [reviewUrl]);

  const handlePrint = () => window.print();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold font-display">Print QR Poster</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Printable poster with your best reviews and QR code.</p>
        </div>
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" /> Print
        </Button>
      </div>

      <div className="print-poster">
        <Card className="border border-border/50 shadow-sm rounded-2xl overflow-hidden print:shadow-none print:border-0">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8 text-center">
              <h2 className="text-3xl font-bold font-display mb-2">We Value Your Feedback!</h2>
              <p className="text-primary-foreground/80 text-lg">Scan the QR code and share your experience</p>
            </div>

            <div className="flex justify-center py-8">
              <div className="p-6 bg-card rounded-2xl shadow-lg border border-border/50">
                <canvas ref={qrCanvasRef} className="rounded-xl" />
                <p className="text-center text-xs text-muted-foreground mt-3 font-medium">Scan to leave a review</p>
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="px-8 pb-8 space-y-4">
                <h3 className="text-lg font-semibold text-center">What Our Customers Say</h3>
                <div className="grid gap-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl bg-muted/40 border border-border/30">
                      <div className="flex gap-px mb-1">
                        {Array.from({ length: r.rating }).map((_, j) => (
                          <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                      {r.text && <p className="text-sm text-foreground/80 italic">"{r.text}"</p>}
                      <p className="text-xs text-muted-foreground mt-1">— {r.customer_name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">Powered by Meta Automation Menu • Your opinion matters</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-poster, .print-poster * { visibility: visible; }
          .print-poster { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </motion.div>
  );
}
