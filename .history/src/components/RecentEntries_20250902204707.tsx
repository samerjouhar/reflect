import { Badge } from "@/components/ui/badge";
import { formatNice } from "@/lib/date";
import type { JournalEntry } from "@/constants";

export function RecentEntries({ entries }: { entries: JournalEntry[] }) {
    return (
        <div className="space-y-3 max-h-80 overflow-auto pr-2">
        {[...entries].reverse().slice(0,20).map((e, idx) => (
        <div key={idx} className="p-3 rounded-2xl bg-muted/60">
        <div className="flex items-center justify-between text-sm">
        <div className="font-medium">{formatNice(e.date)}</div>
        <Badge variant={e.sentiment>=0?"secondary":"destructive"}>mood {e.sentiment.toFixed(2)}</Badge>
        </div>
        <div className="mt-2 text-sm whitespace-pre-wrap">{e.text}</div>
        <div className="mt-2 flex flex-wrap gap-2">
        {(e.themes||[]).map(t => <Badge key={t}>{t}</Badge>)}
        </div>
        </div>
        ))}
        </div>
    );
}