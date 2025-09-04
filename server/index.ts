import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import { ChromaClient, Collection } from "chromadb";

import { OpenAIEmbeddingFunction } from '@chroma-core/openai';

const app = express();
app.use(express.json());

const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const OPENAI_EMBED_MODEL = process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const PORT = Number(process.env.PORT || 8787);

const chroma = new ChromaClient({ path: CHROMA_URL });

const embedder = new OpenAIEmbeddingFunction({
  apiKey: OPENAI_API_KEY,
  modelName: OPENAI_EMBED_MODEL
});

async function getCollection(): Promise<Collection> {
  return chroma.getOrCreateCollection({
    name: "reflect-journal",
    embeddingFunction: embedder,
  });
}

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    chroma: CHROMA_URL,
    model: MODEL,
    keySet: !!OPENAI_API_KEY,
  });
});

type PromptReq = {
  goals: string[];
  recentEntries: Array<{ date: string; text: string; sentiment?: number; themes?: string[] }>;
};

type MyMeta = {
  date?: string;
  sentiment?: number;
  themes_json?: string;
};

function fallbackPrompt(goals: string[], recentEntries: PromptReq['recentEntries']) {
  const goalLine = goals.length ? ` around ${goals.slice(0, 3).join(', ')}` : '';
  const last = recentEntries[recentEntries.length - 1]?.text || '';
  if (last) {
    return `What felt most meaningful about that experience, and what small action could you repeat${goalLine} tomorrow?`;
  }
  return `What's one small win today, and what made it possible${goalLine}?`;
}

