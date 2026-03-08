import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

const reviewData = [
  { week: "W1", fiveStar: 12, fourStar: 8, threeStar: 3 },
  { week: "W2", fiveStar: 15, fourStar: 6, threeStar: 4 },
  { week: "W3", fiveStar: 11, fourStar: 9, threeStar: 2 },
  { week: "W4", fiveStar: 18, fourStar: 7, threeStar: 5 },
  { week: "W5", fiveStar: 22, fourStar: 10, threeStar: 3 },
  { week: "W6", fiveStar: 19, fourStar: 8, threeStar: 2 },
  { week: "W7", fiveStar: 25, fourStar: 11, threeStar: 4 },
  { week: "W8", fiveStar: 28, fourStar: 9, threeStar: 1 },
  { week: "W9", fiveStar: 24, fourStar: 12, threeStar: 3 },
  { week: "W10", fiveStar: 30, fourStar: 10, threeStar: 2 },
  { week: "W11", fiveStar: 27, fourStar: 13, threeStar: 3 },
  { week: "W12", fiveStar: 32, fourStar: 11, threeStar: 1 },
];

const chartConfig = {
  fiveStar: { label: "5 Star", color: "hsl(152 60% 42%)" },
  fourStar: { label: "4 Star", color: "hsl(29 100% 50%)" },
  threeStar: { label: "3 Star", color: "hsl(45 100% 51%)" },
};

const latestWeek = reviewData[reviewData.length - 1];
const prevWeek = reviewData[reviewData.length - 2];
const totalLatest = latestWeek.fiveStar + latestWeek.fourStar + latestWeek.threeStar;
const totalPrev = prevWeek.fiveStar + prevWeek.fourStar + prevWeek.threeStar;
const trendPercent = Math.round(((totalLatest - totalPrev) / totalPrev) * 100);
const isUp = trendPercent >= 0;

export function ReviewPerformanceChart() {
  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl">
      <CardHeader className="pb-2 px-6 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-display">Review Performance</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Weekly review ratings breakdown</p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${isUp ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
            {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {isUp ? "+" : ""}{trendPercent}% this week
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={reviewData} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="fillFive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(152 60% 42%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(152 60% 42%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillFour" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(29 100% 50%)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(29 100% 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillThree" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(45 100% 51%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(45 100% 51%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
            <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="fiveStar"
              type="monotone"
              fill="url(#fillFive)"
              stroke="hsl(152 60% 42%)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, fill: "hsl(0 0% 100%)", stroke: "hsl(152 60% 42%)" }}
            />
            <Area
              dataKey="fourStar"
              type="monotone"
              fill="url(#fillFour)"
              stroke="hsl(29 100% 50%)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, fill: "hsl(0 0% 100%)", stroke: "hsl(29 100% 50%)" }}
            />
            <Area
              dataKey="threeStar"
              type="monotone"
              fill="url(#fillThree)"
              stroke="hsl(45 100% 51%)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, fill: "hsl(0 0% 100%)", stroke: "hsl(45 100% 51%)" }}
            />
          </AreaChart>
        </ChartContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          {Object.entries(chartConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
              <span className="text-xs font-medium text-muted-foreground">{cfg.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
