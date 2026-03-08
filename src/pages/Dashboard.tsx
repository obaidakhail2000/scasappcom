import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Users, Megaphone, TrendingUp, ArrowUpRight, ArrowDownRight, ChevronRight, Zap } from "lucide-react";
import { ReviewPerformanceChart } from "@/components/ReviewPerformanceChart";
import { motion } from "framer-motion";

const stats = [
  { title: "Total Reviews", value: "1,284", change: "+12%", up: true, icon: Star, color: "bg-primary/10 text-primary" },
  { title: "Active Customers", value: "3,421", change: "+8%", up: true, icon: Users, color: "bg-success/10 text-success" },
  { title: "Campaigns Sent", value: "48", change: "+23%", up: true, icon: Megaphone, color: "bg-accent/15 text-accent-foreground" },
  { title: "Avg Rating", value: "4.7", change: "-0.1", up: false, icon: TrendingUp, color: "bg-destructive/10 text-destructive" },
];

const recentReviews = [
  { name: "Sarah M.", rating: 5, text: "Best pasta I've ever had! The ambiance was perfect.", date: "2 hours ago" },
  { name: "Mike T.", rating: 4, text: "Great food, slightly slow service on a busy night.", date: "5 hours ago" },
  { name: "Emily R.", rating: 5, text: "Amazing brunch menu. Will definitely come back!", date: "1 day ago" },
  { name: "James K.", rating: 5, text: "The chef's special was out of this world.", date: "1 day ago" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function Dashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-display tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">Welcome back! Here's your restaurant overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <motion.div key={s.title} variants={item}>
            <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-md rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${s.color}`}>
                    <s.icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <span className={`text-xs font-semibold flex items-center gap-0.5 px-2.5 py-1 rounded-full ${s.up ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {s.change}
                  </span>
                </div>
                <p className="text-3xl font-bold tracking-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium uppercase tracking-wide">{s.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Placeholder + Recent Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl">
            <CardHeader className="pb-4 px-6 pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display">Recent Reviews</CardTitle>
                <a href="/reviews" className="text-xs text-primary font-medium flex items-center gap-0.5 hover:underline">
                  View all <ChevronRight className="h-3 w-3" />
                </a>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-6">
              {recentReviews.map((r, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-muted/40 hover:bg-muted/70 transition-all duration-200">
                  <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{r.name.charAt(0)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold">{r.name}</span>
                      <div className="flex gap-px">
                        {Array.from({ length: r.rating }).map((_, j) => (
                          <Star key={j} className="h-3 w-3 fill-accent text-accent" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground ml-auto shrink-0">{r.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{r.text}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl">
            <CardHeader className="pb-4 px-6 pt-6">
              <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 px-6">
              {[
                { label: "Generate QR Code", href: "/qr-codes", icon: "📱" },
                { label: "Create Campaign", href: "/campaigns", icon: "📣" },
                { label: "View Customers", href: "/customers", icon: "👥" },
                { label: "Update Menu", href: "/menu", icon: "🍽️" },
                { label: "Create Poster", href: "/posters", icon: "🖼️" },
                { label: "Send Promotion", href: "/marketing", icon: "🎯" },
              ].map((a) => (
                <a
                  key={a.label}
                  href={a.href}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-muted/40 hover:bg-primary/8 hover:shadow-md border border-transparent hover:border-primary/15 transition-all duration-300 group"
                >
                  <span className="text-xl">{a.icon}</span>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">{a.label}</span>
                </a>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Automation Summary */}
      <motion.div variants={item}>
        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" /> Automation Status
              </CardTitle>
              <a href="/campaigns" className="text-xs text-primary font-medium flex items-center gap-0.5 hover:underline">
                Manage <ChevronRight className="h-3 w-3" />
              </a>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Auto Follow-ups", status: "Active", count: "127 sent this week", active: true },
                { label: "Birthday Offers", status: "Active", count: "12 scheduled", active: true },
                { label: "Review Requests", status: "Paused", count: "Last sent 3 days ago", active: false },
              ].map((auto) => (
                <div key={auto.label} className="p-4 rounded-2xl bg-muted/40 flex items-start gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${auto.active ? 'bg-success' : 'bg-muted-foreground/40'}`} />
                  <div>
                    <p className="text-sm font-semibold">{auto.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{auto.status} · {auto.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
