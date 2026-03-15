import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateSmartReply, detectSentiment, getSentimentEmoji, analyzeMultipleReviews, generateImprovementPlans } from "@/lib/review-analysis";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp, Plus, Trash2, Filter, Search, Lightbulb, BarChart3, TrendingUp, TrendingDown, Zap, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BackToDashboard } from "@/components/BackToDashboard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function Reviews() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customer_name: "", rating: "5", text: "", source: "Google" });
  const [activeTab, setActiveTab] = useState("reviews");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("reviews").insert({
        user_id: user!.id, customer_name: form.customer_name, rating: parseInt(form.rating), text: form.text || null, source: form.source,
      });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["reviews"] }); toast({ title: "Review added" }); setForm({ customer_name: "", rating: "5", text: "", source: "Google" }); setOpen(false); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleHighlight = useMutation({
    mutationFn: async ({ id, highlighted }: { id: string; highlighted: boolean }) => {
      const { error } = await supabase.from("reviews").update({ highlighted: !highlighted }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("reviews").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["reviews"] }); toast({ title: "Review deleted" }); },
  });

  const filtered = useMemo(() => {
    let result = reviews;
    if (starFilter !== null) result = result.filter((r) => r.rating === starFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => r.customer_name.toLowerCase().includes(q) || (r.text && r.text.toLowerCase().includes(q)));
    }
    return result;
  }, [reviews, starFilter, searchQuery]);

  // Review Analysis
  const keywordData = useMemo(() => analyzeMultipleReviews(reviews), [reviews]);
  const improvementPlans = useMemo(() => generateImprovementPlans(keywordData.positive, keywordData.negative), [keywordData]);
  const positiveInsights = keywordData.positive.slice(0, 6);
  const negativeInsights = keywordData.negative.slice(0, 6);

  const starCounts = [5, 4, 3, 2, 1].map((s) => ({ star: s, count: reviews.filter((r) => r.rating === s).length }));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <BackToDashboard />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Reviews</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage reviews, analyze feedback, and generate improvement plans.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 rounded-xl text-sm"><Plus className="h-4 w-4" /> Add Review</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="text-lg">Add Review</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(); }} className="space-y-4">
              <Input placeholder="Customer name *" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required className="rounded-xl" />
              <Select value={form.rating} onValueChange={(v) => setForm({ ...form, rating: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{[5, 4, 3, 2, 1].map((r) => <SelectItem key={r} value={String(r)}>{r} Star{r > 1 && "s"}</SelectItem>)}</SelectContent>
              </Select>
              <Textarea placeholder="Review text" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="rounded-xl" />
              <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{["Google", "Direct", "Yelp", "Facebook"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Button type="submit" className="w-full rounded-xl" disabled={addMutation.isPending}>Add Review</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md rounded-xl">
          <TabsTrigger value="reviews" className="rounded-lg gap-1 text-sm"><MessageSquare className="h-4 w-4" /> Reviews</TabsTrigger>
          <TabsTrigger value="analysis" className="rounded-lg gap-1 text-sm"><BarChart3 className="h-4 w-4" /> Analysis</TabsTrigger>
          <TabsTrigger value="plans" className="rounded-lg gap-1 text-sm"><Lightbulb className="h-4 w-4" /> Plans</TabsTrigger>
        </TabsList>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-5 mt-5">
          {/* Star Filter Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Button
              variant={starFilter === null ? "default" : "outline"}
              size="sm"
              className="rounded-xl text-sm"
              onClick={() => setStarFilter(null)}
            >
              All ({reviews.length})
            </Button>
            {starCounts.map(({ star, count }) => (
              <Button
                key={star}
                variant={starFilter === star ? "default" : "outline"}
                size="sm"
                className="rounded-xl gap-1.5 text-sm"
                onClick={() => setStarFilter(starFilter === star ? null : star)}
              >
                {star} <Star className="h-3.5 w-3.5 fill-current" /> ({count})
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>

          {/* Review List */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground text-base">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-base">No reviews found.</div>
          ) : (
            <div className="grid gap-4">
              {filtered.slice(0, 50).map((r) => {
                const sentiment = detectSentiment(r.rating, r.text);
                const emoji = getSentimentEmoji(sentiment);
                return (
                  <motion.div key={r.id} variants={item}>
                    <Card className={`transition-all hover:shadow-card-hover border border-border/40 shadow-card rounded-2xl ${r.highlighted ? 'ring-2 ring-primary/20' : ''} ${r.rating <= 2 ? 'border-destructive/20 bg-destructive/[0.02]' : ''}`}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-4 flex-1">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${r.rating <= 2 ? 'bg-destructive/15' : 'bg-gradient-to-br from-primary/15 to-primary/5'}`}>
                              <span className={`text-base font-bold ${r.rating <= 2 ? 'text-destructive' : 'text-primary'}`}>{r.customer_name.charAt(0)}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-base">{r.customer_name}</span>
                                <div className="flex">
                                  {Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-primary text-primary" />)}
                                  {Array.from({ length: 5 - r.rating }).map((_, j) => <Star key={j} className="h-4 w-4 text-muted-foreground/20" />)}
                                </div>
                                <Badge variant="secondary" className="text-xs">{r.source}</Badge>
                                <Badge variant="outline" className={`text-xs ${sentiment === 'positive' ? 'border-success/30 text-success' : sentiment === 'negative' ? 'border-destructive/30 text-destructive' : 'border-amber-500/30 text-amber-600'}`}>
                                  {emoji} {sentiment}
                                </Badge>
                                {r.highlighted && <Badge className="text-xs bg-primary/10 text-primary border-0">Featured</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">{r.text}</p>
                              {/* AI Reply */}
                              <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                                <p className="text-xs text-muted-foreground font-medium mb-1">🤖 AI Reply Generator</p>
                                <p className="text-sm text-foreground/80">{generateSmartReply(r.rating, r.text || "")}</p>
                              </div>
                              <p className="text-xs text-muted-foreground/60 mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => toggleHighlight.mutate({ id: r.id, highlighted: !!r.highlighted })}>
                              <ThumbsUp className={`h-4 w-4 ${r.highlighted ? 'text-primary' : ''}`} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-destructive" onClick={() => deleteMutation.mutate(r.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
              {filtered.length > 50 && (
                <p className="text-sm text-muted-foreground text-center py-4">Showing 50 of {filtered.length} reviews</p>
              )}
            </div>
          )}
        </TabsContent>

        {/* Review Analysis Tab */}
        <TabsContent value="analysis" className="space-y-5 mt-5">
          <motion.div variants={item}>
            <h2 className="text-2xl font-bold font-display mb-4">Review Analysis</h2>
            <p className="text-muted-foreground text-sm mb-6">Automatically analyzes all reviews to identify why reviews are positive or negative.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Positive Insights */}
            <motion.div variants={item}>
              <Card className="border border-success/20 shadow-card rounded-2xl h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-success" /> Why Reviews Are Positive
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {positiveInsights.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No positive insights yet</p>
                  ) : positiveInsights.map((k) => (
                    <div key={k.keyword} className="flex items-center gap-3 p-3 rounded-xl bg-success/5 border border-success/10">
                      <div className="h-8 w-8 rounded-lg bg-success/15 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-success">{k.count}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Customers love: <span className="text-success font-semibold">{k.keyword}</span></p>
                        <p className="text-xs text-muted-foreground">{k.count} positive mentions</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Negative Insights */}
            <motion.div variants={item}>
              <Card className="border border-destructive/20 shadow-card rounded-2xl h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-destructive" /> Why Reviews Are Negative
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {negativeInsights.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No negative insights yet</p>
                  ) : negativeInsights.map((k) => (
                    <div key={k.keyword} className="flex items-center gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                      <div className="h-8 w-8 rounded-lg bg-destructive/15 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-destructive">{k.count}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Common complaint: <span className="text-destructive font-semibold">{k.keyword}</span></p>
                        <p className="text-xs text-muted-foreground">{k.count} negative mentions</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Improvement Plans Tab */}
        <TabsContent value="plans" className="space-y-5 mt-5">
          <motion.div variants={item}>
            <h2 className="text-2xl font-bold font-display mb-4">Improvement Plans</h2>
            <p className="text-muted-foreground text-sm mb-6">Auto-generated strategies based on your review analysis. Plans update automatically when new reviews come in.</p>
          </motion.div>

          {improvementPlans.length === 0 ? (
            <p className="text-base text-muted-foreground text-center py-12">No improvement plans generated yet. Add more reviews to see suggestions.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {improvementPlans.map((plan, i) => (
                <motion.div key={i} variants={item}>
                  <Card className={`border shadow-card rounded-2xl h-full ${plan.type === 'fix' ? 'border-destructive/20' : 'border-success/20'}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${plan.type === 'fix' ? 'bg-destructive/15' : 'bg-success/15'}`}>
                          {plan.type === 'fix' ? <Zap className="h-5 w-5 text-destructive" /> : <TrendingUp className="h-5 w-5 text-success" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-base">{plan.title}</h3>
                            <Badge variant={plan.type === 'fix' ? 'destructive' : 'default'} className="text-xs">
                              {plan.type === 'fix' ? '🔧 Fix' : '📈 Promote'}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${plan.priority === 'high' ? 'border-destructive/30 text-destructive' : plan.priority === 'medium' ? 'border-amber-500/30 text-amber-600' : ''}`}>
                              {plan.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                          <p className="text-xs text-muted-foreground mt-2 italic">Based on {plan.basedOn}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
