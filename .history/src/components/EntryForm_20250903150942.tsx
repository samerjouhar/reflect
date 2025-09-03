import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QUICK_TAGS } from "@/constants";

type Props = {
  onSave: (text: string, tags: string[]) => void;
  resetSignal?: number;
};

export function EntryForm({ onSave, resetSignal = 0 }: Props) {
  const [draft, setDraft] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    setDraft("");
    setTags([]);
  }, [resetSignal]);

  function toggle(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Quick feelings (optional)</div>
        <div className="flex flex-wrap gap-2">
          {QUICK_TAGS.map((tag) => {
            const selected = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                aria-pressed={selected}
                className={[
                  "px-3 py-1.5 rounded-full text-sm transition",
                  "border",
                  selected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-foreground hover:bg-muted/70 border-border"
                ].join(" ")}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <Textarea
        rows={7}
        placeholder="Write freely. This is just for you."
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />

      <div className="flex items-center justify-end">
        <Button
          onClick={() => onSave(draft, tags)}
          disabled={draft.trim().length === 0}
        >
          Save entry
        </Button>
      </div>
    </div>
  );
}
