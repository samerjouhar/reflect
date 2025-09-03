import Sentiment from "sentiment";
import { DEFAULT_THEMES } from "@/constants";
const sentiment = new Sentiment();


export function analyzeSentiment(text: string): number {
return sentiment.analyze(text).comparative; // ~[-5..5]/len
}


export function extractThemes(text: string): string[] {
const lower = text.toLowerCase();
const hits = new Set<string>();
DEFAULT_THEMES.forEach(t => { if (lower.includes(t)) hits.add(t); });
["walk","run","gym","yoga","meditation","coffee","sunlight","music","deep work"].forEach(t => {
if (lower.includes(t)) hits.add(t);
});
return Array.from(hits);
}


export function generatePrompt(recentEntry?: { sentiment: number; themes: string[]; text: string }, goals?: string[]): string {
const goal = goals && goals.length ? goals[0] : undefined;
if (!recentEntry && goal) return `Quick check-in toward your goal: ${goal}. What small step did you take today?`;
if (!recentEntry) return "What felt small but meaningful today?";


const { sentiment: s, themes = [], text = "" } = recentEntry;
const lower = text.toLowerCase();
if (lower.includes("stress") || themes.includes("anxiety")) return "You mentioned stress recently. What helped you find even a hint of calm today?";
if (s <= -0.5) return "Yesterday seemed heavy. What is one thing within your control today?";
if (themes.includes("exercise") || lower.includes("walk")) return "How did moving your body affect your energy today?";
if (themes.includes("sleep")) return "How rested did you feel this morning? Did anything help your sleep?";
if (goal) return `Progress toward ${goal}: what tiny win did you have today?`;
return "What gave you a spark of joy or relief today?";
}


export function summarizeWeek(entries: { date: string; sentiment: number; themes?: string[] }[]) {
const week = entries.filter(e => withinDays(e.date, 7));
if (!week.length) return { summary: "No entries in the last week yet. A little goes a long way—try a short check-in today!", highlights: [] as string[] };


const avg = week.reduce((a, e) => a + e.sentiment, 0) / week.length;
const themeCounts: Record<string, number> = {};
week.forEach(e => (e.themes||[]).forEach(t => themeCounts[t] = (themeCounts[t]||0)+1));
const topThemes = Object.entries(themeCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);


const positive = week.filter(e => e.sentiment >= 0.5);
const activityHits: Record<string, number> = {};
positive.forEach(e => (e.themes||[]).forEach(t => activityHits[t] = (activityHits[t]||0)+1));
const positiveSignals = Object.entries(activityHits).sort((a,b)=>b[1]-a[1]).slice(0,3);


const summary = [
`You wrote ${week.length} time${week.length>1?"s":""} this week with an average mood score of ${avg.toFixed(2)}.`,
topThemes.length ? `Recurring themes: ${topThemes.map(([t,c])=>`${t} (${c})`).join(", ")}.` : "",
positiveSignals.length ? `You tended to feel better on days with: ${positiveSignals.map(([t])=>t).join(", ")}.` : "",
].filter(Boolean).join(" ");


return { summary, highlights: topThemes.map(([t])=>t) };
}