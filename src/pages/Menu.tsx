import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  {
    name: "Appetizers",
    items: [
      { id: 1, name: "Truffle Bruschetta", price: 14.99, description: "Toasted bread with truffle cream and cherry tomatoes", available: true },
      { id: 2, name: "Calamari Fritti", price: 12.99, description: "Crispy fried calamari with marinara sauce", available: true },
    ],
  },
  {
    name: "Main Courses",
    items: [
      { id: 3, name: "Grilled Salmon", price: 28.99, description: "Atlantic salmon with roasted vegetables and lemon butter", available: true },
      { id: 4, name: "Truffle Pasta", price: 24.99, description: "Handmade pasta with black truffle and parmesan cream", available: true },
      { id: 5, name: "Wagyu Burger", price: 22.99, description: "Premium wagyu beef with aged cheddar and truffle aioli", available: false },
    ],
  },
  {
    name: "Desserts",
    items: [
      { id: 6, name: "Tiramisu", price: 10.99, description: "Classic Italian tiramisu with espresso and mascarpone", available: true },
      { id: 7, name: "Crème Brûlée", price: 11.99, description: "Vanilla bean crème brûlée with caramelized sugar", available: true },
    ],
  },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function Menu() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display">Menu</h1>
          <p className="text-muted-foreground mt-1">Manage your restaurant menu items and categories.</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Item</Button>
      </div>

      {categories.map((cat) => (
        <motion.div key={cat.name} variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display">{cat.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cat.items.map((menuItem) => (
                <div key={menuItem.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{menuItem.name}</span>
                      {!menuItem.available && <Badge variant="destructive" className="text-[10px]">Unavailable</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{menuItem.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold text-primary">${menuItem.price.toFixed(2)}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
