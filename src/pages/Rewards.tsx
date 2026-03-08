import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Gift, Trophy, Plus, Trash2, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { BackToDashboard } from "@/components/BackToDashboard";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function Rewards() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", points: "" });

  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rewards").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async () => {
      const payload = { user_id: user!.id, name: form.name, description: form.description || null, points: parseInt(form.points) || 0 };
      if (editingId) {
        const { error } = await supabase.from("rewards").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("rewards").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      toast({ title: editingId ? "Reward updated" : "Reward created" });
      resetForm();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("rewards").update({ active: !active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rewards"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rewards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["rewards"] }); toast({ title: "Reward deleted" }); },
  });

  const resetForm = () => { setForm({ name: "", description: "", points: "" }); setEditingId(null); setOpen(false); };
  const startEdit = (r: any) => { setForm({ name: r.name, description: r.description || "", points: String(r.points) }); setEditingId(r.id); setOpen(true); };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <BackToDashboard />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display">Rewards</h1>
          <p className="text-muted-foreground mt-1">Manage bonuses for customers who leave reviews.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); setOpen(v); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Reward</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Edit Reward" : "Add Reward"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); upsertMutation.mutate(); }} className="space-y-3">
              <Input placeholder="Reward name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Input type="number" placeholder="Points" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} />
              <Button type="submit" className="w-full" disabled={upsertMutation.isPending}>{editingId ? "Update" : "Create"} Reward</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : rewards.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No rewards yet. Create your first one!</div>
      ) : (
        <div className="space-y-4">
          {rewards.map((r) => (
            <motion.div key={r.id} variants={item}>
              <Card className="hover:shadow-lg transition-all border-0 shadow-sm rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Gift className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{r.name}</span>
                        <Badge variant={r.active ? "default" : "secondary"} className="text-[10px]">{r.active ? "Active" : "Paused"}</Badge>
                        <Badge variant="outline" className="text-[10px]">{r.points} pts</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                      <p className="text-xs text-muted-foreground/60 mt-2">{r.claimed ?? 0} times claimed</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={!!r.active} onCheckedChange={() => toggleActive.mutate({ id: r.id, active: !!r.active })} />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(r)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(r.id)}><Trash2 className="h-4 w-4" /></Button>
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
