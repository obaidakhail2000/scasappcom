import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Star, Send, ExternalLink, CheckCircle2, Utensils, Clock, Sparkles, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Step = "rate" | "categories" | "feedback" | "thankyou";
const STORAGE_KEY = "meta_automation_google_review_url";

function getGoogleReviewUrl() {
  return localStorage.getItem(STORAGE_KEY) || "https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID";
}

const CATEGORIES = [
  { key: "food", label: "Food Quality", icon: Utensils },
  { key: "service", label: "Service", icon: Sparkles },
  { key: "cleanliness", label: "Cleanliness", icon: ShieldCheck },
  { key: "speed", label: "Speed", icon: Clock },
];

function StarRating({ value, onChange, size = "h-11 w-11" }: { value: number; onChange: (v: number) => void; size?: string }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex justify-center gap-2">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} onClick={() => onChange(s)} onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)} className="transition-transform hover:scale-110 active:scale-95 p-0.5">
          <Star className={`${size} transition-colors ${s <= (hovered || value) ? "fill-primary text-primary" : "text-muted-foreground/25"}`} />
        </button>
      ))}
    </div>
  );
}

export default function CustomerReview() {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get("table") || "unknown";
  const [rating, setRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [step, setStep] = useState<Step>("rate");
  const [submitting, setSubmitting] = useState(false);

  const handleRate = (stars: number) => {
    setRating(stars);
    setStep("categories");
  };

  const handleCategoriesDone = async () => {
    if (rating >= 4) {
      await saveReview(rating, "");
      setStep("thankyou");
    } else {
      setStep("feedback");
    }
  };

  const saveReview = async (stars: number, text: string) => {
    setSubmitting(true);
    const categoryText = Object.entries(categoryRatings)
      .map(([k, v]) => `${k}:${v}`)
      .join(", ");
    const fullText = [text, categoryText ? `[Categories: ${categoryText}]` : ""].filter(Boolean).join(" ");
    try {
      await supabase.from("reviews" as any).insert({
        rating: stars,
        text: fullText || null,
        customer_name: "Customer",
        table_number: tableNumber,
        source: "QR Code",
        user_id: "00000000-0000-0000-0000-000000000000",
      });
    } catch { /* Silent fail for customer UX */ }
    setSubmitting(false);
  };

  const handleSubmitFeedback = async () => {
    await saveReview(rating, comment);
    setStep("thankyou");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-elevated border border-border/40 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
              <Utensils className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold font-display text-foreground">How was your experience?</h1>
            <p className="text-sm text-muted-foreground">Table {tableNumber} · We appreciate your feedback</p>
          </div>

          <AnimatePresence mode="wait">
            {step === "rate" && (
              <motion.div key="rate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <StarRating value={rating} onChange={handleRate} />
                <p className="text-center text-sm text-muted-foreground">Tap a star to rate your overall experience</p>
              </motion.div>
            )}

            {step === "categories" && (
              <motion.div key="categories" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex justify-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`h-5 w-5 ${s <= rating ? "fill-primary text-primary" : "text-muted-foreground/25"}`} />)}
                </div>
                <p className="text-center text-sm font-medium">Rate specific areas</p>
                <div className="space-y-3">
                  {CATEGORIES.map((cat) => (
                    <div key={cat.key} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                      <cat.icon className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-sm font-medium flex-1">{cat.label}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} onClick={() => setCategoryRatings({ ...categoryRatings, [cat.key]: s })} className="p-0.5">
                            <Star className={`h-5 w-5 transition-colors ${s <= (categoryRatings[cat.key] || 0) ? "fill-primary text-primary" : "text-muted-foreground/20"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={handleCategoriesDone} disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm">
                  {submitting ? "Submitting..." : "Continue"}
                </button>
                <button onClick={() => { setStep("rate"); setRating(0); setCategoryRatings({}); }} className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors">Change rating</button>
              </motion.div>
            )}

            {step === "feedback" && (
              <motion.div key="feedback" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`h-6 w-6 ${s <= rating ? "fill-primary text-primary" : "text-muted-foreground/25"}`} />)}
                </div>
                <p className="text-center text-sm font-medium">What could we improve?</p>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us how we can do better..."
                  className="w-full min-h-[120px] rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                <button onClick={handleSubmitFeedback} disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm">
                  <Send className="h-4 w-4" /> {submitting ? "Submitting..." : "Submit Feedback"}
                </button>
                <button onClick={() => { setStep("categories"); }} className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors">Go back</button>
              </motion.div>
            )}

            {step === "thankyou" && (
              <motion.div key="thankyou" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 text-center">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-success/15 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-bold font-display">Thank you! 🎉</h2>
                  <p className="text-sm text-muted-foreground">We appreciate your feedback</p>
                </div>
                {rating >= 4 && (
                  <a href={getGoogleReviewUrl()} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 font-medium text-sm hover:opacity-90 transition-opacity shadow-sm">
                    <ExternalLink className="h-4 w-4" /> Leave us a Review on Google
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="text-center text-[11px] text-muted-foreground/40 mt-4">Powered by Meta Automation Menu</p>
      </motion.div>
    </div>
  );
}
