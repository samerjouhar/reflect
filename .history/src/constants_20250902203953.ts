export const STORAGE_KEY = "journal.enc.v1";
export const PREFS_KEY = "journal.prefs.v1";


export const DEFAULT_THEMES = [
"work", "family", "friends", "health", "sleep", "exercise", "gratitude", "focus", "anxiety", "energy", "creativity",
];


export const QUICK_TAGS = [
"grateful", "stressed", "calm", "anxious", "tired", "energized", "social", "focused", "distracted", "creative", "overwhelmed",
];


export type JournalEntry = {
date: string; // YYYY-MM-DD
text: string;
sentiment: number; // comparative
themes: string[];
};