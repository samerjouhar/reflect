import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid,
  } from "recharts";
  
  type Point = { date: string; score: number };
  
  const round2 = (n: number) => Number.isFinite(n) ? parseFloat(n.toFixed(2)) : 0;
  
  export function MoodTrend({ data }: { data: Point[] }) {
    if (!data.length) {
      return <div className="text-sm text-muted-foreground">Your chart will appear after a few entries.</div>;
    }
  
    // Round only for display
    const rounded = data.map(d => ({ ...d, score: round2(d.score) }));
  
    return (
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rounded} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[-2, 2]} tickFormatter={(v) => round2(v).toFixed(2)} />
            <RTooltip formatter={(value: number) => round2(value).toFixed(2)} />
            <Line type="monotone" dataKey="score" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  