import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QUICK_TAGS } from "@/constants";

export function EntryForm({ onSave }: { onSave: (text: string, tags: string[]) => void }) {
    const [draft, setDraft] = useState("");
    const [tags, setTags] = useState<string[]>([]);


    function toggle(tag: string) {
        setTags(t => t.includes(tag) ? t.filter(x=>x!==tag) : [...t, tag]);
    }

    return (
        <div className="space-y-4">
        <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Quick feelings (optional)</div>
        <div className="flex flex-wrap gap-2">
        {QUICK_TAGS.map(tag => (
        <Badge key={tag} onClick={()=>toggle(tag)} className={`cursor-pointer ${tags.includes(tag)?"ring-2 ring-primary":""}`}>{tag}</Badge>
    ))}
    </div>
    </div>

    <Textarea rows={7} placeholder="Write freely. This is just for you." value={draft} onChange={e=>setDraft(e.target.value)} />
    <div className="flex items-center justify-end">
    <Button onClick={()=> onSave(draft, tags)} disabled={draft.trim().length===0}>Save entry</Button>
    </div>
    </div>
    );
}