import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Mail, Phone, Star, Trash2, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function Customers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", tags: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (values: typeof form) => {
      const payload = {
        user_id: user!.id,
        name: values.name,
        email: values.email || null,
        phone: values.phone || null,
        tags: values.tags ? values.tags.split(",").map((t) => t.trim()) : [],
      };
      if (editingId) {
        const { error } = await supabase.from("customers").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("customers").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: editingId ? "Customer updated" : "Customer added" });
      resetForm();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Customer deleted" });
    },
  });

  const resetForm = () => { setForm({ name: "", email: "", phone: "", tags: "" }); setEditingId(null); setOpen(false); };

  const startEdit = (c: any) => {
    setForm({ name: c.name, email: c.email || "", phone: c.phone || "", tags: (c.tags || []).join(", ") });
    setEditingId(c.id);
    setOpen(true);
  };

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your customer database.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); setOpen(v); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Customer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Edit Customer" : "Add Customer"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); upsertMutation.mutate(form); }} className="space-y-3">
              <Input placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              <Button type="submit" className="w-full" disabled={upsertMutation.isPending}>{editingId ? "Update" : "Add"} Customer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search customers..." className="pl-10 rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No customers yet. Add your first one!</div>
      ) : (
        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-xs font-medium text-muted-foreground text-left">Customer</th>
                    <th className="p-4 text-xs font-medium text-muted-foreground text-left">Contact</th>
                    <th className="p-4 text-xs font-medium text-muted-foreground text-left">Visits</th>
                    <th className="p-4 text-xs font-medium text-muted-foreground text-left">Rating</th>
                    <th className="p-4 text-xs font-medium text-muted-foreground text-left">Tags</th>
                    <th className="p-4 text-xs font-medium text-muted-foreground text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <motion.tr key={c.id} variants={item} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">{c.name.split(" ").map((n) => n[0]).join("")}</span>
                          </div>
                          <span className="font-medium text-sm">{c.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          {c.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {c.email}</div>}
                          {c.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {c.phone}</div>}
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium">{c.visits ?? 0}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {c.avg_rating ?? 0}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1 flex-wrap">
                          {(c.tags || []).map((t) => (
                            <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(c)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(c.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
