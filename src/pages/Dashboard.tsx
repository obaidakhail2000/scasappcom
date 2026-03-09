import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Users, TrendingUp, ArrowUpRight, ChevronRight, Zap, BarChart3, TableProperties, AlertTriangle } from "lucide-react";
import { ReviewPerformanceChart } from "@/components/ReviewPerformanceChart";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function Dashboard() {
  const [reviewFilter, setReviewFilter] = useState<"all" | "negative">("all");

  const { data: reviews = [] } = useQuery({
    queryKey: ["dashboard-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
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

  // Stats
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1) : "0";
  const negativeReviews = reviews.filter((r) => r.rating <= 3);
  const positiveReviews = reviews.filter((r) => r.rating >= 4);

  // Rating distribution
  const distribution = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  // Table analytics
  const tableMap = new Map<string, { total: number; sum: number; complaints: number }>();
  reviews.forEach((r) => {
    const t = (r as any).table_number || "N/A";
    const entry = tableMap.get(t) || { total: 0, sum: 0, complaints: 0 };
    entry.total++;
    entry.sum += r.rating;
    if (r.rating <= 3) entry.complaints++;
    tableMap.set(t, entry);
  });

  const tableStats = Array.from(tableMap.entries())
    .map(([table, s]) => ({ table, avg: (s.sum / s.total).toFixed(1), total: s.total, complaints: s.complaints }))
    .sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg));

  const bestTable = tableStats[0];
  const worstTable = [...tableStats].sort((a, b) => b.complaints - a.complaints)[0];

  // Reviews per day (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("ar", { weekday: "short" });
    const count = reviews.filter((r) => r.created_at.startsWith(key)).length;
    return { label, count };
  });

  const filteredReviews = reviewFilter === "negative" ? negativeReviews : reviews;

  const stats = [
    { title: "إجمالي التقييمات", value: String(totalReviews), icon: Star, color: "bg-primary/10 text-primary" },
    { title: "متوسط التقييم", value: avgRating, icon: TrendingUp, color: "bg-accent/15 text-accent-foreground" },
    { title: "تقييمات سلبية", value: String(negativeReviews.length), icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
    { title: "العملاء", value: String(customers.length), icon: Users, color: "bg-secondary text-secondary-foreground" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-display tracking-tight">لوحة التحكم</h1>
        <p className="text-muted-foreground mt-1 text-sm">نظرة عامة على تقييمات مطعمك وأداءه.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <motion.div key={s.title} variants={item}>
            <Card className="border-0 shadow-md rounded-2xl">
              <CardContent className="p-5">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${s.color} mb-3`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> توزيع التقييمات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {distribution.reverse().map((d) => (
                <div key={d.star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12 shrink-0">
                    <span className="text-sm font-medium">{d.star}</span>
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                  </div>
                  <div className="flex-1 h-6 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/80 rounded-full transition-all duration-500"
                      style={{ width: `${(d.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">{d.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Reviews Per Day */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display">التقييمات خلال الأسبوع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-40">
                {last7.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-muted-foreground">{d.count}</span>
                    <div
                      className="w-full bg-primary/70 rounded-t-lg transition-all duration-500"
                      style={{ height: `${Math.max(d.count * 20, 4)}px` }}
                    />
                    <span className="text-[10px] text-muted-foreground">{d.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Table Analytics */}
      <motion.div variants={item}>
        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <TableProperties className="h-5 w-5 text-primary" /> أداء الطاولات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tableStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">لا توجد بيانات طاولات بعد.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tableStats.map((t) => (
                  <div key={t.table} className="p-4 rounded-2xl bg-muted/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">طاولة {t.table}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        <span className="text-sm font-bold">{t.avg}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.total} تقييم · {t.complaints} شكوى</p>
                  </div>
                ))}
              </div>
            )}

            {(bestTable || worstTable) && (
              <div className="flex flex-wrap gap-3 mt-4">
                {bestTable && (
                  <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    ⭐ أفضل طاولة: {bestTable.table} ({bestTable.avg})
                  </Badge>
                )}
                {worstTable && worstTable.complaints > 0 && (
                  <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                    ⚠️ أكثر شكاوى: طاولة {worstTable.table} ({worstTable.complaints})
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Reviews List */}
      <motion.div variants={item}>
        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-lg font-display">جميع التقييمات</CardTitle>
              <div className="flex gap-2">
                <Button variant={reviewFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setReviewFilter("all")}>
                  الكل ({totalReviews})
                </Button>
                <Button variant={reviewFilter === "negative" ? "default" : "outline"} size="sm" onClick={() => setReviewFilter("negative")}>
                  <AlertTriangle className="h-3.5 w-3.5 mr-1" /> سلبية ({negativeReviews.length})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">لا توجد تقييمات بعد.</p>
            ) : (
              filteredReviews.slice(0, 20).map((r) => (
                <div key={r.id} className="flex gap-3 p-4 rounded-2xl bg-muted/40">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{r.customer_name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{r.customer_name}</span>
                      <div className="flex gap-px">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`h-3 w-3 ${j < r.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                      {(r as any).table_number && (
                        <Badge variant="outline" className="text-[10px]">طاولة {(r as any).table_number}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">{new Date(r.created_at).toLocaleDateString("ar")}</span>
                    </div>
                    {r.text && <p className="text-sm text-muted-foreground mt-1 truncate">{r.text}</p>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display">إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "إنشاء QR Code", href: "/qr-codes", icon: "📱" },
              { label: "إدارة التقييمات", href: "/reviews", icon: "⭐" },
              { label: "الحملات", href: "/campaigns", icon: "📣" },
              { label: "العملاء", href: "/customers", icon: "👥" },
              { label: "القائمة", href: "/menu", icon: "🍽️" },
              { label: "المكافآت", href: "/rewards", icon: "🎁" },
            ].map((a) => (
              <a
                key={a.label}
                href={a.href}
                className="flex items-center gap-3 p-4 rounded-2xl bg-muted/40 hover:bg-primary/5 hover:shadow-md border border-transparent hover:border-primary/15 transition-all group"
              >
                <span className="text-xl">{a.icon}</span>
                <span className="text-sm font-medium group-hover:text-primary transition-colors">{a.label}</span>
              </a>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
