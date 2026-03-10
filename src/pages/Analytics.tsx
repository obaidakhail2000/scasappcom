import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, TrendingUp, TrendingDown, BarChart3, Zap, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { analyzeMultipleReviews, generateImprovementSuggestions, calculateReputationScore, getReputationLabel } from "@/lib/review-analysis";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const PIE_COLORS = ["hsl(var(--destructive))", "hsl(var(--destructive))", "hsl(var(--warning))", "hsl(var(--primary))", "hsl(var(--success))"];

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
  const negativeCount = reviews.filter((r) => r.rating <= 3).length;
  const sentimentRatio = totalReviews > 0 ? ((positiveCount / totalReviews) * 100).toFixed(0) : "0";

  const distribution = [1, 2, 3, 4, 5].map((star) => ({ name: `${star} Star`, value: reviews.filter((r) => r.rating === star).length, star }));

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (11 - i));
    const m = d.getMonth(), y = d.getFullYear();
    const monthReviews = reviews.filter((r) => { const rd = new Date(r.created_at); return rd.getMonth() === m && rd.getFullYear() === y; });
    const avg = monthReviews.length > 0 ? monthReviews.reduce((s, r) => s + r.rating, 0) / monthReviews.length : 0;
    return { label: d.toLocaleDateString("en", { month: "short" }), reviews: monthReviews.length, avgRating: parseFloat(avg.toFixed(1)) };
  });

  const tableMap = new Map<string, { total: number; sum: number; complaints: number }>();
  reviews.forEach((r) => {
    const t = (r as any).table_number || "N/A";
    const entry = tableMap.get(t) || { total: 0, sum: 0, complaints: 0 };
    entry.total++; entry.sum += r.rating; if (r.rating <= 3) entry.complaints++;
    tableMap.set(t, entry);
  });
  const tableStats = Array.from(tableMap.entries()).map(([table, s]) => ({ table, avg: parseFloat((s.sum / s.total).toFixed(1)), total: s.total, complaints: s.complaints })).sort((a, b) => b.avg - a.avg);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold font-display">Analytics & Insights</h1>
        <p className="text-muted-foreground text-sm mt-1">Deep dive into your review data and customer sentiment.</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { title: "Total Reviews", value: totalReviews, icon: MessageSquare, gradient: "from-primary/15 to-primary/5", iconColor: "text-primary" },
          { title: "Avg Rating", value: repScore.toFixed(1), icon: Star, gradient: "from-success/15 to-success/5", iconColor: "text-success" },
          { title: "Sentiment", value: `${sentimentRatio}%`, icon: TrendingUp, gradient: "from-amber-500/15 to-amber-500/5", iconColor: "text-amber-600" },
          { title: "Negative", value: negativeCount, icon: TrendingDown, gradient: "from-destructive/15 to-destructive/5", iconColor: "text-destructive" },
        ].map((s) => (
          <motion.div key={s.title} variants={item}>
            <Card className="border border-border/40 shadow-card rounded-xl overflow-hidden">
              <CardContent className="p-4 relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-60`} />
                <div className="relative">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center bg-card shadow-sm ${s.iconColor} mb-2`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">{s.title}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="border border-border/40 shadow-card rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Review Volume (12 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorReviewsAnalytics" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px", boxShadow: "var(--shadow-elevated)" }} />
                    <Area type="monotone" dataKey="reviews" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorReviewsAnalytics)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border border-border/40 shadow-card rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Rating Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distribution} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                      {distribution.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {distribution.map((d, i) => (
                  <div key={d.star} className="flex items-center gap-1 text-[10px]">
                    <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span>{d.star}★ ({d.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={item}>
          <Card className="border border-border/40 shadow-card rounded-xl h-full">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Keyword Analysis</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">✅ Positive</p>
                <div className="flex flex-wrap gap-1.5">
                  {keywordData.positive.length === 0 ? <p className="text-xs text-muted-foreground">No data</p> :
                    keywordData.positive.slice(0, 10).map((k) => <Badge key={k.keyword} variant="secondary" className="bg-success/10 text-success border-success/20 text-[10px]">{k.keyword} ({k.count})</Badge>)}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">❌ Negative</p>
                <div className="flex flex-wrap gap-1.5">
                  {keywordData.negative.length === 0 ? <p className="text-xs text-muted-foreground">No data</p> :
                    keywordData.negative.slice(0, 10).map((k) => <Badge key={k.keyword} variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">{k.keyword} ({k.count})</Badge>)}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border border-border/40 shadow-card rounded-xl h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Zap className="h-4 w-4 text-amber-500" /> Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestions.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">Everything looks great! 🎉</p> :
                suggestions.slice(0, 6).map((s) => (
                  <div key={s.keyword} className="p-2.5 rounded-lg bg-muted/40 border border-border/30 flex items-start gap-2 hover:bg-muted/60 transition-colors">
                    <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 text-[9px] font-bold ${s.priority === "high" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning-foreground"}`}>{s.count}</div>
                    <div>
                      <p className="text-[11px] font-medium">{s.suggestion}</p>
                      <p className="text-[9px] text-muted-foreground">"{s.keyword}"</p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border border-border/40 shadow-card rounded-xl h-full">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Table Rankings</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {tableStats.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No data yet</p> :
                tableStats.map((t, i) => (
                  <div key={t.table} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40 border border-border/30 hover:bg-muted/60 transition-colors">
                    <div className={`h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-success/15 text-success" : i === tableStats.length - 1 ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold">Table {t.table}</p>
                      <p className="text-[10px] text-muted-foreground">{t.total} reviews · {t.complaints} complaints</p>
                    </div>
                    <div className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-primary text-primary" /><span className="text-sm font-bold">{t.avg}</span></div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
