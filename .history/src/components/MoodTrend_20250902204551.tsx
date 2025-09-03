import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid,
    } from "recharts";
    
    
    export function MoodTrend({ data }: { data: { date: string; score: number }[] }) {
    if (!data.length) return <div className="text-sm text-muted-foreground">Your chart will appear after a few entries.</div>;
    return (
    <div className="h-56">
    <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis domain={[-2,2]} />
    <RTooltip />
    <Line type="monotone" dataKey="score" strokeWidth={2} dot={false} />
    </LineChart>
    </ResponsiveContainer>
    </div>
    );
    }