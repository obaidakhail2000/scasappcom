import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Star, Send, ExternalLink, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Step = "rate" | "feedback" | "thankyou";

const STORAGE_KEY = "scas_google_review_url";

function getGoogleReviewUrl() {
  return localStorage.getItem(STORAGE_KEY) || "https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID";
}

export default function CustomerReview() {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get("table") || "unknown";
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [step, setStep] = useState<Step>("rate");
  const [submitting, setSubmitting] = useState(false);

  const handleRate = async (stars: number) => {
    setRating(stars);
    if (stars >= 4) {
      await saveReview(stars, "");
      setStep("thankyou");
    } else {
      setStep("feedback");
    }
  };

  const saveReview = async (stars: number, text: string) => {
    setSubmitting(true);
    try {
      await supabase.from("reviews" as any).insert({
        rating: stars,
        text: text || null,
        customer_name: "Customer",
        table_number: tableNumber,
        source: "QR Code",
        user_id: "00000000-0000-0000-0000-000000000000",
      });
    } catch {
      // Silent fail for customer UX
    }
    setSubmitting(false);
  };

  const handleSubmitFeedback = async () => {
    await saveReview(rating, comment);
    setStep("thankyou");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-card rounded-3xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Star className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">How was your experience?</h1>
            <p className="text-sm text-muted-foreground">
              Table {tableNumber} · We appreciate your feedback
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === "rate" && (
              <motion.div key="rate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleRate(s)}
                      onMouseEnter={() => setHoveredStar(s)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="transition-transform hover:scale-110 active:scale-95 p-1"
                    >
                      <Star className={`h-11 w-11 transition-colors ${s <= (hoveredStar || rating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground">Tap a star to rate your experience</p>
              </motion.div>
            )}

            {step === "feedback" && (
              <motion.div key="feedback" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-6 w-6 ${s <= rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <p className="text-center text-sm font-medium">What could we improve?</p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us how we can do better..."
                  className="w-full min-h-[120px] rounded-2xl border border-border bg-muted/30 p-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                <button
                  onClick={handleSubmitFeedback}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-3.5 font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Submitting..." : "Submit Feedback"}
                </button>
                <button
                  onClick={() => { setStep("rate"); setRating(0); }}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Change rating
                </button>
              </motion.div>
            )}

            {step === "thankyou" && (
              <motion.div key="thankyou" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 text-center">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-bold">Thank you! 🎉</h2>
                  <p className="text-sm text-muted-foreground">We appreciate your feedback</p>
                </div>
                {rating >= 4 && (
                  <a
                    href={getGoogleReviewUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-3.5 font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Leave us a Review on Google
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="text-center text-[11px] text-muted-foreground/50 mt-4">Powered by SCAS</p>
      </motion.div>
    </div>
  );
}
