import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Star, Trophy, Zap } from "lucide-react";
import { motion } from "framer-motion";

const rewards = [
  { id: 1, name: "Free Dessert", description: "Leave a 5-star review and get a free dessert on your next visit", points: 50, claimed: 89, active: true },
  { id: 2, name: "10% Off Next Visit", description: "Write a detailed review (50+ words) for 10% off", points: 30, claimed: 156, active: true },
  { id: 3, name: "Free Appetizer", description: "Share your review on social media for a free appetizer", points: 40, claimed: 67, active: true },
  { id: 4, name: "VIP Night Invite", description: "Collect 200 points to get invited to our exclusive VIP tasting night", points: 200, claimed: 12, active: false },
];

const topReviewers = [
  { name: "Emily R.", reviews: 23, points: 460 },
  { name: "Sarah M.", reviews: 18, points: 360 },
  { name: "Lisa W.", reviews: 15, points: 300 },
  { name: "Mike T.", reviews: 12, points: 240 },
  { name: "James K.", reviews: 8, points: 160 },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function Rewards() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Rewards</h1>
        <p className="text-muted-foreground mt-1">Manage bonuses for customers who leave reviews.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {rewards.map((r) => (
            <motion.div key={r.id} variants={item}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Gift className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{r.name}</span>
                        <Badge variant={r.active ? "default" : "secondary"} className="text-[10px]">{r.active ? "Active" : "Paused"}</Badge>
                        <Badge variant="outline" className="text-[10px]">{r.points} pts</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                      <p className="text-xs text-muted-foreground/60 mt-2">{r.claimed} times claimed</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" /> Top Reviewers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topReviewers.map((t, i) => (
                <div key={t.name} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">{t.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.reviews} reviews</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{t.points} pts</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
