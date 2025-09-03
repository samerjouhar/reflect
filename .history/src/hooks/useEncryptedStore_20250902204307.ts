import { useEffect, useState } from "react";
import { STORAGE_KEY } from "@/constants";
import { decrypt, encrypt } from "@/lib/crypto";
import type { JournalEntry } from "@/constants";


export function useEncryptedStore(passphrase?: string | null) {
    const [entries, setEntries] = useState<JournalEntry[]>([]);


    useEffect(() => {
        if (!passphrase) return;
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) { setEntries([]); return; }
        const data = decrypt<JournalEntry[]>(raw, passphrase);
        setEntries(Array.isArray(data) ? data : []);
    }, [passphrase]);

    const persist = (next: JournalEntry[]) => {
        if (!passphrase) return;
        const enc = encrypt(next, passphrase);
        if (enc) localStorage.setItem(STORAGE_KEY, enc);
    };

    return { entries, setEntries, persist };
}