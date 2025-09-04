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

type MonthlyReq = {
  goals?: string[];
  entries: Array<{ date: string; text: string; sentiment?: number; themes?: string[] }>;
};

app.post('/api/monthly-reflection', async (req, res) => {
  const { goals = [], entries = [] } = (req.body || {}) as MonthlyReq;

  const now = new Date();
  const thisMonth = entries.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  if (thisMonth.length === 0) {
    return res.json({
      source: 'fallback:no_entries',
      reflection: {
        summary: "No entries this month yet. A two-minute check-in can start a streak.",
        avg: 0,
        themes: [],
        suggestions: ["Schedule a tiny daily ritual you can keep for 2 minutes."]
      }
    });
  }

  const compact = thisMonth.slice(-40).map(e => ({
    date: e.date,
    txt: e.text.slice(0, 350),
    s: typeof e.sentiment === 'number' ? Number(e.sentiment.toFixed(3)) : 0,
    t: (e.themes || []).slice(0, 6)
  }));

  const system = `You are Reflect, a warm, non-judgmental journaling companion.
  You generate a monthly reflection that feels personal and concise.
  Respond ONLY as strict JSON matching this TypeScript type:

  type MonthlyReflection = {
    summary: string;            // 2-4 sentences referencing this month's patterns
    avg: number;                // average mood (-2..2), 2 decimals
    themes: { label: string; count: number }[]; // top recurring themes (max 6)
    suggestions: string[];      // 2-3 gentle, concrete next steps (short)
  };`;

    const goalsLine = goals.length ? `User goals: ${goals.join(', ')}.` : 'No explicit goals provided.';
    const user = `Create MonthlyReflection for the CURRENT CALENDAR MONTH only.

  ${goalsLine}

  Entries (ISO date, truncated text, numeric sentiment "s", themes "t"):
  ${JSON.stringify(compact, null, 2)}

  Rules:
  - Derive "avg" from provided sentiments (or 0 if missing) and round to 2 decimals.
  - "summary" should reference noticeable changes or patterns (e.g., walks helped, sleep impacted mood).
  - "themes" must aggregate recurring tags from "t".
  - Keep suggestions specific and doable (micro-actions).
  - Output STRICT JSON only. No markdown, no commentary.`;

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.6,
        max_tokens: 400,
        // If your model supports it, you can add: response_format: { type: "json_object" },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error('OpenAI monthly error:', text);
      // Fallback: simple local aggregation
      const avg =
        thisMonth.reduce((a, e) => a + (Number.isFinite(e.sentiment!) ? (e.sentiment as number) : 0), 0) /
        thisMonth.length || 0;
      const map: Record<string, number> = {};
      thisMonth.forEach(e => (e.themes || []).forEach(t => (map[t] = (map[t] || 0) + 1)));
      const themes = Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([label,count])=>({label, count}));
      return res.json({
        source: 'fallback:openai_error',
        reflection: {
          summary: "Here’s a light local summary based on this month’s entries.",
          avg: Number(avg.toFixed(2)),
          themes,
          suggestions: ["Note one thing that lifted your energy.", "Repeat a small habit from a good day."]
        }
      });
    }

    const data: any = await r.json();
    const raw = data?.choices?.[0]?.message?.content ?? '{}';
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error('Monthly JSON parse failed:', e, raw);
      return res.json({
        source: 'fallback:parse_error',
        reflection: {
          summary: "Couldn’t parse AI response. Here’s a simple local snapshot.",
          avg: 0,
          themes: [],
          suggestions: ["Capture one meaningful moment from today."]
        }
      });
    }
    return res.json({ source: 'openai', reflection: parsed });
  } catch (err) {
    console.error('Monthly call failed:', err);
    return res.json({
      source: 'fallback:exception',
      reflection: {
        summary: "We hit a network hiccup. Showing a basic local summary.",
        avg: 0,
        themes: [],
        suggestions: ["Try a 2-minute check-in tonight."]
      }
    });
  }
});