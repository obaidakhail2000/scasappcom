import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Users, TrendingUp, AlertTriangle, BarChart3, TableProperties, Zap, MessageSquare, ArrowUpRight, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  calculateReputationScore,
  getReputationLabel,
  analyzeMultipleReviews,
  generateImprovementSuggestions,
  generateAutoReply,
} from "@/lib/review-analysis";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

function AnimatedCounter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{decimals > 0 ? display.toFixed(decimals) : Math.round(display)}</>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [chartFilter, setChartFilter] = useState<"7d" | "30d" | "12m">("7d");

  const { data: reviews = [] } = useQuery({
    queryKey: ["dashboard-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["dashboard-customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("id");
      if (error) throw error;
      return data;
    },
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["dashboard-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase.from("campaigns").select("id, status");
      if (error) throw error;
      return data;
    },
  });

  const totalReviews = reviews.length;
  const reputationScore = calculateReputationScore(reviews);
  const repLabel = getReputationLabel(reputationScore);
  const negativeReviews = reviews.filter((r) => r.rating <= 3);
  const positiveReviews = reviews.filter((r) => r.rating >= 4);
  const ratio = totalReviews > 0 ? ((positiveReviews.length / totalReviews) * 100).toFixed(0) : "0";
  const sentCampaigns = campaigns.filter((c) => c.status === "sent").length;

  const keywordData = analyzeMultipleReviews(reviews);
  const suggestions = generateImprovementSuggestions(keywordData.negative);

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  const chartData = (() => {
    if (chartFilter === "7d") {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().split("T")[0];
        return { label: d.toLocaleDateString("en", { weekday: "short" }), count: reviews.filter((r) => r.created_at.startsWith(key)).length };
      });
    }
    if (chartFilter === "30d") {
      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (29 - i));
        const key = d.toISOString().split("T")[0];
        return { label: d.getDate().toString(), count: reviews.filter((r) => r.created_at.startsWith(key)).length };
      });
    }
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (11 - i));
      const m = d.getMonth(), y = d.getFullYear();
      return { label: d.toLocaleDateString("en", { month: "short" }), count: reviews.filter((r) => { const rd = new Date(r.created_at); return rd.getMonth() === m && rd.getFullYear() === y; }).length };
    });
  })();

  const tableMap = new Map<string, { total: number; sum: number; complaints: number }>();
  reviews.forEach((r) => {
    const t = (r as any).table_number || "N/A";
    const entry = tableMap.get(t) || { total: 0, sum: 0, complaints: 0 };
    entry.total++; entry.sum += r.rating;
    if (r.rating <= 3) entry.complaints++;
    tableMap.set(t, entry);
  });
  const tableStats = Array.from(tableMap.entries())
    .map(([table, s]) => ({ table, avg: (s.sum / s.total).toFixed(1), total: s.total, complaints: s.complaints }))
    .sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg));
  const bestTable = tableStats[0];
  const worstTable = [...tableStats].sort((a, b) => b.complaints - a.complaints)[0];

  const kpiCards = [
    { title: "Total Reviews", value: totalReviews, icon: Star, gradient: "from-primary/15 to-primary/5", iconColor: "text-primary", change: "+12%", route: "/reviews" },
    { title: "Active Customers", value: customers.length, icon: Users, gradient: "from-blue-500/15 to-blue-500/5", iconColor: "text-blue-600", change: "+5%", route: "/customers" },
    { title: "Campaigns Sent", value: sentCampaigns, icon: Zap, gradient: "from-amber-500/15 to-amber-500/5", iconColor: "text-amber-600", change: "+3", route: "/campaigns" },
    { title: "Avg Rating", value: reputationScore, decimals: 1, icon: TrendingUp, gradient: "from-success/15 to-success/5", iconColor: "text-success", change: repLabel.label, route: "/analytics" },
    { title: "Reputation", value: reputationScore, decimals: 1, icon: Activity, gradient: "from-violet-500/15 to-violet-500/5", iconColor: "text-violet-600", change: `${ratio}% positive`, route: "/analytics" },
    { title: "Negative Feedback", value: negativeReviews.length, icon: AlertTriangle, gradient: "from-destructive/15 to-destructive/5", iconColor: "text-destructive", change: `${negativeReviews.length} pending`, route: "/private-feedback" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold font-display">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your restaurant performance & reputation.</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpiCards.map((kpi) => (
          <motion.div key={kpi.title} variants={item}>
            <Card
              className="border border-border/40 shadow-card rounded-xl cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden"
              onClick={() => navigate(kpi.route)}
            >
              <CardContent className="p-4 relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-60`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center bg-card shadow-sm ${kpi.iconColor} transition-transform group-hover:scale-110`}>
                      <kpi.icon className="h-4 w-4" />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-2xl font-bold tracking-tight">
                    <AnimatedCounter value={kpi.value} decimals={kpi.decimals || 0} />
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">{kpi.title}</p>
                  <p className="text-[10px] text-success mt-1 font-semibold">{kpi.change}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Reputation Score + Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={item}>
          <Card className="border border-border/40 shadow-card rounded-xl h-full">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full gap-4">
              <div className="relative h-36 w-36">
                <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="7" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--primary))" strokeWidth="7"
                    strokeDasharray={`${(reputationScore / 5) * 327} 327`}
                    strokeLinecap="round" className="transition-all duration-1000 drop-shadow-sm" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold font-display">{reputationScore.toFixed(1)}</span>
                  <span className="text-[11px] text-muted-foreground font-medium">/5.0</span>
                </div>
              </div>
              <Badge variant="secondary" className={`${repLabel.color} font-semibold text-xs px-3`}>{repLabel.label}</Badge>
              <p className="text-xs text-muted-foreground text-center">
                {positiveReviews.length} positive · {negativeReviews.length} negative
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-2">
          <Card className="border border-border/40 shadow-card rounded-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm font-semibold">Ratings Over Time</CardTitle>
                <div className="flex gap-1 bg-muted/60 rounded-lg p-0.5">
                  {[{ key: "7d", label: "7D" }, { key: "30d", label: "30D" }, { key: "12m", label: "12M" }].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setChartFilter(f.key as any)}
                      className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all ${chartFilter === f.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRatings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px", boxShadow: "var(--shadow-elevated)" }} />
                    <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorRatings)" dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(var(--card))" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Rating Distribution + Table Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item}>
          <Card className="border border-border/40 shadow-card rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Rating Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {distribution.map((d) => (
                <div key={d.star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-10 shrink-0">
                    <span className="text-sm font-semibold">{d.star}</span>
                    <Star className="h-3 w-3 fill-primary text-primary" />
                  </div>
                  <div className="flex-1 h-4 bg-muted/60 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(d.count / maxCount) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right font-semibold">{d.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border border-border/40 shadow-card rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TableProperties className="h-4 w-4 text-primary" /> Table Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tableStats.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No table data yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {tableStats.slice(0, 6).map((t) => (
                    <div key={t.table} className="p-3 rounded-lg bg-muted/40 border border-border/30 space-y-1 hover:bg-muted/60 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">Table {t.table}</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span className="text-xs font-bold">{t.avg}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{t.total} reviews · {t.complaints} complaints</p>
                    </div>
                  ))}
                </div>
              )}
              {(bestTable || worstTable) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {bestTable && <Badge variant="secondary" className="text-[10px] bg-success/10 text-success border-success/20">⭐ Best: Table {bestTable.table} ({bestTable.avg})</Badge>}
                  {worstTable && worstTable.complaints > 0 && <Badge variant="secondary" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">⚠️ Most complaints: Table {worstTable.table} ({worstTable.complaints})</Badge>}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Keyword Insights + Improvement Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item}>
          <Card className="border border-border/40 shadow-card rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Keyword Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">Top Positive Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {keywordData.positive.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No data yet</p>
                  ) : keywordData.positive.slice(0, 8).map((k) => (
                    <Badge key={k.keyword} variant="secondary" className="bg-success/10 text-success border-success/20 text-[10px]">
                      {k.keyword} ({k.count})
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">Top Negative Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {keywordData.negative.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No data yet</p>
                  ) : keywordData.negative.slice(0, 8).map((k) => (
                    <Badge key={k.keyword} variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
                      {k.keyword} ({k.count})
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-border/40">
                <p className="text-xs text-muted-foreground font-medium">Sentiment</p>
                <div className="flex-1 h-2.5 bg-muted/60 rounded-full overflow-hidden flex">
                  <div className="h-full bg-success rounded-l-full transition-all" style={{ width: `${ratio}%` }} />
                  <div className="h-full bg-destructive rounded-r-full transition-all" style={{ width: `${100 - parseInt(ratio)}%` }} />
                </div>
                <span className="text-xs font-semibold">{ratio}%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border border-border/40 shadow-card rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" /> Improvement Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No improvement suggestions yet. Great job! 🎉</p>
              ) : suggestions.slice(0, 5).map((s) => (
                <div key={s.keyword} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/30 hover:bg-muted/60 transition-colors">
                  <div className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold ${
                    s.priority === "high" ? "bg-destructive/15 text-destructive" : s.priority === "medium" ? "bg-warning/15 text-warning-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {s.count}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{s.suggestion}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Based on "{s.keyword}" mentions</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={item}>
        <Card className="border border-border/40 shadow-card rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No reviews yet.</p>
            ) : reviews.slice(0, 8).map((r) => (
              <div key={r.id} className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/20 hover:bg-muted/50 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{r.customer_name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{r.customer_name}</span>
                    <div className="flex gap-px">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`h-3 w-3 ${j < r.rating ? "fill-primary text-primary" : "text-muted-foreground/20"}`} />
                      ))}
                    </div>
                    {(r as any).table_number && <Badge variant="outline" className="text-[9px] h-4 border-border/40">Table {(r as any).table_number}</Badge>}
                    <span className="text-[10px] text-muted-foreground ml-auto">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  {r.text && <p className="text-xs text-muted-foreground mt-0.5 truncate">{r.text}</p>}
                  <div className="mt-1.5 p-2 rounded-md bg-primary/5 border border-primary/10">
                    <p className="text-[10px] text-muted-foreground font-medium">🏪 Restaurant Reply</p>
                    <p className="text-[11px] text-foreground/80 mt-0.5">{generateAutoReply(r.rating)}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
