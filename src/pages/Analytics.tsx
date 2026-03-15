import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, TrendingUp, TrendingDown, BarChart3, Zap, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { analyzeMultipleReviews, generateImprovementSuggestions, calculateReputationScore, getReputationLabel } from "@/lib/review-analysis";
import { BackToDashboard } from "@/components/BackToDashboard";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const PIE_COLORS = ["hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"];

export default function Analytics() {
  const { data: reviews = [] } = useQuery({
    queryKey: ["analytics-reviews"],
    queryFn: async () => { const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false }); if (error) throw error; return data; },
  });

  const totalReviews = reviews.length;
  const repScore = calculateReputationScore(reviews);
  const repLabel = getReputationLabel(repScore);
  const keywordData = analyzeMultipleReviews(reviews);
  const suggestions = generateImprovementSuggestions(keywordData.negative);
  const positiveCount = reviews.filter((r) => r.rating >= 4).length;
  const neutralCount = reviews.filter((r) => r.rating === 3).length;
  const negativeCount = reviews.filter((r) => r.rating <= 2).length;
  const sentimentRatio = totalReviews > 0 ? ((positiveCount / totalReviews) * 100).toFixed(0) : "0";

  const distribution = [1, 2, 3, 4, 5].map((star) => ({ name: `${star}★`, value: reviews.filter((r) => r.rating === star).length, star }));

  const sentimentData = [
    { name: "Positive", value: positiveCount },
    { name: "Neutral", value: neutralCount },
    { name: "Negative", value: negativeCount },
  ];

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (11 - i));
    const m = d.getMonth(), y = d.getFullYear();
    const monthReviews = reviews.filter((r) => { const rd = new Date(r.created_at); return rd.getMonth() === m && rd.getFullYear() === y; });
    const avg = monthReviews.length > 0 ? monthReviews.reduce((s, r) => s + r.rating, 0) / monthReviews.length : 0;
    return { label: d.toLocaleDateString("en", { month: "short" }), reviews: monthReviews.length, avgRating: parseFloat(avg.toFixed(1)) };
  });

  // Weekly stats
  const now = new Date();
  const thisWeekStart = new Date(now); thisWeekStart.setDate(now.getDate() - 7);
  const lastWeekStart = new Date(now); lastWeekStart.setDate(now.getDate() - 14);
  const thisWeekReviews = reviews.filter((r) => new Date(r.created_at) >= thisWeekStart);
  const lastWeekReviews = reviews.filter((r) => { const d = new Date(r.created_at); return d >= lastWeekStart && d < thisWeekStart; });
  const thisWeekAvg = thisWeekReviews.length > 0 ? thisWeekReviews.reduce((s, r) => s + r.rating, 0) / thisWeekReviews.length : 0;
  const lastWeekAvg = lastWeekReviews.length > 0 ? lastWeekReviews.reduce((s, r) => s + r.rating, 0) / lastWeekReviews.length : 0;

  // Monthly stats
  const thisMonth = new Date(); const thisMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
  const lastMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1);
  const lastMonthEnd = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 0);
  const thisMonthReviews = reviews.filter((r) => new Date(r.created_at) >= thisMonthStart);
  const lastMonthRevs = reviews.filter((r) => { const d = new Date(r.created_at); return d >= lastMonthStart && d <= lastMonthEnd; });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-[1400px] mx-auto">
      <BackToDashboard />
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold font-display">Analytics & Insights</h1>
        <p className="text-muted-foreground text-sm mt-1">Deep dive into your review data, sentiment, and performance trends.</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Total Reviews", value: totalReviews, icon: MessageSquare, gradient: "from-primary/15 to-primary/5", iconColor: "text-primary" },
          { title: "Avg Rating", value: repScore.toFixed(1), icon: Star, gradient: "from-success/15 to-success/5", iconColor: "text-success" },
          { title: "Positive %", value: `${sentimentRatio}%`, icon: TrendingUp, gradient: "from-amber-500/15 to-amber-500/5", iconColor: "text-amber-600" },
          { title: "Negative", value: negativeCount, icon: TrendingDown, gradient: "from-destructive/15 to-destructive/5", iconColor: "text-destructive" },
        ].map((s) => (
          <motion.div key={s.title} variants={item}>
            <Card className="border border-border/40 shadow-card rounded-2xl overflow-hidden">
              <CardContent className="p-5 relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-60`} />
                <div className="relative">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-card shadow-sm ${s.iconColor} mb-3`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <p className="text-3xl font-bold">{s.value}</p>
                  <p className="text-sm text-muted-foreground font-medium mt-1">{s.title}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Weekly & Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <motion.div variants={item}>
          <Card className="border border-border/40 shadow-card rounded-2xl">
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Weekly Statistics</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-muted/40 border border-border/30 text-center">
                  <p className="text-xs text-muted-foreground">This Week Reviews</p>
                  <p className="text-2xl font-bold mt-1">{thisWeekReviews.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/30 text-center">
                  <p className="text-xs text-muted-foreground">This Week Avg</p>
                  <p className="text-2xl font-bold mt-1">{thisWeekAvg.toFixed(1)} ⭐</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
                <p className="text-sm font-semibold text-primary">
                  Last week: {lastWeekAvg.toFixed(1)} → This week: {thisWeekAvg.toFixed(1)} ({thisWeekAvg >= lastWeekAvg ? "+" : ""}{(thisWeekAvg - lastWeekAvg).toFixed(1)})
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="border border-border/40 shadow-card rounded-2xl">
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Monthly Statistics</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-muted/40 border border-border/30 text-center">
                  <p className="text-xs text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold mt-1">{thisMonthReviews.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/30 text-center">
                  <p className="text-xs text-muted-foreground">Last Month</p>
                  <p className="text-2xl font-bold mt-1">{lastMonthRevs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="border border-border/40 shadow-card rounded-2xl">
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Review Volume (12 Months)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorReviewsAnalytics" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "13px", boxShadow: "var(--shadow-elevated)" }} />
                    <Area type="monotone" dataKey="reviews" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#colorReviewsAnalytics)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border border-border/40 shadow-card rounded-2xl">
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Sentiment Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sentimentData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3}>
                      {sentimentData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "13px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 justify-center mt-3">
                {sentimentData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="font-medium">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Rating Distribution + Keywords + Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div variants={item}>
          <Card className="border border-border/40 shadow-card rounded-2xl h-full">
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Rating Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 13, fill: "hsl(var(--foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "13px" }} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border border-border/40 shadow-card rounded-2xl h-full">
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Top Keywords</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2 font-medium">✅ Most Praised</p>
                <div className="flex flex-wrap gap-2">
                  {keywordData.positive.length === 0 ? <p className="text-sm text-muted-foreground">No data</p> :
                    keywordData.positive.slice(0, 8).map((k) => <Badge key={k.keyword} variant="secondary" className="bg-success/10 text-success border-success/20 text-xs px-3 py-1">{k.keyword} ({k.count})</Badge>)}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2 font-medium">❌ Most Complained</p>
                <div className="flex flex-wrap gap-2">
                  {keywordData.negative.length === 0 ? <p className="text-sm text-muted-foreground">No data</p> :
                    keywordData.negative.slice(0, 8).map((k) => <Badge key={k.keyword} variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20 text-xs px-3 py-1">{k.keyword} ({k.count})</Badge>)}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border border-border/40 shadow-card rounded-2xl h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2"><Zap className="h-5 w-5 text-amber-500" /> Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestions.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Everything looks great! 🎉</p> :
                suggestions.slice(0, 5).map((s) => (
                  <div key={s.keyword} className="p-3 rounded-xl bg-muted/40 border border-border/30 flex items-start gap-3 hover:bg-muted/60 transition-colors">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${s.priority === "high" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning-foreground"}`}>{s.count}</div>
                    <div>
                      <p className="text-sm font-medium">{s.suggestion}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">"{s.keyword}"</p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
