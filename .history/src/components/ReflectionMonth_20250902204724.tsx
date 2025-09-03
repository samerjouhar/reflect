import { Badge } from "@/components/ui/badge";
import {
ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid,
} from "recharts";
import type { JournalEntry } from "@/constants";


export function ReflectionMonth({ entries }: { entries: JournalEntry[] }) {
const now = new Date();
const month = entries.filter(e => {
const d = new Date(e.date);
return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
});
if (!month.length) return <div className="text-sm">No entries this month yet. A two-minute check-in can start a streak.</div>;


const avg = month.reduce((a,e)=>a+e.sentiment,0)/month.length;
const themes: Record<string, number> = {};
month.forEach(e => (e.themes||[]).forEach(t => themes[t]=(themes[t]||0)+1));
const top = Object.entries(themes).sort((a,b)=>b[1]-a[1]).slice(0,6);


const longText = [
`You journaled ${month.length} time${month.length>1?"s":""} this month with an average mood score of ${avg.toFixed(2)}.`,
top.length? `Common themes included ${top.map(([t])=>t).join(", ")}.` : "",
"Notice what supports your energy—consider scheduling a small daily ritual that seemed to help on good days.",
].filter(Boolean).join(" ");


return (
<div className="space-y-4">
<p className="text-sm leading-relaxed">{longText}</p>
<div className="grid sm:grid-cols-2 gap-4">
<div className="h-48">
<ResponsiveContainer width="100%" height="100%">
<LineChart data={month.map(e=>({ date: e.date.slice(5), score: e.sentiment }))}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="date" />
<YAxis domain={[-2,2]} />
<RTooltip />
<Line type="monotone" dataKey="score" strokeWidth={2} dot={false} />
</LineChart>
</ResponsiveContainer>
</div>
<div className="p-3 rounded-2xl bg-muted/60">
<div className="text-sm font-medium mb-2">Top themes</div>
<div className="flex flex-wrap gap-2">
{top.map(([t,c]) => <Badge key={t}>{t} · {c}</Badge>)}
</div>
</div>
</div>
</div>
);
}