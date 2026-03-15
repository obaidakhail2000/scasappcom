import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import {
  QrCode, Star, BarChart3, MessageSquare, Shield, Zap, ArrowRight, CheckCircle2, Utensils,
} from "lucide-react";

const features = [
  { icon: QrCode, title: "QR Digital Menus", desc: "Generate unique QR codes for each table. Customers scan to view menus and leave feedback instantly." },
  { icon: MessageSquare, title: "Customer Feedback", desc: "Collect detailed feedback with star ratings across food quality, service, cleanliness, and speed." },
  { icon: Shield, title: "Smart Review Routing", desc: "Positive reviews go to Google automatically. Negative feedback stays private for your improvement." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Track ratings, sentiment trends, keyword analysis, and table performance in real-time." },
  { icon: Utensils, title: "Multi Restaurant", desc: "Manage multiple restaurant locations from a single dashboard with separate analytics." },
  { icon: Zap, title: "AI Reply Generator", desc: "Automatically generate professional, context-aware replies for every review based on sentiment analysis." },
];

const stats = [
  { value: "10x", label: "More Google Reviews" },
  { value: "85%", label: "Positive Feedback Rate" },
  { value: "24/7", label: "Automated Monitoring" },
  { value: "100%", label: "Private Negative Feedback" },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-card/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-16">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <Star className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-sm md:text-base">Meta Automation Menu</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="rounded-xl">Sign In</Button>
            <Button size="sm" onClick={() => navigate("/auth")} className="rounded-xl gap-1">Get Started <ArrowRight className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border border-primary/20">
              <Zap className="h-3.5 w-3.5" /> Smart Restaurant Automation
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto">
              Meta Automation
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-accent-foreground bg-clip-text text-transparent">
                Menu
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-6 leading-relaxed">
              Smart Restaurant Digital Menu & Review Automation System. Collect feedback, analyze reviews, and increase positive Google reviews automatically.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
              <Button size="lg" onClick={() => navigate("/auth")} className="rounded-xl text-base px-8 gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="rounded-xl text-base px-8">
                Create Your Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-border/40 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <p className="text-3xl md:text-4xl font-display font-extrabold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold">Everything You Need to Boost Reviews</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Powerful tools designed specifically for restaurant owners to manage reputation and grow.</p>
        </motion.div>
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={i} variants={item}>
              <Card className="border border-border/40 shadow-card rounded-2xl hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 h-full group">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="bg-muted/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-3">Three simple steps to boost your Google reviews</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Generate QR Codes", desc: "Create unique QR codes for each table in your restaurant." },
              { step: "2", title: "Collect Feedback", desc: "Customers scan and rate their experience across multiple categories." },
              { step: "3", title: "Boost Reviews", desc: "Happy customers are redirected to Google. Negative feedback stays private." },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-5 text-2xl font-display font-extrabold shadow-lg shadow-primary/25">
                  {s.step}
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <Card className="border-0 bg-gradient-to-br from-primary to-primary/80 rounded-3xl overflow-hidden shadow-2xl shadow-primary/20">
            <CardContent className="p-10 md:p-16 text-center text-primary-foreground">
              <h2 className="text-3xl md:text-4xl font-display font-extrabold mb-4">Ready to Boost Your Reviews?</h2>
              <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8 text-lg">
                Join restaurants already using Meta Automation Menu to increase positive reviews and improve service quality.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" variant="secondary" onClick={() => navigate("/auth")} className="rounded-xl text-base px-8 gap-2 font-semibold">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-8 text-sm text-primary-foreground/70">
                {["No credit card required", "Free setup", "Cancel anytime"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> {t}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