function parseThemesJSON(s?: string): string[] {
  if (!s) return [];
  try {
    const parsed = JSON.parse(s);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

app.post('/api/generate-prompt-rag', async (req, res) => {
  const { goals = [] } = (req.body || {}) as { goals?: string[] };

  try {
    const col = await getCollection();

    const today = new Date().toISOString().slice(0, 10);
    const query = `Personalize a journaling question for ${today}. Goals: ${goals.join(', ') || 'none'}.
Highlight patterns, not just today. Ask one short question.`;

    const fortyFiveDaysAgo = Date.now() - 45 * 864e5;

    const results = await col.query({
      queryTexts: [query],
      nResults: 8,
      where: { date_ts: { $gte: fortyFiveDaysAgo } },
    });

    const docs = (results.documents?.[0] || [])
      .filter((d): d is string => d !== null)
      .map((d) => d.slice(0, 300)); 

    const rawMetas = (results.metadatas?.[0] || []) as (unknown | null)[];
    const metas: MyMeta[] = rawMetas.filter(
      (m: any): m is MyMeta => m !== null && typeof m?.date === 'string'
    );

    const n = Math.min(docs.length, metas.length);
    const context = Array.from({ length: n })
      .map((_, i) => {
        const d = docs[i];
        const m = metas[i];
        const themes = parseThemesJSON(m.themes_json).slice(0, 4).join(', ');
        return `• ${m.date || 'unknown'}: ${d}${themes ? ` (themes: ${themes})` : ''}`;
      })
      .join('\n');

    const system = `You are Reflect, a warm journaling companion.
Generate ONE concise, open-ended journaling question (<200 chars).
Do not give advice or instructions. Avoid prescriptive prompts.
Do not be overly wordy/complex sentences. You do not want to overwhelm
the user with overbearing questions at any cost.
Encourage gentle self-reflection. Ground in context and goals if available.
Return only the question.`;

    const user = `Use the retrieved journal memories below to craft today's question.

Goals: ${goals.join(', ') || 'none'}

Context:
${context || 'No retrieved memories.'}

Return ONLY the question.`;

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.8,
        max_tokens: 120,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error('RAG prompt OpenAI error:', text);
      return res.json({
        prompt:
          'What small habit helped most recently, and can you repeat it today?',
        retrieved: n,
        source: 'fallback:openai_error',
      });
    }

    const data: any = await r.json();
    const prompt =
      data?.choices?.[0]?.message?.content?.trim() ||
      'What felt most like you today, and why?';

    res.json({ prompt, retrieved: n, source: 'openai' });
  } catch (e: any) {
    console.error('generate-prompt-rag error', e);
    res.json({
      prompt: 'Name one moment that shifted your mood today—what made it matter?',
      retrieved: 0,
      source: 'fallback:exception',
    });
  }
});

app.post('/api/index-entry', async (req, res) => {
  try {
    const { id, date, text, sentiment, themes } = req.body as {
      id: string;
      date: string;
      text: string;
      sentiment?: number;
      themes?: string[];
    };

    if (!id || !text || !date) return res.status(400).json({ error: 'missing fields' });

    const col = await getCollection();

    await col.upsert({
      ids: [id],
      documents: [text],
      metadatas: [
        {
          date,                               
          date_ts: new Date(date).getTime(),  
          sentiment: sentiment ?? 0,
          themes_json: JSON.stringify(themes ?? []),
        },
      ],
    });

    res.json({ ok: true });
  } catch (e: any) {
    console.error('index-entry error', e);
    res.status(500).json({ error: 'index_failed' });
  }
});

app.post('/api/monthly-reflection-rag', async (req, res) => {
  const { goals = [] } = (req.body || {}) as { goals?: string[] };

  try {
    const now = new Date();
    const monthISO = now.toISOString().slice(0, 7);
    const startTs = new Date(`${monthISO}-01T00:00:00Z`).getTime();
    const endTs = new Date(`${monthISO}-31T23:59:59Z`).getTime();
    const col: Collection = await getCollection();

    const results = await col.query({
      queryTexts: [`Summarize patterns for ${monthISO}. Goals: ${goals.join(', ') || 'none'}.`],
      nResults: 50,
      where: {
        $and: [
          { date_ts: { $gte: startTs } },
          { date_ts: { $lte: endTs } },
        ],
      },      
    });

    const docs = (results.documents?.[0] || [])
      .filter((d): d is string => d !== null)
      .map((d) => d.slice(0, 350));

    const rawMetas = (results.metadatas?.[0] || []) as (unknown | null)[];
    const metas: MyMeta[] = rawMetas.filter(
      (m: any): m is MyMeta => m !== null && typeof m?.date === 'string'
    );

    if (!docs.length || !metas.length) {
      return res.json({
        reflection: {
          summary: 'No entries this month yet. A two-minute check-in can start a streak.',
          avg: 0,
          themes: [],
          suggestions: ['Schedule a tiny daily ritual you can keep for 2 minutes.'],
        },
        source: 'fallback:no_entries',
      });
    }

    const n = Math.min(docs.length, metas.length);
    const compact = Array.from({ length: n }).map((_, i) => {
      const txt = docs[i];
      const m = metas[i];
      const s =
        typeof m.sentiment === 'number' ? Number(m.sentiment.toFixed(3)) : 0;
      const t = parseThemesJSON(m.themes_json).slice(0, 6);
      return { date: m.date, txt, s, t };
    });

    const system = `You are Reflect, a warm journaling companion.
Respond ONLY as strict JSON matching this type:
{
  "summary": string,
  "avg": number,
  "themes": [{"label": string, "count": number}],
  "suggestions": string[]
}. Also, never mention the year.`;

    const user = `Create a monthly reflection for ${monthISO} based on the entries below.
- Reference noticeable patterns or changes.
- Derive "avg" from numeric "s" and round to 2 decimals.
- Aggregate "themes" from "t" (max 6).
- Give 2–3 concrete, gentle suggestions.

Entries:
${JSON.stringify(compact, null, 2)}

Return ONLY JSON.`;

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.6,
        max_tokens: 400,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error('RAG monthly OpenAI error:', text);
      return res.json({
        reflection: {
          summary: 'Here’s a light local summary based on this month’s entries.',
          avg: 0,
          themes: [],
          suggestions: ['Note one thing that lifted your energy.', 'Repeat a small habit from a good day.'],
        },
        source: 'fallback:openai_error',
      });
    }

    const data: any = await r.json();
    const raw = data?.choices?.[0]?.message?.content ?? '{}';

    let parsed: {
      summary: string;
      avg: number;
      themes: { label: string; count: number }[];
      suggestions: string[];
    };

    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error('Monthly JSON parse failed:', e, raw);
      return res.json({
        reflection: {
          summary: "Couldn't parse AI response. Here’s a simple local snapshot.",
          avg: 0,
          themes: [],
          suggestions: ['Capture one meaningful moment from today.'],
        },
        source: 'fallback:parse_error',
      });
    }

    parsed.avg = Number.isFinite(parsed.avg) ? Number(parsed.avg.toFixed(2)) : 0;

    res.json({ reflection: parsed, source: 'openai' });
  } catch (e: any) {
    console.error('monthly-reflection-rag error', e);
    res.json({
      reflection: {
        summary: 'We hit a hiccup. Showing a basic local summary.',
        avg: 0,
        themes: [],
        suggestions: ['Try a 2-minute check-in tonight.'],
      },
      source: 'fallback:exception',
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI prompt server (RAG) running on http://localhost:${PORT}`);
  console.log('Chroma:', CHROMA_URL, '| Model:', MODEL, '| Key set:', !!OPENAI_API_KEY);
});
