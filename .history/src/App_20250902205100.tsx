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
const [goals, setGoals] = useState<string[]>(()=>{
try { return JSON.parse(localStorage.getItem(PREFS_KEY)||"[]"); } catch { return []; }
});


const { entries, setEntries, persist } = useEncryptedStore(locked ? null : passphrase);


const latest = entries.length ? entries[entries.length-1] : undefined;
const prompt = useMemo(()=>generatePrompt(latest && { sentiment: latest.sentiment, themes: latest.themes, text: latest.text }, goals), [latest, goals]);


const trendData = useMemo(()=> entries.map(e => ({ date: e.date.slice(5), score: e.sentiment })), [entries]);
const weekly = useMemo(()=> summarizeWeek(entries), [entries]);
const date = todayISO();
const score = analyzeSentiment(text);
const themes = Array.from(new Set([...extractThemes(text), ...tagOverrides]));
const next: JournalEntry[] = [...entries, { date, text, sentiment: score, themes }];
setEntries(next);
persist(next);
}


function seedDemo() {
const sample = [
{ date: todayISO(new Date(Date.now()-6*864e5)), text: "Felt stressed about work deadlines. Short walk helped a little.", tags:["stressed","walk" ] },
{ date: todayISO(new Date(Date.now()-5*864e5)), text: "Morning walk and coffee boosted energy. Focused block gave me momentum.", tags:["energized","focus"] },
{ date: todayISO(new Date(Date.now()-4*864e5)), text: "Poor sleep last night. Felt anxious in the afternoon.", tags:["sleep","anxious"] },
{ date: todayISO(new Date(Date.now()-3*864e5)), text: "Worked out at the gym. Creativity flowed on my side project.", tags:["exercise","creative"] },
{ date: todayISO(new Date(Date.now()-2*864e5)), text: "Family dinner was grounding and warm.", tags:["family","grateful"] },
{ date: todayISO(new Date(Date.now()-1*864e5)), text: "Deep work session, minimal distractions.", tags:["focus"] },
];
const seeded: JournalEntry[] = sample.map(s=>{
const score = analyzeSentiment(s.text);
const themes = Array.from(new Set([...extractThemes(s.text), ...(s.tags||[])]));
return { date: s.date, text: s.text, sentiment: score, themes };
});
const next = [...entries.filter(e => e.date < seeded[0].date), ...seeded];
setEntries(next); persist(next);
}


function exportJson() {
const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url; a.download = "journal-entries.json"; a.click();
URL.revokeObjectURL(url);
}


function saveGoals(str: string) {
const arr = str.split(",").map(s=>s.trim()).filter(Boolean);
setGoals(arr);
localStorage.setItem(PREFS_KEY, JSON.stringify(arr));
}