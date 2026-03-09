import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateAutoReply } from "@/lib/review-analysis";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BackToDashboard } from "@/components/BackToDashboard";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function Reviews() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "highlighted">("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customer_name: "", rating: "5", text: "", source: "Direct" });

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
        user_id: user!.id,
        customer_name: form.customer_name,
        rating: parseInt(form.rating),
        text: form.text || null,
        source: form.source,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast({ title: "Review added" });
      setForm({ customer_name: "", rating: "5", text: "", source: "Direct" });
      setOpen(false);
    },
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
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast({ title: "Review deleted" });
    },
  });

  const filtered = filter === "highlighted" ? reviews.filter((r) => r.highlighted) : reviews;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      <BackToDashboard />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display">Reviews</h1>
          <p className="text-muted-foreground mt-1">Manage and highlight your best customer reviews.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
          <Button variant={filter === "highlighted" ? "default" : "outline"} size="sm" onClick={() => setFilter("highlighted")}>
            <Star className="h-4 w-4 mr-1" /> Featured
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Review</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(); }} className="space-y-3">
                <Input placeholder="Customer name *" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required />
                <Select value={form.rating} onValueChange={(v) => setForm({ ...form, rating: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((r) => <SelectItem key={r} value={String(r)}>{r} Star{r > 1 && "s"}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Textarea placeholder="Review text" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
                <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Direct", "Google", "Yelp", "Facebook"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button type="submit" className="w-full" disabled={addMutation.isPending}>Add Review</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No reviews yet.</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((r) => (
            <motion.div key={r.id} variants={item}>
              <Card className={`transition-all hover:shadow-lg border-0 shadow-sm rounded-2xl ${r.highlighted ? 'ring-1 ring-primary/20' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1">
                      <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">{r.customer_name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{r.customer_name}</span>
                          <div className="flex">
                            {Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-primary text-primary" />)}
                            {Array.from({ length: 5 - r.rating }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 text-muted-foreground/30" />)}
                          </div>
                          <Badge variant="secondary" className="text-[10px]">{r.source}</Badge>
                          {r.highlighted && <Badge className="text-[10px] bg-primary/10 text-primary border-0">Featured</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{r.text}</p>
                        <div className="mt-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-[10px] text-muted-foreground font-medium">🏪 Restaurant Reply</p>
                          <p className="text-[11px] text-foreground/70 mt-0.5">{generateAutoReply(r.rating)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground/60 mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleHighlight.mutate({ id: r.id, highlighted: !!r.highlighted })}>
                        <ThumbsUp className={`h-4 w-4 ${r.highlighted ? 'text-primary' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(r.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
