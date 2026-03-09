// Keyword analysis and auto-reply system (rule-based, no AI APIs)

export const POSITIVE_KEYWORDS = [
  "food", "delicious", "tasty", "amazing", "great", "friendly",
  "good service", "nice place", "excellent", "wonderful", "perfect",
  "love", "best", "fresh", "clean", "recommend", "beautiful",
  "رائع", "ممتاز", "لذيذ", "جميل", "نظيف", "أفضل", "طازج", "مميز",
];

export const NEGATIVE_KEYWORDS = [
  "slow", "wait", "waiting", "late", "cold food", "bad service",
  "rude", "long time", "noisy", "dirty", "expensive", "terrible",
  "worst", "horrible", "disgusting", "overpriced",
  "بطيء", "انتظار", "بارد", "سيء", "وقح", "قذر", "غالي", "مزعج",
];

export function analyzeKeywords(text: string) {
  const lower = text.toLowerCase();
  const positiveMatches: string[] = [];
  const negativeMatches: string[] = [];

  POSITIVE_KEYWORDS.forEach((kw) => {
    if (lower.includes(kw.toLowerCase())) positiveMatches.push(kw);
  });
  NEGATIVE_KEYWORDS.forEach((kw) => {
    if (lower.includes(kw.toLowerCase())) negativeMatches.push(kw);
  });

  return { positiveMatches, negativeMatches };
}

export function analyzeMultipleReviews(reviews: { text: string | null; rating: number }[]) {
  const keywordCount: Record<string, { count: number; type: "positive" | "negative" }> = {};

  reviews.forEach((r) => {
    if (!r.text) return;
    const { positiveMatches, negativeMatches } = analyzeKeywords(r.text);
    positiveMatches.forEach((kw) => {
      keywordCount[kw] = keywordCount[kw] || { count: 0, type: "positive" };
      keywordCount[kw].count++;
    });
    negativeMatches.forEach((kw) => {
      keywordCount[kw] = keywordCount[kw] || { count: 0, type: "negative" };
      keywordCount[kw].count++;
    });
  });

  const sorted = Object.entries(keywordCount)
    .map(([keyword, data]) => ({ keyword, ...data }))
    .sort((a, b) => b.count - a.count);

  return {
    positive: sorted.filter((k) => k.type === "positive"),
    negative: sorted.filter((k) => k.type === "negative"),
    all: sorted,
  };
}

export function generateAutoReply(rating: number): string {
  switch (rating) {
    case 5:
      return "Thank you for your wonderful review! We're happy you enjoyed your visit and hope to see you again soon. 🌟";
    case 4:
      return "Thank you for your feedback! We're glad you had a good experience and appreciate your support. 😊";
    case 3:
      return "Thank you for your review. We appreciate your feedback and will work to improve your next experience.";
    case 2:
    case 1:
      return "We're sorry your experience wasn't perfect. Your feedback is important and we will work to improve our service. 🙏";
    default:
      return "Thank you for your feedback!";
  }
}

export function generateImprovementSuggestions(negativeKeywords: { keyword: string; count: number }[]) {
  const suggestions: { keyword: string; suggestion: string; priority: "high" | "medium" | "low"; count: number }[] = [];

  const suggestionMap: Record<string, string> = {
    slow: "Consider optimizing service speed and staffing during peak hours",
    wait: "Reduce customer wait times by improving table management",
    waiting: "Reduce customer wait times by improving table management",
    late: "Improve order preparation and delivery timing",
    "cold food": "Ensure food is served hot — review kitchen-to-table timing",
    "bad service": "Invest in staff training for better customer service",
    rude: "Focus on staff friendliness and customer interaction training",
    "long time": "Streamline operations to reduce overall service time",
    noisy: "Consider acoustic improvements or noise management",
    dirty: "Increase cleaning frequency and hygiene standards",
    expensive: "Review pricing strategy and perceived value",
    "بطيء": "تحسين سرعة الخدمة وزيادة الموظفين في أوقات الذروة",
    "انتظار": "تقليل وقت الانتظار عبر تحسين إدارة الطاولات",
    "بارد": "التأكد من تقديم الطعام ساخناً",
    "سيء": "الاستثمار في تدريب الموظفين على خدمة العملاء",
    "وقح": "التركيز على لطف الموظفين في التعامل",
    "قذر": "زيادة تكرار التنظيف والحفاظ على معايير النظافة",
    "غالي": "مراجعة استراتيجية التسعير",
    "مزعج": "النظر في تحسينات صوتية للمكان",
  };

  negativeKeywords.forEach((nk) => {
    const suggestion = suggestionMap[nk.keyword];
    if (suggestion) {
      suggestions.push({
        keyword: nk.keyword,
        suggestion,
        priority: nk.count >= 5 ? "high" : nk.count >= 2 ? "medium" : "low",
        count: nk.count,
      });
    }
  });

  return suggestions.sort((a, b) => b.count - a.count);
}

export function calculateReputationScore(reviews: { rating: number }[]): number {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export function getReputationLabel(score: number): { label: string; color: string } {
  if (score >= 4.5) return { label: "Excellent", color: "text-success" };
  if (score >= 4.0) return { label: "Good", color: "text-primary" };
  if (score >= 3.0) return { label: "Average", color: "text-warning" };
  if (score >= 2.0) return { label: "Needs Work", color: "text-destructive" };
  return { label: "Critical", color: "text-destructive" };
}
