import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Users, Megaphone, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { title: "Total Reviews", value: "1,284", change: "+12%", up: true, icon: Star, color: "text-primary" },
  { title: "Active Customers", value: "3,421", change: "+8%", up: true, icon: Users, color: "text-success" },
  { title: "Campaigns Sent", value: "48", change: "+23%", up: true, icon: Megaphone, color: "text-primary" },
  { title: "Avg Rating", value: "4.7", change: "-0.1", up: false, icon: TrendingUp, color: "text-warning" },
];

const recentReviews = [
  { name: "Sarah M.", rating: 5, text: "Best pasta I've ever had! The ambiance was perfect.", date: "2 hours ago" },
  { name: "Mike T.", rating: 4, text: "Great food, slightly slow service on a busy night.", date: "5 hours ago" },
  { name: "Emily R.", rating: 5, text: "Amazing brunch menu. Will definitely come back!", date: "1 day ago" },
  { name: "James K.", rating: 5, text: "The chef's special was out of this world.", date: "1 day ago" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your restaurant overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <motion.div key={s.title} variants={item}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${s.up ? 'text-success' : 'text-destructive'}`}>
                    {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {s.change}
                  </span>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display">Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentReviews.map((r, i) => (
                <div key={i} className="flex gap-3 pb-3 border-b last:border-0 last:pb-0">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-primary">{r.name.charAt(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium">{r.name}</span>
                      <div className="flex">
                        {Array.from({ length: r.rating }).map((_, j) => (
                          <Star key={j} className="h-3 w-3 fill-primary text-primary" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground ml-auto">{r.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{r.text}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
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
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <span className="text-xl">{a.icon}</span>
                  <span className="text-sm font-medium">{a.label}</span>
                </a>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
