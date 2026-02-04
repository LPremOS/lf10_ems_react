import { AiOutlineDelete, AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "../components/common/Loader";
import { CustomModal } from "../components/common/Modal";
import { useNotification } from "../components/common/NotificationProvider";
import { useEmployeeApi } from "../hooks/useEmployeeApi";
import { useDebounce } from "../hooks/useDebounce";
import { useEmployeeManagement } from "../hooks/useEmployeeManagement";
import { EMPLOYEE_ROUTES } from "../features/employees/routes";
import type { Employee } from "../types/Employee";
import {
    DEFAULT_FILTERS,
    FILTER_LABELS,
    OVERVIEW_STATE_KEY,
    SORT_OPTIONS,
    getVisiblePageNumbers,
    isSortKey,
    loadPersistedOverviewState,
    normalizeFilterValue,
    type EmployeeFilters,
    type FilterKey,
    type PersistedOverviewState,
    type SortDirection,
    type SortKey,
} from "../features/employees/overviewModel";
import "../styles/EmployeeOverview.css";

// Layout-/Paging-Konstanten fuer die Uebersicht.
const DEFAULT_ITEMS_PER_PAGE = 8;
const MIN_ITEMS_PER_PAGE = 1;
const DESKTOP_ROW_FALLBACK_HEIGHT = 52;
const MOBILE_ITEMS_PER_PAGE = 7;
const MAX_VISIBLE_PAGE_BUTTONS = 5;
const FILTER_DEBOUNCE_MS = 300;

// Hauptseite der Mitarbeiterverwaltung (Liste, Filter, Sortierung, Paging, Loeschen).
export function EmployeeOverview() {
    const navigate = useNavigate();
    const { notify } = useNotification();
    const { employees, loading, error, refreshEmployees } = useEmployeeManagement();
    const { deleteEmployee } = useEmployeeApi();
    // Persistierten UI-Zustand (Filter/Sort/Page) einmalig aus localStorage laden.
    const persistedState = useMemo(loadPersistedOverviewState, []);
    const [employeeToDelete, setEmployeeToDelete] = useState<{ id: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(persistedState?.currentPage ?? 1);
    const [filters, setFilters] = useState<EmployeeFilters>(persistedState?.filters ?? DEFAULT_FILTERS);
    const [sortKey, setSortKey] = useState<SortKey | null>(persistedState?.sortKey ?? null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(persistedState?.sortDirection ?? "asc");
    const hasInitializedFilterEffects = useRef(false);
    const resultsRef = useRef<HTMLDivElement | null>(null);
    const tableContainerRef = useRef<HTMLDivElement | null>(null);
    const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
    const [isMobileLayout, setIsMobileLayout] = useState(false);

    // Debounced Filter fuer bessere Performance beim Tippen.
    const debouncedVorname = useDebounce(filters.vorname, FILTER_DEBOUNCE_MS);
    const debouncedNachname = useDebounce(filters.nachname, FILTER_DEBOUNCE_MS);
    const debouncedStandort = useDebounce(filters.standort, FILTER_DEBOUNCE_MS);

    const qualificationOptions = useMemo(() => {
        // Alle vorhandenen Skills sammeln, trimmen und ohne Duplikate anzeigen.
        const allQualifications = employees.flatMap((employee) => employee.qualifikationen ?? []);
        return Array.from(
            new Set(allQualifications.map((qualification) => qualification.trim()).filter(Boolean)),
        ).sort((left, right) => left.localeCompare(right, "de"));
    }, [employees]);

    const hasFilters = useMemo(
        () => Object.values(filters).some((value) => value.trim() !== ""),
        [filters],
    );

    const activeFilterChips = useMemo(
        // Nur aktive Filter in kleine "Chips" fuer schnelle Entfernung umwandeln.
        () =>
            (Object.keys(filters) as FilterKey[])
                .filter((key) => filters[key].trim() !== "")
                .map((key) => ({
                    key,
                    label: FILTER_LABELS[key],
                    value: filters[key].trim(),
                })),
        [filters],
    );

    const filteredEmployees = useMemo(() => {
        // Einheitliches Suchformat.
        const normalizedVorname = normalizeFilterValue(debouncedVorname);
        const normalizedNachname = normalizeFilterValue(debouncedNachname);
        const normalizedStandort = normalizeFilterValue(debouncedStandort);
        const normalizedQualifikation = normalizeFilterValue(filters.qualifikation);

        return employees.filter((employee) => {
            // Alle gesetzten Filter muessen gleichzeitig passen.
            const matchesVorname =
                normalizedVorname === "" ||
                employee.vorname.toLowerCase().includes(normalizedVorname);
            const matchesNachname =
                normalizedNachname === "" ||
                employee.nachname.toLowerCase().includes(normalizedNachname);
            const matchesStandort =
                normalizedStandort === "" ||
                employee.standort.toLowerCase().includes(normalizedStandort);
            const matchesQualifikation =
                normalizedQualifikation === "" ||
                (employee.qualifikationen ?? []).some(
                    (qualification) =>
                        qualification.toLowerCase() === normalizedQualifikation,
                );

            return (
                matchesVorname &&
                matchesNachname &&
                matchesStandort &&
                matchesQualifikation
            );
        });
    }, [debouncedNachname, debouncedStandort, debouncedVorname, employees, filters.qualifikation]);

    const sortedEmployees = useMemo(() => {
        if (!sortKey) {
            return filteredEmployees;
        }

        // Richtung wird ueber Multiplikator gesteuert.
        const multiplier = sortDirection === "asc" ? 1 : -1;
        return [...filteredEmployees].sort(
            (left, right) =>
                left[sortKey].localeCompare(right[sortKey], "de", { sensitivity: "base" }) *
                multiplier,
        );
    }, [filteredEmployees, sortDirection, sortKey]);
    const totalEmployees = sortedEmployees.length;

    const recalculateItemsPerPage = useCallback(() => {
        // Mobile nutzt feste Kartenzahl.
        if (isMobileLayout) {
            setItemsPerPage((previous) =>
                previous === MOBILE_ITEMS_PER_PAGE ? previous : MOBILE_ITEMS_PER_PAGE,
            );
            return;
        }

        const resultsHeight = resultsRef.current?.clientHeight ?? 0;
        if (resultsHeight <= 0) {
            return;
        }

        const tableContainerElement = tableContainerRef.current;
        if (!tableContainerElement) {
            return;
        }

        const tableHeadHeight =
            tableContainerElement.querySelector("thead")?.getBoundingClientRect().height ?? 0;
        const firstRowHeight =
            tableContainerElement.querySelector("tbody tr")?.getBoundingClientRect().height ??
            DESKTOP_ROW_FALLBACK_HEIGHT;
        const availableHeight = Math.max(resultsHeight - tableHeadHeight, firstRowHeight);
        const nextItemsPerPage = Math.max(
            MIN_ITEMS_PER_PAGE,
            Math.floor(availableHeight / Math.max(firstRowHeight, 1)),
        );

        // State nur aktualisieren, wenn sich der Wert wirklich geaendert hat.
        setItemsPerPage((previous) =>
            previous === nextItemsPerPage ? previous : nextItemsPerPage,
        );
    }, [isMobileLayout]);

    useEffect(() => {
        if (typeof document === "undefined") {
            return;
        }

        // Verhindert doppeltes Scrollen innerhalb des App-Layouts.
        const contentElement = document.querySelector<HTMLElement>(".app-layout__content");
        if (!contentElement) {
            return;
        }

        contentElement.classList.add("app-layout__content--no-scroll");
        return () => contentElement.classList.remove("app-layout__content--no-scroll");
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        // Schaltet zwischen Tabellen- und Mobile-Kartenlayout.
        const mediaQuery = window.matchMedia("(max-width: 768px)");
        const handleMediaQueryChange = (event: MediaQueryListEvent) => {
            setIsMobileLayout(event.matches);
        };

        setIsMobileLayout(mediaQuery.matches);
        mediaQuery.addEventListener("change", handleMediaQueryChange);
        return () => mediaQuery.removeEventListener("change", handleMediaQueryChange);
    }, []);

    useEffect(() => {
        // Recalculate bei allen relevanten UI-Aenderungen.
        recalculateItemsPerPage();
    }, [
        recalculateItemsPerPage,
        activeFilterChips.length,
        currentPage,
        hasFilters,
        sortDirection,
        sortKey,
        totalEmployees,
    ]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        // Recalculate auch bei klassischem Browser-Resize.
        const handleResize = () => recalculateItemsPerPage();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [recalculateItemsPerPage]);

    const emptyStateMessage = hasFilters
        ? "Keine Mitarbeiter mit den aktuellen Filtern gefunden."
        : "Keine Mitarbeiter gefunden.";
    const maxVisiblePageButtons = isMobileLayout ? 3 : MAX_VISIBLE_PAGE_BUTTONS;
    const totalPages = Math.max(1, Math.ceil(totalEmployees / itemsPerPage));
    const paginatedEmployees = useMemo(() => {
        // Schneidet die bereits gefilterte + sortierte Liste auf die aktuelle Seite.
        const start = (currentPage - 1) * itemsPerPage;
        return sortedEmployees.slice(start, start + itemsPerPage);
    }, [currentPage, itemsPerPage, sortedEmployees]);
    const visiblePageNumbers = useMemo(
        () => getVisiblePageNumbers(totalPages, currentPage, maxVisiblePageButtons),
        [currentPage, maxVisiblePageButtons, totalPages],
    );

    useEffect(() => {
        // Bei Filterwechsel wieder auf Seite 1 springen.
        if (!hasInitializedFilterEffects.current) {
            hasInitializedFilterEffects.current = true;
            return;
        }
        setCurrentPage(1);
    }, [debouncedNachname, debouncedStandort, debouncedVorname, filters.qualifikation]);

    useEffect(() => {
        // Falls Seitenanzahl kleiner wird, aktuelle Seite korrigieren.
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        // UI-Zustand persistent speichern.
        const persistedValue: PersistedOverviewState = {
            filters,
            sortKey,
            sortDirection,
            currentPage,
        };
        window.localStorage.setItem(OVERVIEW_STATE_KEY, JSON.stringify(persistedValue));
    }, [currentPage, filters, sortDirection, sortKey]);

    const setFilter = (key: FilterKey, value: string) => {
        setFilters((previous) => ({ ...previous, [key]: value }));
    };

    const clearSingleFilter = (key: FilterKey) => {
        // Entfernt genau einen Filter-Chip.
        setFilter(key, "");
        setCurrentPage(1);
    };

    const resetFilters = () => {
        // Setzt alle Filter auf den Ausgangszustand.
        setFilters({ ...DEFAULT_FILTERS });
        setCurrentPage(1);
    };

    const handleSort = (key: SortKey) => {
        // Gleiches Feld => Richtung toggeln, neues Feld => auf "asc" starten.
        if (sortKey === key) {
            setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
            return;
        }

        setSortKey(key);
        setSortDirection("asc");
    };

    const getSortIndicator = (key: SortKey): string => {
        // Anzeige von Pfeilen in den Tabellen-Headern.
        if (sortKey !== key) {
            return "";
        }
        return sortDirection === "asc" ? " ▲" : " ▼";
    };

    const handleMobileSortChange = (value: string) => {
        // Sortierung aus mobilem Select.
        if (!value) {
            setSortKey(null);
            return;
        }

        if (!isSortKey(value)) {
            return;
        }

        setSortKey(value);
        setSortDirection("asc");
    };

    const closeDeleteModal = () => {
        // Schliessen nur, wenn kein Delete-Request laeuft.
        if (!isDeleting) {
            setEmployeeToDelete(null);
        }
    };

    const openDeleteModal = (id: string, vorname: string, nachname: string) => {
        // Merkt den Datensatz, der im Modal bestaetigt werden soll.
        setEmployeeToDelete({
            id,
            name: `${vorname} ${nachname}`,
        });
    };

    const handleDelete = async () => {
        if (!employeeToDelete) {
            return;
        }

        // Fuehrt den Loeschvorgang aus und aktualisiert danach die Liste.
        setIsDeleting(true);
        try {
            const result = await deleteEmployee(employeeToDelete.id);
            if (result.success) {
                notify({
                    tone: "success",
                    title: "Mitarbeiter gelöscht",
                });
                setEmployeeToDelete(null);
                await refreshEmployees();
                return;
            }

            notify({
                tone: "error",
                title: "Löschen fehlgeschlagen",
                message: result.error,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const renderQualificationBadges = (qualifications: string[]) => {
        // Vereinheitlicht die Darstellung von Skills in Tabelle und Kartenlayout.
        if (qualifications.length === 0) {
            return <span className="text-muted">Keine Qualifikationen</span>;
        }

        return qualifications.map((qualification) => (
            <span key={qualification} className="qualification-badge">
                {qualification}
            </span>
        ));
    };

    const renderActionButtons = (employee: Employee, isMobile = false) => (
        // Wiederverwendete Aktionsbuttons fuer Desktop- und Mobile-Ansicht.
        <div className={`action-buttons${isMobile ? " action-buttons-mobile" : ""}`}>
            <button
                className="action-btn"
                onClick={() => navigate(EMPLOYEE_ROUTES.details(employee.id))}
                title="Mitarbeiter ansehen"
            >
                <AiOutlineEye />
            </button>
            <button
                className="action-btn"
                onClick={() => navigate(EMPLOYEE_ROUTES.edit(employee.id))}
                title="Mitarbeiter bearbeiten"
            >
                <AiOutlineEdit />
            </button>
            <button
                className="action-btn action-btn-delete"
                title="Mitarbeiter löschen"
                onClick={() => openDeleteModal(employee.id, employee.vorname, employee.nachname)}
            >
                <AiOutlineDelete />
            </button>
        </div>
    );

    if (loading) {
        // Globaler Ladezustand der Mitarbeiterliste.
        return <Loader />;
    }

    if (error) {
        // Klarer Fehlerzustand mit Hinweistext fuer Backend/Auth.
        return (
            <div className="employee-overview employee-overview--paginated">
                <div className="alert alert-danger" role="alert">
                    <h4>Fehler beim Laden der Mitarbeiter</h4>
                    <p>{error}</p>
                    <p className="mb-0">
                        Bitte stellen Sie sicher, dass das Backend läuft und Sie angemeldet sind.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="employee-overview employee-overview--paginated">
            <div className="employee-header">
                <h1>Mitarbeiterübersicht</h1>
                <button
                    className="btn-new-employee"
                    onClick={() => navigate(EMPLOYEE_ROUTES.create)}
                >
                    Neuen Mitarbeiter anlegen
                </button>
            </div>

            <div className="filter-section">
                <h3>Filter</h3>
                <div className="filter-row">
                    <div className="filter-group">
                        <label>Vorname</label>
                        <input
                            type="text"
                            placeholder="Vorname eingeben"
                            value={filters.vorname}
                            onChange={(event) => setFilter("vorname", event.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Nachname</label>
                        <input
                            type="text"
                            placeholder="Nachname eingeben"
                            value={filters.nachname}
                            onChange={(event) => setFilter("nachname", event.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Ort</label>
                        <input
                            type="text"
                            placeholder="Ort eingeben"
                            value={filters.standort}
                            onChange={(event) => setFilter("standort", event.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Qualifikation</label>
                        <select
                            value={filters.qualifikation}
                            onChange={(event) => setFilter("qualifikation", event.target.value)}
                        >
                            <option value="">Qualifikation auswählen</option>
                            {qualificationOptions.map((qualification) => (
                                <option key={qualification} value={qualification}>
                                    {qualification}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="filter-actions">
                    <button
                        className="btn-filter btn-filter-reset"
                        onClick={resetFilters}
                        disabled={!hasFilters}
                    >
                        Filter zurücksetzen
                    </button>
                </div>

                {hasFilters && (
                    <div className="filter-chip-list">
                        {activeFilterChips.map((chip) => (
                            <span key={chip.key} className="filter-chip">
                                <span>
                                    {chip.label}: {chip.value}
                                </span>
                                <button
                                    type="button"
                                    className="filter-chip-remove"
                                    onClick={() => clearSingleFilter(chip.key)}
                                    aria-label={`${chip.label} Filter entfernen`}
                                    title="Filter entfernen"
                                >
                                    <FiX />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="employee-results" ref={resultsRef}>
                <div className="table-container" ref={tableContainerRef}>
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>
                                    <button className="table-sort-button" onClick={() => handleSort("vorname")}>
                                        Vorname{getSortIndicator("vorname")}
                                    </button>
                                </th>
                                <th>
                                    <button className="table-sort-button" onClick={() => handleSort("nachname")}>
                                        Nachname{getSortIndicator("nachname")}
                                    </button>
                                </th>
                                <th>
                                    <button className="table-sort-button" onClick={() => handleSort("standort")}>
                                        Ort{getSortIndicator("standort")}
                                    </button>
                                </th>
                                <th>Qualifikationen</th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {totalEmployees === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center text-muted py-4">
                                        {emptyStateMessage}
                                    </td>
                                </tr>
                            ) : (
                                paginatedEmployees.map((employee) => (
                                    <tr key={employee.id}>
                                        <td>{employee.vorname}</td>
                                        <td>{employee.nachname}</td>
                                        <td>{employee.standort}</td>
                                        <td>
                                            <div className="qualifications">{renderQualificationBadges(employee.qualifikationen)}</div>
                                        </td>
                                        <td>{renderActionButtons(employee)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mobile-employee-list">
                    <div className="mobile-sort-controls">
                        <label htmlFor="mobileSortSelect">Sortierung</label>
                        <div className="mobile-sort-controls-row">
                            <select
                                id="mobileSortSelect"
                                value={sortKey ?? ""}
                                onChange={(event) => handleMobileSortChange(event.target.value)}
                            >
                                <option value="">Keine Sortierung</option>
                                {SORT_OPTIONS.map((option) => (
                                    <option key={option.key} value={option.key}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                className="mobile-sort-direction-btn"
                                onClick={() => setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"))}
                                disabled={!sortKey}
                                title="Sortierrichtung wechseln"
                            >
                                {sortDirection === "asc" ? "A-Z" : "Z-A"}
                            </button>
                        </div>
                    </div>

                    {totalEmployees === 0 ? (
                        <div className="employee-card employee-card-empty text-muted">
                            {emptyStateMessage}
                        </div>
                    ) : (
                        paginatedEmployees.map((employee) => (
                            <article key={employee.id} className="employee-card">
                                <div className="employee-card-header">
                                    <h4>{employee.vorname} {employee.nachname}</h4>
                                    <span className="employee-card-location">{employee.standort}</span>
                                </div>
                                <div className="employee-card-qualifications">
                                    {renderQualificationBadges(employee.qualifikationen)}
                                </div>
                                {renderActionButtons(employee, true)}
                            </article>
                        ))
                    )}
                </div>
            </div>

            <div className="pagination">
                <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                    disabled={currentPage <= 1}
                >
                    <FiChevronLeft /> Zurück
                </button>

                {visiblePageNumbers.map((pageNumber) => (
                    <button
                        key={pageNumber}
                        className={`pagination-number ${pageNumber === currentPage ? "pagination-active" : ""}`}
                        onClick={() => setCurrentPage(pageNumber)}
                        aria-current={pageNumber === currentPage ? "page" : undefined}
                    >
                        {pageNumber}
                    </button>
                ))}

                <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((previous) => Math.min(totalPages, previous + 1))}
                    disabled={currentPage >= totalPages}
                >
                    Weiter <FiChevronRight />
                </button>
            </div>

            <CustomModal
                show={Boolean(employeeToDelete)}
                onClose={closeDeleteModal}
                onSave={handleDelete}
                title="Mitarbeiter löschen?"
                saveButtonText={isDeleting ? "Lösche..." : "Löschen"}
                cancelButtonText="Abbrechen"
                saveVariant="danger"
                isBusy={isDeleting}
            >
                <p>
                    Möchten Sie <strong>{employeeToDelete?.name}</strong> wirklich löschen?
                </p>
            </CustomModal>
        </div>
    );
}
