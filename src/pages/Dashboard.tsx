import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Users, TrendingUp, AlertTriangle, BarChart3, TableProperties, Zap, MessageSquare, ArrowUpRight, Activity, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import {
  calculateReputationScore,
  getReputationLabel,
  analyzeMultipleReviews,
  generateImprovementSuggestions,
  generateAutoReply,
  generateSmartReply,
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

const PIE_COLORS = ["hsl(var(--destructive))", "hsl(var(--destructive))", "hsl(var(--warning))", "hsl(var(--primary))", "hsl(var(--success))"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [chartFilter, setChartFilter] = useState<"7d" | "30d" | "12m">("30d");

  const { data: reviews = [] } = useQuery({
    queryKey: ["dashboard-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const totalReviews = reviews.length;
  const reputationScore = calculateReputationScore(reviews);
  const repLabel = getReputationLabel(reputationScore);
  const negativeReviews = reviews.filter((r) => r.rating <= 2);
  const neutralReviews = reviews.filter((r) => r.rating === 3);
  const positiveReviews = reviews.filter((r) => r.rating >= 4);
  const ratio = totalReviews > 0 ? ((positiveReviews.length / totalReviews) * 100).toFixed(0) : "0";

  const now = new Date();
  const thisWeekStart = new Date(now); thisWeekStart.setDate(now.getDate() - 7);
  const lastWeekStart = new Date(now); lastWeekStart.setDate(now.getDate() - 14);
  const thisWeekReviews = reviews.filter((r) => new Date(r.created_at) >= thisWeekStart);
  const lastWeekReviews = reviews.filter((r) => { const d = new Date(r.created_at); return d >= lastWeekStart && d < thisWeekStart; });
  const thisWeekAvg = thisWeekReviews.length > 0 ? thisWeekReviews.reduce((s, r) => s + r.rating, 0) / thisWeekReviews.length : 0;
  const lastWeekAvg = lastWeekReviews.length > 0 ? lastWeekReviews.reduce((s, r) => s + r.rating, 0) / lastWeekReviews.length : 0;
  const weeklyChange = thisWeekAvg - lastWeekAvg;
  const weeklyImprovement = lastWeekAvg > 0 ? (((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100).toFixed(0) : "0";

  const thisWeekPositive = thisWeekReviews.filter((r) => r.rating >= 4).length;
  const thisWeekNegative = thisWeekReviews.filter((r) => r.rating <= 2).length;

  const todayStr = now.toISOString().split("T")[0];
  const todayReviews = reviews.filter((r) => r.created_at.startsWith(todayStr));
  const todayAvg = todayReviews.length > 0 ? todayReviews.reduce((s, r) => s + r.rating, 0) / todayReviews.length : 0;
  const todayPositive = todayReviews.filter((r) => r.rating >= 4).length;
  const todayNeutral = todayReviews.filter((r) => r.rating === 3).length;
  const todayNegative = todayReviews.filter((r) => r.rating <= 2).length;

  const recentNegative = reviews.filter((r) => r.rating <= 2).slice(0, 3);

  const keywordData = analyzeMultipleReviews(reviews);
  const suggestions = generateImprovementSuggestions(keywordData.negative);

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star: `${star}★`,
    count: reviews.filter((r) => r.rating === star).length,
    starNum: star,
  }));
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  const sentimentData = [
    { name: "Positive", value: positiveReviews.length },
    { name: "Neutral", value: neutralReviews.length },
    { name: "Negative", value: negativeReviews.length },
  ];
  const sentimentColors = ["hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"];

  const chartData = (() => {
    if (chartFilter === "7d") {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().split("T")[0];
        const dayReviews = reviews.filter((r) => r.created_at.startsWith(key));
        const avg = dayReviews.length > 0 ? dayReviews.reduce((s, r) => s + r.rating, 0) / dayReviews.length : 0;
        return { label: d.toLocaleDateString("en", { weekday: "short" }), count: dayReviews.length, avg: parseFloat(avg.toFixed(1)) };
      });
    }
    if (chartFilter === "30d") {
      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (29 - i));
        const key = d.toISOString().split("T")[0];
        const dayReviews = reviews.filter((r) => r.created_at.startsWith(key));
        const avg = dayReviews.length > 0 ? dayReviews.reduce((s, r) => s + r.rating, 0) / dayReviews.length : 0;
        return { label: d.getDate().toString(), count: dayReviews.length, avg: parseFloat(avg.toFixed(1)) };
      });
    }
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (11 - i));
      const m = d.getMonth(), y = d.getFullYear();
      const monthReviews = reviews.filter((r) => { const rd = new Date(r.created_at); return rd.getMonth() === m && rd.getFullYear() === y; });
      const avg = monthReviews.length > 0 ? monthReviews.reduce((s, r) => s + r.rating, 0) / monthReviews.length : 0;
      return { label: d.toLocaleDateString("en", { month: "short" }), count: monthReviews.length, avg: parseFloat(avg.toFixed(1)) };
    });
  })();

  const kpiCards = [
    { title: "Total Reviews", value: totalReviews, icon: Star, gradient: "from-primary/15 to-primary/5", iconColor: "text-primary", change: `+${thisWeekReviews.length} this week`, route: "/reviews" },
    { title: "Avg Rating", value: reputationScore, decimals: 1, icon: TrendingUp, gradient: "from-success/15 to-success/5", iconColor: "text-success", change: repLabel.label, route: "/analytics" },
    { title: "Weekly Reviews", value: thisWeekReviews.length, icon: Activity, gradient: "from-blue-500/15 to-blue-500/5", iconColor: "text-blue-600", change: `${weeklyImprovement}% vs last week`, route: "/analytics" },
    { title: "Positive Reviews", value: positiveReviews.length, icon: Users, gradient: "from-success/15 to-success/5", iconColor: "text-success", change: `${ratio}% positive`, route: "/reviews" },
    { title: "Neutral Reviews", value: neutralReviews.length, icon: MessageSquare, gradient: "from-amber-500/15 to-amber-500/5", iconColor: "text-amber-600", change: `${neutralReviews.length} total`, route: "/reviews" },
    { title: "Negative Reviews", value: negativeReviews.length, icon: AlertTriangle, gradient: "from-destructive/15 to-destructive/5", iconColor: "text-destructive", change: `${negativeReviews.length} pending`, route: "/private-feedback" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-[1400px] mx-auto">
      {/* Intro Text */}
      <motion.div variants={item} className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-primary/10">
        <h1 className="text-3xl font-bold font-display">Meta Automation Menu</h1>
        <p className="text-sm font-medium text-primary/70 mb-1">Smart Restaurant Menu & Review Automation System</p>
        <p className="text-muted-foreground text-sm mt-2 max-w-3xl leading-relaxed">
          Meta Automation Menu helps restaurants collect customer feedback through QR codes placed on tables. Customers can quickly rate their experience and leave comments. The dashboard provides real-time analytics, sentiment insights, and smart automation tools that help restaurant owners respond to feedback and improve their service.
        </p>
      </motion.div>

      {/* Reputation Alerts */}
      {recentNegative.length > 0 && (
        <motion.div variants={item}>
          <Card className="border border-destructive/30 bg-destructive/5 shadow-card rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-destructive" />
                <span className="text-base font-semibold text-destructive">Reputation Alerts</span>
                <Badge className="bg-destructive/15 text-destructive border-0 text-xs">{negativeReviews.length} negative</Badge>
              </div>
              <div className="space-y-3">
                {recentNegative.map((r) => (
                  <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-destructive/20">
                    <div className="h-10 w-10 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{r.customer_name}</span>
                        <div className="flex gap-px">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-destructive text-destructive" />)}</div>
                        {r.table_number && <Badge variant="outline" className="text-xs h-5 border-destructive/30">Table {r.table_number}</Badge>}
                      </div>
                      {r.text && <p className="text-sm text-muted-foreground mt-1">{r.text}</p>}
                      <p className="text-xs text-success mt-2 italic">💡 Suggested: "{generateSmartReply(r.rating, r.text || "")}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi) => (
          <motion.div key={kpi.title} variants={item}>
            <Card
              className="border border-border/40 shadow-card rounded-2xl cursor-pointer hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
              onClick={() => navigate(kpi.route)}
            >
              <CardContent className="p-5 relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-60`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center bg-card shadow-sm ${kpi.iconColor} transition-transform group-hover:scale-110`}>
                      <kpi.icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-3xl font-bold tracking-tight">
                    <AnimatedCounter value={kpi.value} decimals={kpi.decimals || 0} />
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">{kpi.title}</p>
                  <p className="text-xs text-success mt-1 font-semibold">{kpi.change}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Weekly Performance + Daily Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <motion.div variants={item}>
          <Card className="border border-border/40 shadow-card rounded-2xl h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Weekly Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/40 border border-border/30 text-center">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Last Week</p>
                  <p className="text-2xl font-bold">{lastWeekAvg.toFixed(1)} <Star className="inline h-5 w-5 fill-primary text-primary" /></p>
                  <p className="text-xs text-muted-foreground mt-1">{lastWeekReviews.length} reviews</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/30 text-center">
                  <p className="text-xs text-muted-foreground font-medium mb-1">This Week</p>
                  <p className="text-2xl font-bold">{thisWeekAvg.toFixed(1)} <Star className="inline h-5 w-5 fill-primary text-primary" /></p>
                  <p className="text-xs text-muted-foreground mt-1">{thisWeekReviews.length} reviews</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                <p className="text-lg font-bold text-primary">
                  {weeklyChange >= 0 ? "📈" : "📉"} Rating {weeklyChange >= 0 ? "improved" : "dropped"} by {weeklyChange >= 0 ? "+" : ""}{weeklyChange.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{weeklyImprovement}% {parseInt(weeklyImprovement) >= 0 ? "improvement" : "decline"} vs last week</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-center">
                  <p className="text-xs text-success font-medium">Positive This Week</p>
                  <p className="text-xl font-bold text-success">{thisWeekPositive}</p>
                </div>
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
                  <p className="text-xs text-destructive font-medium">Negative This Week</p>
                  <p className="text-xl font-bold text-destructive">{thisWeekNegative}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border border-border/40 shadow-card rounded-2xl h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Daily Reputation Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-4 rounded-xl bg-muted/40 border border-border/30">
                  <p className="text-xs text-muted-foreground font-medium">New Reviews Today</p>
                  <p className="text-2xl font-bold mt-1">{todayReviews.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/30">
                  <p className="text-xs text-muted-foreground font-medium">Avg Rating Today</p>
                  <p className="text-2xl font-bold mt-1">{todayAvg.toFixed(1)} ⭐</p>
                </div>
                <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                  <p className="text-xs text-success font-medium">Positive</p>
                  <p className="text-2xl font-bold text-success mt-1">{todayPositive}</p>
                </div>
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="text-xs text-destructive font-medium">Negative</p>
                  <p className="text-2xl font-bold text-destructive mt-1">{todayNegative}</p>
                </div>
              </div>
              {todayNeutral > 0 && (
                <p className="text-xs text-muted-foreground text-center">+ {todayNeutral} neutral review{todayNeutral > 1 ? "s" : ""}</p>
              )}
              {/* Sentiment Pie */}
              <div className="h-44 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sentimentData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                      {sentimentData.map((_, idx) => <Cell key={idx} fill={sentimentColors[idx]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "13px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {sentimentData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: sentimentColors[i] }} />
                    <span>{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reputation Score + Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div variants={item}>
          <Card className="border border-border/40 shadow-card rounded-2xl h-full">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full gap-5">
              <div className="relative h-40 w-40">
                <svg className="h-40 w-40 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="7" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--primary))" strokeWidth="7"
                    strokeDasharray={`${(reputationScore / 5) * 327} 327`}
                    strokeLinecap="round" className="transition-all duration-1000 drop-shadow-sm" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold font-display">{reputationScore.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground font-medium">/5.0</span>
                </div>
              </div>
              <Badge variant="secondary" className={`${repLabel.color} font-semibold text-sm px-4 py-1`}>{repLabel.label}</Badge>
              <p className="text-sm text-muted-foreground text-center">
                {positiveReviews.length} positive · {neutralReviews.length} neutral · {negativeReviews.length} negative
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-2">
          <Card className="border border-border/40 shadow-card rounded-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base font-semibold">Review Trends Over Time</CardTitle>
                <div className="flex gap-1 bg-muted/60 rounded-xl p-1">
                  {[{ key: "7d", label: "7D" }, { key: "30d", label: "30D" }, { key: "12m", label: "12M" }].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setChartFilter(f.key as any)}
                      className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${chartFilter === f.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRatings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "13px", boxShadow: "var(--shadow-elevated)" }} />
                    <Area type="monotone" dataKey="count" name="Reviews" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#colorRatings)" dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 2, stroke: "hsl(var(--card))" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Rating Distribution Bar Chart + Keyword Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={item}>
          <Card className="border border-border/40 shadow-card rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Rating Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="star" tick={{ fontSize: 14, fill: "hsl(var(--foreground))" }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "13px" }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} barSize={28}>
                      {distribution.map((entry, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border border-border/40 shadow-card rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Keyword Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-sm text-muted-foreground mb-2 font-medium">✅ Most Common Compliments</p>
                <div className="flex flex-wrap gap-2">
                  {keywordData.positive.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data yet</p>
                  ) : keywordData.positive.slice(0, 8).map((k) => (
                    <Badge key={k.keyword} variant="secondary" className="bg-success/10 text-success border-success/20 text-xs px-3 py-1">
                      {k.keyword} ({k.count})
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2 font-medium">❌ Most Common Complaints</p>
                <div className="flex flex-wrap gap-2">
                  {keywordData.negative.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data yet</p>
                  ) : keywordData.negative.slice(0, 8).map((k) => (
                    <Badge key={k.keyword} variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20 text-xs px-3 py-1">
                      {k.keyword} ({k.count})
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                <p className="text-sm text-muted-foreground font-medium">Sentiment</p>
                <div className="flex-1 h-3 bg-muted/60 rounded-full overflow-hidden flex">
                  <div className="h-full bg-success rounded-l-full transition-all" style={{ width: `${ratio}%` }} />
                  <div className="h-full bg-destructive rounded-r-full transition-all" style={{ width: `${100 - parseInt(ratio)}%` }} />
                </div>
                <span className="text-sm font-bold">{ratio}%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Improvement Suggestions */}
      <motion.div variants={item}>
        <Card className="border border-border/40 shadow-card rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" /> Improvement Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {suggestions.length === 0 ? (
              <p className="text-base text-muted-foreground text-center py-8">No improvement suggestions yet. Great job! 🎉</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestions.slice(0, 6).map((s) => (
                  <div key={s.keyword} className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border/30 hover:bg-muted/60 transition-colors">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      s.priority === "high" ? "bg-destructive/15 text-destructive" : s.priority === "medium" ? "bg-warning/15 text-warning-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {s.count}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{s.suggestion}</p>
                      <p className="text-xs text-muted-foreground mt-1">Based on "{s.keyword}" mentions · <span className={s.priority === "high" ? "text-destructive" : s.priority === "medium" ? "text-amber-500" : "text-muted-foreground"}>{s.priority} priority</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={item}>
        <Card className="border border-border/40 shadow-card rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-base text-muted-foreground text-center py-8">No reviews yet.</p>
            ) : reviews.slice(0, 6).map((r) => (
              <div key={r.id} className={`flex gap-4 p-4 rounded-xl border hover:bg-muted/50 transition-colors ${r.rating <= 2 ? "bg-destructive/5 border-destructive/20" : "bg-muted/30 border-border/20"}`}>
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${r.rating <= 2 ? "bg-destructive/15" : "bg-gradient-to-br from-primary/15 to-primary/5"}`}>
                  <span className={`text-sm font-bold ${r.rating <= 2 ? "text-destructive" : "text-primary"}`}>{r.customer_name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{r.customer_name}</span>
                    <div className="flex gap-px">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`h-4 w-4 ${j < r.rating ? (r.rating <= 2 ? "fill-destructive text-destructive" : "fill-primary text-primary") : "text-muted-foreground/20"}`} />
                      ))}
                    </div>
                    {r.table_number && <Badge variant="outline" className="text-xs h-5 border-border/40">Table {r.table_number}</Badge>}
                    {r.rating <= 2 && <Badge className="text-xs bg-destructive/15 text-destructive border-0">⚠️ Alert</Badge>}
                    <span className="text-xs text-muted-foreground ml-auto">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  {r.text && <p className="text-sm text-muted-foreground mt-1">{r.text}</p>}
                  <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs text-muted-foreground font-medium">🤖 AI Reply</p>
                    <p className="text-sm text-foreground/80 mt-0.5">{generateSmartReply(r.rating, r.text || "")}</p>
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
