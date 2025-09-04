import { useEffect, useMemo, useState } from "react";
import { Badge } from "./ui/badge";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid,
} from "recharts";
import type { JournalEntry } from "@/constants";
import { fetchMonthlyReflection, type MonthlyReflection } from "@/lib/ai";

const round2 = (n: number) => Number.isFinite(n) ? parseFloat(n.toFixed(2)) : 0;

export function ReflectionMonth({ entries, goals = [] as string[] }: { entries: JournalEntry[]; goals?: string[] }) {
  const now = new Date();

  // Filter to current calendar month on the client (UI stays snappy)
  const monthEntries = useMemo(
    () =>
      entries.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }),
    [entries]
  );

  // Chart data (local) with rounding
  const data = useMemo(
    () =>
      monthEntries.map(e => ({
        date: (e.date || "").slice(5),
        score: round2(Number.isFinite(e.sentiment) ? (e.sentiment as number) : 0),
      })),
    [monthEntries]
  );

  const [loading, setLoading] = useState(false);
  const [reflex, setReflex] = useState<MonthlyReflection | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchMonthlyReflection(goals, monthEntries)
      .then(setReflex)
      .catch((e) => setError(e?.message || "Failed to load monthly reflection."))
      .finally(() => setLoading(false));
  }, [goals, monthEntries]);

  if (!monthEntries.length) {
    return <div className="text-sm">No entries in the current month yet. A two-minute check-in can start a streak.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary / loading / error */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
          Generating your monthly reflection…
        </div>
      ) : error ? (
        <div className="text-sm text-destructive"> {error} </div>
      ) : reflex ? (
        <p className="text-sm leading-relaxed">
          {reflex.summary} Average mood: <span className="font-medium">{round2(reflex.avg).toFixed(2)}</span>.
        </p>
      ) : null}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[-2, 2]} tickFormatter={(v) => round2(v).toFixed(2)} />
              <RTooltip formatter={(v: number) => round2(v).toFixed(2)} />
              <Line type="monotone" dataKey="score" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3 rounded-2xl bg-muted/60">
          <div className="text-sm font-medium mb-2">Top themes</div>
          <div className="flex flex-wrap gap-2">
            {(reflex?.themes || [])
              .slice(0, 6)
              .map((t) => (
                <Badge key={t.label}>{t.label} · {t.count}</Badge>
              ))}
          </div>

          {reflex?.suggestions?.length ? (
            <div className="mt-3 text-sm">
              <div className="font-medium mb-1">Gentle next steps</div>
              <ul className="list-disc pl-5 space-y-1">
                {reflex.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
