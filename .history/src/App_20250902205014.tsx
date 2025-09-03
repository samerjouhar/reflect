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
}