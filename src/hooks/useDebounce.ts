import { useEffect, useState } from "react";

// Gibt einen Wert erst nach einer kurzen Wartezeit weiter.
// Das reduziert z.B. unnötige Filter-Neuberechnungen bei jedem Tastendruck.
export function useDebounce(value: string, delay: number): string {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Startet den Timer bei jeder Eingabeaenderung neu.
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Aufraeumen verhindert veraltete Timer.
        return() => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
