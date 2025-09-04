export async function fetchAiPrompt(goals: string[], recentEntries: any[]) {
    const res = await fetch('/api/generate-prompt', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goals, recentEntries }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return (data.prompt as string).trim();
}
  