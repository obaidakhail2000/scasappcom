// Keyword analysis, sentiment detection, and smart reply system (rule-based, no external AI APIs)

export const POSITIVE_KEYWORDS = [
  "food", "delicious", "tasty", "amazing", "great", "friendly",
  "good service", "nice place", "excellent", "wonderful", "perfect",
  "love", "best", "fresh", "clean", "recommend", "beautiful",
  "outstanding", "incredible", "fast service", "atmosphere",
  "رائع", "ممتاز", "لذيذ", "جميل", "نظيف", "أفضل", "طازج", "مميز",
];

export const NEGATIVE_KEYWORDS = [
  "slow", "wait", "waiting", "late", "cold food", "bad service",
  "rude", "long time", "noisy", "dirty", "expensive", "terrible",
  "worst", "horrible", "disgusting", "overpriced", "cold",
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

export type SentimentResult = "positive" | "neutral" | "negative";

export function detectSentiment(rating: number, text: string | null): SentimentResult {
  if (rating >= 4) return "positive";
  if (rating <= 2) return "negative";
  if (!text) return "neutral";
  const { positiveMatches, negativeMatches } = analyzeKeywords(text);
  if (negativeMatches.length > positiveMatches.length) return "negative";
  if (positiveMatches.length > negativeMatches.length) return "positive";
  return "neutral";
}

export function getSentimentEmoji(sentiment: SentimentResult): string {
  switch (sentiment) {
    case "positive": return "😊";
    case "neutral": return "😐";
    case "negative": return "😞";
  }
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

// Smart AI Reply Generator — context-aware based on review content and sentiment
export function generateSmartReply(rating: number, text: string): string {
  const { positiveMatches, negativeMatches } = analyzeKeywords(text);

  if (rating >= 4) {
    // Build personalized positive reply
    const praises: string[] = [];
    if (positiveMatches.includes("food") || positiveMatches.includes("delicious") || positiveMatches.includes("tasty")) {
      praises.push("our food quality");
    }
    if (positiveMatches.includes("friendly") || positiveMatches.includes("good service")) {
      praises.push("our team's service");
    }
    if (positiveMatches.includes("clean") || positiveMatches.includes("beautiful") || positiveMatches.includes("nice place")) {
      praises.push("our restaurant atmosphere");
    }
    if (positiveMatches.includes("fast service")) {
      praises.push("our quick service");
    }
    if (positiveMatches.includes("fresh")) {
      praises.push("the freshness of our ingredients");
    }
    if (praises.length > 0) {
      return `Thank you for your wonderful feedback! We're delighted to hear you enjoyed ${praises.join(" and ")}. We look forward to welcoming you back soon! 🌟`;
    }
    if (rating === 5) {
      return "Thank you so much for the amazing 5-star review! Your kind words mean the world to our team. We can't wait to serve you again! ⭐";
    }
    return "Thank you for your great feedback! We're glad you had a positive experience and hope to see you again soon. 😊";
  }

  if (rating === 3) {
    if (negativeMatches.length > 0) {
      const issues = negativeMatches.slice(0, 2).join(" and ");
      return `Thank you for your honest feedback. We appreciate you mentioning the ${issues} issue. We are actively working on improvements and hope to provide you a much better experience next time.`;
    }
    return "Thank you for visiting us! We appreciate your feedback and are always striving to improve. We hope your next visit will be even better. 🙏";
  }

  // Negative review (1-2 stars)
  const complaints: string[] = [];
  if (negativeMatches.includes("slow") || negativeMatches.includes("wait") || negativeMatches.includes("waiting") || negativeMatches.includes("long time")) {
    complaints.push("the wait time");
  }
  if (negativeMatches.includes("cold") || negativeMatches.includes("cold food")) {
    complaints.push("the food temperature");
  }
  if (negativeMatches.includes("rude") || negativeMatches.includes("bad service")) {
    complaints.push("the service quality");
  }
  if (negativeMatches.includes("dirty")) {
    complaints.push("the cleanliness");
  }
  if (negativeMatches.includes("noisy")) {
    complaints.push("the noise level");
  }
  if (negativeMatches.includes("expensive") || negativeMatches.includes("overpriced")) {
    complaints.push("our pricing");
  }

  if (complaints.length > 0) {
    return `We sincerely apologize for your experience. We understand your concerns about ${complaints.join(" and ")}, and we are taking immediate steps to address this. Your feedback helps us improve, and we hope to make it right on your next visit. 🙏`;
  }

  return "We're truly sorry about your experience. Your feedback is extremely important to us, and we are committed to making improvements. We hope to have the chance to serve you better in the future. 🙏";
}

export function generateImprovementSuggestions(negativeKeywords: { keyword: string; count: number }[]) {
  const suggestions: { keyword: string; suggestion: string; priority: "high" | "medium" | "low"; count: number }[] = [];

  const suggestionMap: Record<string, string> = {
    slow: "Consider optimizing service speed and staffing during peak hours",
    wait: "Reduce customer wait times by improving table management",
    waiting: "Reduce customer wait times by improving table management",
    late: "Improve order preparation and delivery timing",
    "cold food": "Ensure food is served hot — review kitchen-to-table timing",
    cold: "Ensure food temperature is maintained from kitchen to table",
    "bad service": "Invest in staff training for better customer service",
    rude: "Focus on staff friendliness and customer interaction training",
    "long time": "Streamline operations to reduce overall service time",
    noisy: "Consider acoustic improvements or noise management",
    dirty: "Increase cleaning frequency and hygiene standards",
    expensive: "Review pricing strategy and perceived value",
    overpriced: "Review pricing strategy — consider value meals or promotions",
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

// Generate improvement plans based on review analysis
export function generateImprovementPlans(
  positiveKeywords: { keyword: string; count: number }[],
  negativeKeywords: { keyword: string; count: number }[]
) {
  const plans: { title: string; description: string; type: "fix" | "promote"; priority: "high" | "medium" | "low"; basedOn: string }[] = [];

  // Fix plans from negative keywords
  const fixMap: Record<string, { title: string; description: string }> = {
    slow: { title: "Speed Up Service", description: "Increase staff during peak hours and optimize kitchen workflow to reduce service time." },
    wait: { title: "Reduce Wait Times", description: "Implement a reservation system and improve table turnover management." },
    waiting: { title: "Reduce Wait Times", description: "Implement a reservation system and improve table turnover management." },
    cold: { title: "Improve Food Temperature", description: "Review kitchen-to-table timing and invest in heat-retaining serving equipment." },
    "cold food": { title: "Serve Food Hot", description: "Ensure all dishes are served at optimal temperature by improving kitchen coordination." },
    rude: { title: "Staff Training Program", description: "Conduct hospitality training sessions focused on customer interaction and conflict resolution." },
    "bad service": { title: "Service Quality Upgrade", description: "Implement a service quality checklist and regular staff performance reviews." },
    dirty: { title: "Cleanliness Standards", description: "Increase cleaning frequency, implement hygiene checklists, and assign dedicated cleaning staff." },
    noisy: { title: "Noise Management", description: "Consider acoustic panels, background music adjustments, and table spacing improvements." },
    expensive: { title: "Price-Value Review", description: "Introduce value meals, combo offers, or adjust menu pricing to match customer expectations." },
    overpriced: { title: "Pricing Strategy", description: "Review pricing against competitors and introduce affordable menu options." },
    "long time": { title: "Operational Efficiency", description: "Streamline kitchen operations and implement order tracking to reduce delays." },
  };

  negativeKeywords.forEach((nk) => {
    const plan = fixMap[nk.keyword];
    if (plan) {
      plans.push({
        ...plan,
        type: "fix",
        priority: nk.count >= 5 ? "high" : nk.count >= 2 ? "medium" : "low",
        basedOn: `${nk.count} mentions of "${nk.keyword}"`,
      });
    }
  });

  // Promote plans from positive keywords
  const promoteMap: Record<string, { title: string; description: string }> = {
    food: { title: "Promote Food Quality", description: "Highlight your food quality in marketing materials and social media campaigns." },
    delicious: { title: "Feature Popular Dishes", description: "Create a 'Customer Favorites' section and promote your most-praised dishes." },
    friendly: { title: "Highlight Service Excellence", description: "Share customer testimonials about your friendly staff in marketing." },
    clean: { title: "Promote Hygiene Standards", description: "Showcase your cleanliness standards in marketing to attract health-conscious customers." },
    fresh: { title: "Emphasize Fresh Ingredients", description: "Market your fresh ingredient sourcing and farm-to-table approach." },
    "fast service": { title: "Advertise Quick Service", description: "Promote your fast service for lunch crowds and busy professionals." },
    atmosphere: { title: "Promote Ambiance", description: "Use your great atmosphere as a key marketing differentiator." },
  };

  positiveKeywords.slice(0, 4).forEach((pk) => {
    const plan = promoteMap[pk.keyword];
    if (plan) {
      plans.push({
        ...plan,
        type: "promote",
        priority: pk.count >= 10 ? "high" : pk.count >= 5 ? "medium" : "low",
        basedOn: `${pk.count} positive mentions of "${pk.keyword}"`,
      });
    }
  });

  return plans;
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
