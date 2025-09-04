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

export type MonthlyReflection = {
    summary: string;
    avg: number;
    themes: { label: string; count: number }[];
    suggestions: string[];
  };
  
  export async function fetchMonthlyReflection(
    goals: string[],
    entries: Array<{ date: string; text: string; sentiment?: number; themes?: string[] }>
  ): Promise<MonthlyReflection> {
    const res = await fetch('/api/monthly-reflection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goals, entries }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.reflection as MonthlyReflection;
  }