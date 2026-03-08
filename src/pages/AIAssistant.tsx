import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Send, Megaphone, MessageSquare, Lightbulb, Image, BarChart3, Loader2, Copy, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { streamAIChat } from "@/lib/ai-stream";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { BackToDashboard } from "@/components/BackToDashboard";

type Msg = { role: "user" | "assistant"; content: string };

const tools = [
  { id: "campaign", label: "Campaign Generator", icon: Megaphone, color: "bg-primary/10 text-primary" },
  { id: "review", label: "Review Replies", icon: MessageSquare, color: "bg-success/10 text-success" },
  { id: "ideas", label: "Promotion Ideas", icon: Lightbulb, color: "bg-accent/15 text-accent-foreground" },
  { id: "poster", label: "Poster Text", icon: Image, color: "bg-destructive/10 text-destructive" },
  { id: "analytics", label: "Analytics Insights", icon: BarChart3, color: "bg-primary/10 text-primary" },
];

export default function AIAssistant() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("campaign");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  // Campaign form
  const [campForm, setCampForm] = useState({ restaurantType: "", promotionType: "", targetAudience: "", specialOffer: "" });
  // Review form
  const [reviewText, setReviewText] = useState("");
  const [reviewTone, setReviewTone] = useState("positive");
  // Ideas form
  const [ideasType, setIdeasType] = useState("");
  const [ideasSeason, setIdeasSeason] = useState("");
  // Poster form
  const [posterTheme, setPosterTheme] = useState("");
  const [posterOffer, setPosterOffer] = useState("");
  // Analytics form
  const [analyticsData, setAnalyticsData] = useState("");

  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [result]);

  const runAI = async (messages: Msg[]) => {
    setLoading(true);
    setResult("");
    let accumulated = "";

    await streamAIChat({
      messages,
      onDelta: (chunk) => {
        accumulated += chunk;
        setResult(accumulated);
      },
      onDone: () => setLoading(false),
      onError: (err) => {
        setLoading(false);
        toast({ title: "AI Error", description: err, variant: "destructive" });
      },
    });
  };

  const handleCampaign = () => {
    if (!campForm.restaurantType || !campForm.promotionType) {
      toast({ title: "Please fill in restaurant type and promotion type", variant: "destructive" });
      return;
    }
    runAI([{
      role: "user",
      content: `Generate a complete marketing campaign for my restaurant.\n\nRestaurant type: ${campForm.restaurantType}\nPromotion type: ${campForm.promotionType}\nTarget audience: ${campForm.targetAudience || "general"}\nSpecial offer: ${campForm.specialOffer || "none specified"}\n\nPlease provide:\n1. **Campaign Title** - catchy and memorable\n2. **Promotional Text** - a paragraph for general marketing\n3. **SMS Version** - under 160 characters\n4. **Email Version** - subject line + body\n5. **Social Media Post** - with emojis, hashtags, engagement-ready`
    }]);
  };

  const handleReview = () => {
    if (!reviewText.trim()) {
      toast({ title: "Please paste a customer review", variant: "destructive" });
      return;
    }
    runAI([{
      role: "user",
      content: `Generate a professional restaurant reply to this ${reviewTone} customer review:\n\n"${reviewText}"\n\nProvide:\n1. A warm, professional reply that acknowledges their feedback\n2. If negative: address concerns and offer resolution\n3. If positive: thank them and invite them back\n4. Keep the tone genuine and on-brand\n5. Include a call-to-action at the end`
    }]);
  };

  const handleIdeas = () => {
    runAI([{
      role: "user",
      content: `Generate 7 creative marketing promotion ideas for a restaurant${ideasType ? ` (${ideasType} cuisine)` : ""}${ideasSeason ? ` for the ${ideasSeason} season` : ""}.\n\nFor each idea provide:\n- **Title** - catchy name\n- **Description** - what the promotion is\n- **Target Audience** - who it's for\n- **Expected Impact** - what results to expect\n- **Implementation Tips** - how to execute it\n\nInclude a mix of: weekend promotions, loyalty offers, seasonal campaigns, and customer engagement ideas.`
    }]);
  };

  const handlePoster = () => {
    if (!posterTheme.trim()) {
      toast({ title: "Please enter a poster theme", variant: "destructive" });
      return;
    }
    runAI([{
      role: "user",
      content: `Generate promotional poster text for a restaurant campaign.\n\nTheme: ${posterTheme}\nSpecial offer: ${posterOffer || "none specified"}\n\nProvide 3 poster text variations:\n1. **Bold & Minimal** - short, punchy headline + subtext\n2. **Elegant & Detailed** - refined copy with description\n3. **Fun & Energetic** - playful, emoji-friendly version\n\nFor each, include: headline, subheadline, body text, and call-to-action. Keep text poster-friendly (brief and impactful).`
    }]);
  };

  const handleAnalytics = () => {
    runAI([{
      role: "user",
      content: `Based on the following restaurant campaign data, provide marketing analytics insights and recommendations:\n\n${analyticsData || "No specific data provided - give general restaurant marketing analytics insights."}\n\nProvide:\n1. **Performance Summary** - key metrics analysis\n2. **Top Performing Strategies** - what works best\n3. **Customer Behavior Insights** - patterns and trends\n4. **Recommended Promotions** - data-driven suggestions\n5. **Action Items** - specific next steps to improve results\n\nBe specific and actionable with numbered recommendations.`
    }]);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    toast({ title: "Copied to clipboard!" });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-display">AI Marketing Assistant</h1>
          <p className="text-muted-foreground mt-0.5">Automate your restaurant marketing with AI-powered tools.</p>
        </div>
      </div>

      {/* Tool Cards Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => { setActiveTab(tool.id); setResult(""); }}
            className={`p-4 rounded-2xl border transition-all duration-200 text-left hover:shadow-md ${
              activeTab === tool.id ? "border-primary/30 bg-primary/5 shadow-md" : "border-border bg-card hover:border-primary/20"
            }`}
          >
            <div className={`h-10 w-10 rounded-xl ${tool.color} flex items-center justify-center mb-2`}>
              <tool.icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium">{tool.label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {tools.find((t) => t.id === activeTab)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setResult(""); }}>
              <TabsList className="hidden">
                {tools.map((t) => <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>)}
              </TabsList>

              {/* Campaign Generator */}
              <TabsContent value="campaign" className="space-y-3 mt-0">
                <Input placeholder="Restaurant type (e.g., Italian, Sushi, BBQ)" value={campForm.restaurantType} onChange={(e) => setCampForm({ ...campForm, restaurantType: e.target.value })} />
                <Select value={campForm.promotionType} onValueChange={(v) => setCampForm({ ...campForm, promotionType: v })}>
                  <SelectTrigger><SelectValue placeholder="Promotion type" /></SelectTrigger>
                  <SelectContent>
                    {["Grand Opening", "Weekend Special", "Happy Hour", "Holiday Event", "New Menu Launch", "Anniversary", "Loyalty Program", "Seasonal Offer"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder="Target audience (e.g., families, young professionals)" value={campForm.targetAudience} onChange={(e) => setCampForm({ ...campForm, targetAudience: e.target.value })} />
                <Input placeholder="Special offer (e.g., 20% off, free dessert)" value={campForm.specialOffer} onChange={(e) => setCampForm({ ...campForm, specialOffer: e.target.value })} />
                <Button className="w-full gap-2" onClick={handleCampaign} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Generate Campaign
                </Button>
              </TabsContent>

              {/* Review Reply */}
              <TabsContent value="review" className="space-y-3 mt-0">
                <Select value={reviewTone} onValueChange={setReviewTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive Review</SelectItem>
                    <SelectItem value="neutral">Neutral Review</SelectItem>
                    <SelectItem value="negative">Negative Review</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea placeholder="Paste the customer review here..." className="min-h-[140px] resize-none" value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
                <Button className="w-full gap-2" onClick={handleReview} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                  Generate Reply
                </Button>
              </TabsContent>

              {/* Promotion Ideas */}
              <TabsContent value="ideas" className="space-y-3 mt-0">
                <Input placeholder="Restaurant cuisine type (optional)" value={ideasType} onChange={(e) => setIdeasType(e.target.value)} />
                <Select value={ideasSeason} onValueChange={setIdeasSeason}>
                  <SelectTrigger><SelectValue placeholder="Season (optional)" /></SelectTrigger>
                  <SelectContent>
                    {["Spring", "Summer", "Fall", "Winter", "Holiday Season", "Back to School", "Valentine's Day", "New Year"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="w-full gap-2" onClick={handleIdeas} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
                  Generate Ideas
                </Button>
              </TabsContent>

              {/* Poster Text */}
              <TabsContent value="poster" className="space-y-3 mt-0">
                <Input placeholder="Poster theme (e.g., Summer BBQ, Wine Night)" value={posterTheme} onChange={(e) => setPosterTheme(e.target.value)} />
                <Input placeholder="Special offer text (optional)" value={posterOffer} onChange={(e) => setPosterOffer(e.target.value)} />
                <Button className="w-full gap-2" onClick={handlePoster} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
                  Generate Poster Text
                </Button>
              </TabsContent>

              {/* Analytics */}
              <TabsContent value="analytics" className="space-y-3 mt-0">
                <Textarea placeholder="Paste your campaign data, metrics, or describe your recent campaigns... (Leave blank for general insights)" className="min-h-[140px] resize-none" value={analyticsData} onChange={(e) => setAnalyticsData(e.target.value)} />
                <Button className="w-full gap-2" onClick={handleAnalytics} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
                  Analyze & Get Insights
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-display">AI Response</CardTitle>
              {result && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="gap-1.5 h-8" onClick={copyResult}>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1.5 h-8" onClick={() => setResult("")}>
                    <RotateCcw className="h-3.5 w-3.5" /> Clear
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div ref={resultRef} className="min-h-[300px] max-h-[500px] overflow-y-auto rounded-xl bg-muted/40 p-5">
              {loading && !result && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm">Generating your content...</span>
                </div>
              )}
              {!loading && !result && (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <Sparkles className="h-12 w-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">Your AI-generated content will appear here</p>
                  <p className="text-xs mt-1">Select a tool and fill in the details to get started</p>
                </div>
              )}
              {result && (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground">
                  <ReactMarkdown>{result}</ReactMarkdown>
                  {loading && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
