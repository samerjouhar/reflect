import { Badge } from "@/components/ui/badge";

export function WeeklyInsight({ summary, highlights }: { summary: string; highlights: string[] }) {
    return (
    <div>
    <p className="text-sm leading-relaxed">{summary}</p>
    {highlights?.length ? (
    <div className="mt-3 flex flex-wrap gap-2">
    {highlights.map(h => <Badge key={h} variant="secondary">{h}</Badge>)}
    </div>
    ) : null}
    </div>
    );
}