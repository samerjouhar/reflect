import { Badge } from "./ui/badge"; // or your local Badge replacement
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid,
} from "recharts";
import type { JournalEntry } from "@/constants";
import { withinDays } from "@/lib/date";

export function ReflectionMonth({ entries }: { entries: JournalEntry[] }) {
  let windowed = entries.filter(e => withinDays(e.date, 30));

  if (windowed.length === 0) {
    const now = new Date();
    windowed = entries.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }

  if (windowed.length === 0) {
    return <div className="text-sm">No entries in the last month yet. A two-minute check-in can start a streak.</div>;
  }

  const avg =
    windowed.reduce((a, e) => a + (Number.isFinite(e.sentiment) ? e.sentiment : 0), 0) / windowed.length;

  const themes: Record<string, number> = {};
  windowed.forEach(e => (e.themes || []).forEach(t => (themes[t] = (themes[t] || 0) + 1)));
  const top = Object.entries(themes).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const longText = [
    `You journaled ${windowed.length} time${windowed.length > 1 ? "s" : ""} in the last ~30 days with an average mood score of ${avg.toFixed(2)}.`,
    top.length ? `Common themes included ${top.map(([t]) => t).join(", ")}.` : "",
    "Notice what supports your energy—consider scheduling a small daily ritual that seemed to help on good days.",
  ]
    .filter(Boolean)
    .join(" ");

  const data = windowed.map(e => ({
    date: (e.date || "").slice(5),
    score: Number.isFinite(e.sentiment) ? e.sentiment : 0,
  }));

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">{longText}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[-2, 2]} />
              <RTooltip />
              <Line type="monotone" dataKey="score" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="p-3 rounded-2xl bg-muted/60">
          <div className="text-sm font-medium mb-2">Top themes</div>
          <div className="flex flex-wrap gap-2">
            {top.map(([t, c]) => (
              <Badge key={t}>{t} · {c}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
