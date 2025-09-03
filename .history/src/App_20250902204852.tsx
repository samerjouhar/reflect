import React, { useMemo, useState } from "react";


<EntryForm onSave={(text, tags)=> addEntry(text, tags)} />


<div className="mt-4 grid md:grid-cols-2 gap-4">
<Card>
<CardHeader>
<CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5"/> Mood trend</CardTitle>
</CardHeader>
<CardContent>
<MoodTrend data={trendData} />
</CardContent>
</Card>


<Card>
<CardHeader>
<CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5"/> Weekly insight</CardTitle>
</CardHeader>
<CardContent>
<WeeklyInsight summary={weekly.summary} highlights={weekly.highlights} />
</CardContent>
</Card>
</div>


<Card className="mt-4">
<CardHeader>
<CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5"/> Recent entries</CardTitle>
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
<p className="text-sm text-muted-foreground">Here’s a gentle summary for the last month based on your entries.</p>
<ReflectionMonth entries={entries} />
<div className="text-xs text-muted-foreground">These insights are generated locally using simple heuristics and a lexicon sentiment model.</div>
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
<Input placeholder="e.g., better sleep, reduce work stress" defaultValue={goals.join(", ")}
onBlur={(e)=> {const v=e.target.value; const arr=v.split(',').map(s=>s.trim()).filter(Boolean); localStorage.setItem(PREFS_KEY, JSON.stringify(arr)); }} />
</div>
<div className="flex items-center gap-3">
<Button variant="outline" onClick={exportJson}><Download className="w-4 h-4 mr-2"/>Export JSON</Button>
<Button variant="secondary" onClick={seedDemo}>Load demo data</Button>
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