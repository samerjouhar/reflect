import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Lock, Calendar, Brain, TrendingUp, Sparkles } from "lucide-react";

import { Header } from "@/components/Header";
import { PromptChip } from "@/components/PromptChip";
import { EntryForm } from "@/components/EntryForm";
import { MoodTrend } from "@/components/MoodTrend";
import { WeeklyInsight } from "@/components/WeeklyInsight";
import { RecentEntries } from "@/components/RecentEntries";
import { ReflectionMonth } from "@/components/ReflectionMonth";

import { PREFS_KEY } from "@/constants";
import type { JournalEntry } from "@/constants";
import { useEncryptedStore } from "@/hooks/useEncryptedStore";
import { analyzeSentiment, extractThemes, generatePrompt, summarizeWeek } from "@/lib/nlp";
import { todayISO } from "@/lib/date";

export default function App() {
  const [passphrase, setPassphrase] = useState("");
  const [locked, setLocked] = useState(true);
  const [goals, setGoals] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(PREFS_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const { entries, setEntries, persist } = useEncryptedStore(locked ? null : passphrase);

  const latest = entries.length ? entries[entries.length - 1] : undefined;
  const prompt = useMemo(
    () =>
      generatePrompt(
        latest && { sentiment: latest.sentiment, themes: latest.themes, text: latest.text },
        goals
      ),
    [latest, goals]
  );

  const trendData = useMemo(
    () => entries.map((e) => ({ date: e.date.slice(5), score: e.sentiment })),
    [entries]
  );
  const weekly = useMemo(() => summarizeWeek(entries), [entries]);
  const [resetCounter, setResetCounter] = useState(0);

  function addEntry(text: string, tagOverrides: string[]) {
    const date = todayISO();
    const score = analyzeSentiment(text);
    const themes = Array.from(new Set([...extractThemes(text), ...tagOverrides]));
    const next: JournalEntry[] = [...entries, { date, text, sentiment: score, themes }];
    setEntries(next);
    persist(next);
    setResetCounter((n) => n + 1);
  }

  function seedDemo() {
    const sample = [
      {
        date: todayISO(new Date(Date.now() - 6 * 864e5)),
        text: "Felt stressed about work deadlines. Short walk helped a little.",
        tags: ["stressed", "walk"],
      },
      {
        date: todayISO(new Date(Date.now() - 5 * 864e5)),
        text: "Morning walk and coffee boosted energy. Focused block gave me momentum.",
        tags: ["energized", "focus"],
      },
      {
        date: todayISO(new Date(Date.now() - 4 * 864e5)),
        text: "Poor sleep last night. Felt anxious in the afternoon.",
        tags: ["sleep", "anxious"],
      },
      {
        date: todayISO(new Date(Date.now() - 3 * 864e5)),
        text: "Worked out at the gym. Creativity flowed on my side project.",
        tags: ["exercise", "creative"],
      },
      {
        date: todayISO(new Date(Date.now() - 2 * 864e5)),
        text: "Family dinner was grounding and warm.",
        tags: ["family", "grateful"],
      },
      {
        date: todayISO(new Date(Date.now() - 1 * 864e5)),
        text: "Deep work session, minimal distractions.",
        tags: ["focus"],
      },
    ];
    const seeded: JournalEntry[] = sample.map((s) => {
      const score = analyzeSentiment(s.text);
      const themes = Array.from(new Set([...extractThemes(s.text), ...(s.tags || [])]));
      return { date: s.date, text: s.text, sentiment: score, themes };
    });
    const next = [...entries.filter((e) => e.date < seeded[0].date), ...seeded];
    setEntries(next);
    persist(next);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "journal-entries.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function saveGoals(str: string) {
    const arr = str.split(",").map((s) => s.trim()).filter(Boolean);
    setGoals(arr);
    localStorage.setItem(PREFS_KEY, JSON.stringify(arr));
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <Header locked={locked} onLockToggle={() => setLocked((v) => !v)} />

      {locked ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" /> Your journal is locked
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>Enter your passphrase to decrypt local entries. This never leaves your device.</p>
            <Input
              type="password"
              placeholder="Passphrase (min 6 chars)"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <Button onClick={() => setLocked(false)} disabled={passphrase.length < 6}>
                Unlock
              </Button>
              <Button variant="secondary" onClick={seedDemo}>
                Seed demo data
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: set a memorable phrase; there’s no cloud recovery in this MVP.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs defaultValue="write" className="mb-6">
            <TabsList>
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="reflect">Reflect</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="write" className="mt-4">
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" /> Today’s gentle prompt
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      <PromptChip text={prompt} />
                      <div className="text-xs text-muted-foreground">Not feeling it? Try one of these:</div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {[
                          "What’s one small win today?",
                          "What would future you thank you for?",
                          "Which moment felt most like you?",
                          "What drained you—and what refilled you?",
                        ].map((t, i) => (
                          <PromptChip key={i} text={t} />
                        ))}
                      </div>
                    </div>

                    <EntryForm onSave={(text, tags) => addEntry(text, tags)} resetSignal={resetCounter} />


                    <div className="mt-4 grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" /> Mood trend
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <MoodTrend data={trendData} />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Brain className="w-5 h-5" /> Weekly insight
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <WeeklyInsight summary={weekly.summary} highlights={weekly.highlights} />
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" /> Recent entries
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <RecentEntries entries={entries} />
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="reflect" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly reflection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Here’s a gentle summary for the last month based on your entries.
                  </p>
                  <ReflectionMonth entries={entries} />
                  <div className="text-xs text-muted-foreground">
                    These insights are generated locally using simple heuristics and a lexicon sentiment model.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences & privacy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium mb-1">Your goals (comma-separated)</div>
                    <Input
                      placeholder="e.g., better sleep, reduce work stress"
                      defaultValue={goals.join(", ")}
                      onBlur={(e) => saveGoals(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={exportJson}>
                      <Download className="w-4 h-4 mr-2" />
                      Export JSON
                    </Button>
                    <Button variant="secondary" onClick={seedDemo}>
                      Load demo data
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    AES-encrypted at rest with your passphrase. No cloud, no tracking. This is not medical advice.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      <footer className="mt-8 mb-4 text-center text-xs text-muted-foreground">
        Built with ❤️ for privacy-first reflection — all analysis on-device.
      </footer>
    </div>
  );
}
