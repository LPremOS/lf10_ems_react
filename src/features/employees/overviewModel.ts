// Filtermodell der Mitarbeiter-Uebersicht.
export type EmployeeFilters = {
    vorname: string;
    nachname: string;
    standort: string;
    qualifikation: string;
};

export type FilterKey = keyof EmployeeFilters;
export type SortKey = "vorname" | "nachname" | "standort";
export type SortDirection = "asc" | "desc";

// UI-Zustand, der in localStorage gespeichert wird.
export type PersistedOverviewState = {
    filters: EmployeeFilters;
    sortKey: SortKey | null;
    sortDirection: SortDirection;
    currentPage: number;
};

// Speicher-Key fuer localStorage.
export const OVERVIEW_STATE_KEY = "employeeOverview.uiState.v1";

// Ausgangszustand aller Filter.
export const DEFAULT_FILTERS: EmployeeFilters = {
    vorname: "",
    nachname: "",
    standort: "",
    qualifikation: "",
};

// Lesbare Labels fuer aktive Filter-Chips.
export const FILTER_LABELS: Record<FilterKey, string> = {
    vorname: "Vorname",
    nachname: "Nachname",
    standort: "Ort",
    qualifikation: "Qualifikation",
};

// Optionen fuer mobile Sortier-Auswahl.
export const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
    { key: "vorname", label: "Vorname" },
    { key: "nachname", label: "Nachname" },
    { key: "standort", label: "Ort" },
];

export function normalizeFilterValue(value: string): string {
    // Einheitliches Format fuer Textvergleiche.
    return value.trim().toLowerCase();
}

export function isSortKey(value: string): value is SortKey {
    // Type Guard fuer sichere Verarbeitung von String-Werten aus <select>.
    return value === "vorname" || value === "nachname" || value === "standort";
}

export function loadPersistedOverviewState(): PersistedOverviewState | null {
    // Schutz fuer SSR/Tests ohne window.
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const storedValue = window.localStorage.getItem(OVERVIEW_STATE_KEY);
        if (!storedValue) {
            return null;
        }

        const parsed = JSON.parse(storedValue) as Partial<PersistedOverviewState>;
        const filters = parsed.filters;

        // Strikte Laufzeitpruefung des gespeicherten JSON-Objekts.
        const hasValidFilters =
            typeof filters?.vorname === "string" &&
            typeof filters.nachname === "string" &&
            typeof filters.standort === "string" &&
            typeof filters.qualifikation === "string";

        const hasValidSortKey =
            parsed.sortKey === null ||
            parsed.sortKey === "vorname" ||
            parsed.sortKey === "nachname" ||
            parsed.sortKey === "standort";

        const hasValidSortDirection =
            parsed.sortDirection === "asc" || parsed.sortDirection === "desc";

        const hasValidPage =
            Number.isInteger(parsed.currentPage) && (parsed.currentPage ?? 0) > 0;

        if (!hasValidFilters || !hasValidSortKey || !hasValidSortDirection || !hasValidPage) {
            return null;
        }

        // Rueckgabe in exakt typisierter Form.
        return {
            filters: {
                vorname: filters.vorname,
                nachname: filters.nachname,
                standort: filters.standort,
                qualifikation: filters.qualifikation,
            },
            sortKey: parsed.sortKey ?? null,
            sortDirection: parsed.sortDirection as SortDirection,
            currentPage: parsed.currentPage as number,
        };
    } catch {
        // Defekter JSON-Inhalt soll die Seite nicht kaputt machen.
        return null;
    }
}

export function getVisiblePageNumbers(
    totalPages: number,
    currentPage: number,
    maxVisibleButtons: number,
): number[] {
    // Wenn alle Seiten sichtbar sind, geben wir einfach 1..n zurueck.
    if (totalPages <= maxVisibleButtons) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    // Sonst wird ein gleitendes Fenster um die aktuelle Seite berechnet.
    const halfWindow = Math.floor(maxVisibleButtons / 2);
    let start = Math.max(1, currentPage - halfWindow);
    let end = start + maxVisibleButtons - 1;

    if (end > totalPages) {
        end = totalPages;
        start = end - maxVisibleButtons + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
