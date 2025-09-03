export function PromptChip({ text, onClick }: { text: string; onClick?: (t: string) => void }) {
    return (
        <button onClick={()=>onClick?.(text)} className="text-left bg-muted hover:bg-muted/70 transition rounded-2xl px-3 py-2">
        {text}
        </button>
    );
}