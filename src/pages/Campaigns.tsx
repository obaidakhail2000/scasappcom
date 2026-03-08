import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Zap, Send, Trash2, Edit } from "lucide-react";
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

export default function Campaigns() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", type: "email", subject: "", content: "", audience: "all" });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async () => {
      const payload = { user_id: user!.id, name: form.name, type: form.type, subject: form.subject || null, content: form.content || null, audience: form.audience };
      if (editingId) {
        const { error } = await supabase.from("campaigns").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("campaigns").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({ title: editingId ? "Campaign updated" : "Campaign created" });
      resetForm();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["campaigns"] }); toast({ title: "Campaign deleted" }); },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("campaigns").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
  });

  const resetForm = () => { setForm({ name: "", type: "email", subject: "", content: "", audience: "all" }); setEditingId(null); setOpen(false); };
  const startEdit = (c: any) => { setForm({ name: c.name, type: c.type, subject: c.subject || "", content: c.content || "", audience: c.audience || "all" }); setEditingId(c.id); setOpen(true); };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      <BackToDashboard />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Create and manage promotion campaigns.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); setOpen(v); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Campaign</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Edit Campaign" : "New Campaign"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); upsertMutation.mutate(); }} className="space-y-3">
              <Input placeholder="Campaign name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["email", "sms", "push"].map((t) => <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              <Textarea placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["all", "vip", "new", "regulars"].map((a) => <SelectItem key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full" disabled={upsertMutation.isPending}>{editingId ? "Update" : "Create"} Campaign</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No campaigns yet.</div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c) => (
            <motion.div key={c.id} variants={item}>
              <Card className="hover:shadow-lg transition-all border-0 shadow-sm rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        {c.type === "sms" ? <Zap className="h-5 w-5 text-primary" /> : <Send className="h-5 w-5 text-primary" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{c.name}</span>
                          <Badge variant={c.status === "active" ? "default" : "secondary"} className="text-[10px]">{c.status}</Badge>
                          <Badge variant="outline" className="text-[10px]">{c.type}</Badge>
                        </div>
                        {c.subject && <p className="text-xs text-muted-foreground mt-0.5">{c.subject}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      {c.status === "draft" && (
                        <Button size="sm" onClick={() => updateStatus.mutate({ id: c.id, status: "active" })}>Activate</Button>
                      )}
                      {c.status === "active" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: c.id, status: "completed" })}>Complete</Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(c)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(c.id)}><Trash2 className="h-4 w-4" /></Button>
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
