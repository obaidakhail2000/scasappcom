import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Mail, Phone, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const customers = [
  { id: 1, name: "Sarah Mitchell", email: "sarah@email.com", phone: "+1 555-0101", visits: 12, avgRating: 4.8, lastVisit: "Mar 6, 2026", tags: ["VIP", "Regular"] },
  { id: 2, name: "Mike Thompson", email: "mike@email.com", phone: "+1 555-0102", visits: 8, avgRating: 4.2, lastVisit: "Mar 5, 2026", tags: ["Regular"] },
  { id: 3, name: "Emily Rodriguez", email: "emily@email.com", phone: "+1 555-0103", visits: 23, avgRating: 4.9, lastVisit: "Mar 7, 2026", tags: ["VIP", "Loyalty"] },
  { id: 4, name: "James Kim", email: "james@email.com", phone: "+1 555-0104", visits: 5, avgRating: 5.0, lastVisit: "Mar 4, 2026", tags: ["New"] },
  { id: 5, name: "Lisa Wang", email: "lisa@email.com", phone: "+1 555-0105", visits: 15, avgRating: 4.5, lastVisit: "Mar 3, 2026", tags: ["Regular", "Loyalty"] },
  { id: 6, name: "David Parker", email: "david@email.com", phone: "+1 555-0106", visits: 3, avgRating: 4.7, lastVisit: "Mar 2, 2026", tags: ["New"] },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function Customers() {
  const [search, setSearch] = useState("");
  const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your customer database.</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Customer</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search customers..." className="pl-10 rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

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
                  <th className="p-4 text-xs font-medium text-muted-foreground text-left">Last Visit</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground text-left">Tags</th>
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
                        <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {c.email}</div>
                        <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {c.phone}</div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium">{c.visits}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {c.avgRating}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{c.lastVisit}</td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {c.tags.map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
