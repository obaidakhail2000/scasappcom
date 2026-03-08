import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BackToDashboard } from "@/components/BackToDashboard";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const CATEGORIES = ["Appetizers", "Main Courses", "Desserts", "Drinks", "Sides"];

export default function Menu() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "Main Courses", available: true });

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ["menu_items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("menu_items").select("*").order("category").order("name");
      if (error) throw error;
      return data;
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async () => {
      const payload = { user_id: user!.id, name: form.name, description: form.description || null, price: parseFloat(form.price), category: form.category, available: form.available };
      if (editingId) {
        const { error } = await supabase.from("menu_items").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("menu_items").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu_items"] });
      toast({ title: editingId ? "Item updated" : "Item added" });
      resetForm();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["menu_items"] }); toast({ title: "Item deleted" }); },
  });

  const resetForm = () => { setForm({ name: "", description: "", price: "", category: "Main Courses", available: true }); setEditingId(null); setOpen(false); };
  const startEdit = (m: any) => { setForm({ name: m.name, description: m.description || "", price: String(m.price), category: m.category, available: m.available ?? true }); setEditingId(m.id); setOpen(true); };

  const grouped = menuItems.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      <BackToDashboard />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display">Menu</h1>
          <p className="text-muted-foreground mt-1">Manage your restaurant menu items.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); setOpen(v); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Edit Item" : "Add Menu Item"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); upsertMutation.mutate(); }} className="space-y-3">
              <Input placeholder="Item name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Input type="number" step="0.01" placeholder="Price *" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Switch checked={form.available} onCheckedChange={(v) => setForm({ ...form, available: v })} />
                <span className="text-sm">Available</span>
              </div>
              <Button type="submit" className="w-full" disabled={upsertMutation.isPending}>{editingId ? "Update" : "Add"} Item</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No menu items yet. Add your first one!</div>
      ) : (
        Object.entries(grouped).map(([cat, items]) => (
          <motion.div key={cat} variants={item}>
            <Card className="border-0 shadow-md rounded-2xl">
              <CardHeader><CardTitle className="text-lg font-display">{cat}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {items.map((menuItem) => (
                  <div key={menuItem.id} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/40">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{menuItem.name}</span>
                        {!menuItem.available && <Badge variant="destructive" className="text-[10px]">Unavailable</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{menuItem.description}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-semibold text-primary">${Number(menuItem.price).toFixed(2)}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(menuItem)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(menuItem.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </motion.div>
  );
}
