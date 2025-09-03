export function todayISO(d = new Date()): string {
    return d.toISOString().slice(0, 10);
    }
    
    
    export function formatNice(dateStr: string): string {
    try { return new Date(dateStr).toLocaleDateString(); } catch { return dateStr; }
    }
    
    
    export function withinDays(dateStr: string, days: number): boolean {
    const now = new Date();
    const d = new Date(dateStr);
    return (now.getTime() - d.getTime()) <= days * 24 * 3600 * 1000;
    }