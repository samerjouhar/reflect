import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

type PromptReq = {
  goals: string[];
  recentEntries: Array<{ date: string; text: string; sentiment?: number; themes?: string[] }>;
};

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function fallbackPrompt(goals: string[], recentEntries: PromptReq['recentEntries']) {
  const goalLine = goals.length ? ` around ${goals.slice(0, 3).join(', ')}` : '';
  const last = recentEntries[recentEntries.length - 1]?.text || '';
  if (last) {
    return `What felt most meaningful about that experience, and what small action could you repeat${goalLine} tomorrow?`;
  }
  return `What's one small win today, and what made it possible${goalLine}?`;
}

app.post('/api/generate-prompt', async (req, res) => {
  const { goals = [], recentEntries = [] } = (req.body || {}) as PromptReq;

  if (!OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY');
    return res.json({ prompt: fallbackPrompt(goals, recentEntries), source: 'fallback:missing_key' });
  }

  const system = `You are Reflect, a private journaling companion. 
You help users grow by asking **one thoughtful, concise question** each day.

Your behavior:
- **Often, but not always, reference the user's unique past entries or themes** to make the question feel personal.
- Recognize **patterns or changes over time**, not just today's entry.
- Encourage self-reflection, not generic motivation.
- Never repeat exact questions.
- Don't repeat similar lines of advice too often, such as don't simply suggest better sleep multiple responses in a row.
- Never output advice, lists, or prefaces — only one clear question.
- Keep your question under 200 characters.
- Be warm, curious, and supportive, never clinical or judgmental.`;

const goalsLine = goals.length
  ? `User's stated goals: ${goals.join(', ')}.`
  : `No explicit goals provided.`;

const recent = recentEntries
  .slice(-7)
  .map((e, i) => {
    const t = (e.themes || []).slice(0, 4).join(', ');
    return `${i + 1}. ${e.date}: ${e.text.slice(0, 180)}${t ? ` (themes: ${t})` : ''}`;
  })
  .join('\n');

const user = `Generate ONE journaling question for today that builds on this ongoing context.

${goalsLine}

Recent journal history (most recent last):
${recent || 'No previous entries.'}

Your question should:
- Show awareness of past patterns or themes.
- Invite reflection on progress, setbacks, or recurring feelings.
- Avoid repeating wording from earlier questions.
- If a user shows reluctance to speak about prior issues, do not press the topic.

Return ONLY the question — no greetings, no emojis, no extra text.`;


  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.7,
        max_tokens: 120,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error('OpenAI error:', text);
      return res.json({ prompt: fallbackPrompt(goals, recentEntries), source: 'fallback:openai_error' });
    }

    const data: any = await r.json();
    const prompt =
      data?.choices?.[0]?.message?.content?.trim() ||
      fallbackPrompt(goals, recentEntries);

    return res.json({ prompt, source: 'openai' });
  } catch (err: any) {
    console.error('OpenAI call failed:', err);
    return res.json({ prompt: fallbackPrompt(goals, recentEntries), source: 'fallback:exception' });
  }
});

const PORT = Number(process.env.PORT || 8787);
app.listen(PORT, () => {
  console.log(`AI prompt server running on http://localhost:${PORT}`);
  console.log('Model:', MODEL, 'Key set:', !!OPENAI_API_KEY);
});
