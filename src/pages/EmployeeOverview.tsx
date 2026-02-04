import { AiOutlineDelete, AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "../components/common/Loader";
import { CustomModal } from "../components/common/Modal";
import { useNotification } from "../components/common/NotificationProvider";
import { useEmployeeApi } from "../hooks/useEmployeeApi";
import { useDebounce } from "../hooks/useDebounce";
import { useEmployeeManagement } from "../hooks/useEmployeeManagement";
import "./EmployeeOverview.css";

const ITEMS_PER_PAGE = 8;
const MAX_VISIBLE_PAGE_BUTTONS = 5;
const FILTER_DEBOUNCE_MS = 300;
const OVERVIEW_STATE_KEY = "employeeOverview.uiState.v1";

type EmployeeFilters = {
    vorname: string;
    nachname: string;
    standort: string;
    qualifikation: string;
};

type FilterKey = keyof EmployeeFilters;
type SortKey = "vorname" | "nachname" | "standort";
type SortDirection = "asc" | "desc";

type PersistedOverviewState = {
    filters: EmployeeFilters;
    sortKey: SortKey | null;
    sortDirection: SortDirection;
    currentPage: number;
};

const DEFAULT_FILTERS: EmployeeFilters = {
    vorname: "",
    nachname: "",
    standort: "",
    qualifikation: "",
};

const FILTER_LABELS: Record<FilterKey, string> = {
    vorname: "Vorname",
    nachname: "Nachname",
    standort: "Ort",
    qualifikation: "Qualifikation",
};

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
    { key: "vorname", label: "Vorname" },
    { key: "nachname", label: "Nachname" },
    { key: "standort", label: "Ort" },
];

function normalizeFilterValue(value: string): string {
    return value.trim().toLowerCase();
}

function isSortKey(value: string): value is SortKey {
    return value === "vorname" || value === "nachname" || value === "standort";
}

function loadPersistedOverviewState(): PersistedOverviewState | null {
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
        return null;
    }
}

function getVisiblePageNumbers(totalPages: number, currentPage: number): number[] {
    if (totalPages <= MAX_VISIBLE_PAGE_BUTTONS) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const halfWindow = Math.floor(MAX_VISIBLE_PAGE_BUTTONS / 2);
    let start = Math.max(1, currentPage - halfWindow);
    let end = start + MAX_VISIBLE_PAGE_BUTTONS - 1;

    if (end > totalPages) {
        end = totalPages;
        start = end - MAX_VISIBLE_PAGE_BUTTONS + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function EmployeeOverview() {
    const navigate = useNavigate();
    const { notify } = useNotification();
    const { employees, loading, error, refreshEmployees } = useEmployeeManagement();
    const { deleteEmployee } = useEmployeeApi();
    const persistedState = useMemo(loadPersistedOverviewState, []);
    const [employeeToDelete, setEmployeeToDelete] = useState<{ id: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(persistedState?.currentPage ?? 1);
    const [filters, setFilters] = useState<EmployeeFilters>(persistedState?.filters ?? DEFAULT_FILTERS);
    const [sortKey, setSortKey] = useState<SortKey | null>(persistedState?.sortKey ?? null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(persistedState?.sortDirection ?? "asc");
    const hasInitializedFilterEffects = useRef(false);

    const debouncedVorname = useDebounce(filters.vorname, FILTER_DEBOUNCE_MS);
    const debouncedNachname = useDebounce(filters.nachname, FILTER_DEBOUNCE_MS);
    const debouncedStandort = useDebounce(filters.standort, FILTER_DEBOUNCE_MS);

    const qualificationOptions = useMemo(() => {
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
        const normalizedVorname = normalizeFilterValue(debouncedVorname);
        const normalizedNachname = normalizeFilterValue(debouncedNachname);
        const normalizedStandort = normalizeFilterValue(debouncedStandort);
        const normalizedQualifikation = normalizeFilterValue(filters.qualifikation);

        return employees.filter((employee) => {
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

        const multiplier = sortDirection === "asc" ? 1 : -1;
        return [...filteredEmployees].sort(
            (left, right) =>
                left[sortKey].localeCompare(right[sortKey], "de", { sensitivity: "base" }) *
                multiplier,
        );
    }, [filteredEmployees, sortDirection, sortKey]);

    const totalEmployees = sortedEmployees.length;
    const emptyStateMessage = hasFilters
        ? "Keine Mitarbeiter mit den aktuellen Filtern gefunden."
        : "Keine Mitarbeiter gefunden.";
    const totalPages = Math.max(1, Math.ceil(totalEmployees / ITEMS_PER_PAGE));
    const paginatedEmployees = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedEmployees.slice(start, start + ITEMS_PER_PAGE);
    }, [currentPage, sortedEmployees]);
    const visiblePageNumbers = useMemo(
        () => getVisiblePageNumbers(totalPages, currentPage),
        [currentPage, totalPages],
    );

    useEffect(() => {
        if (!hasInitializedFilterEffects.current) {
            hasInitializedFilterEffects.current = true;
            return;
        }
        setCurrentPage(1);
    }, [debouncedNachname, debouncedStandort, debouncedVorname, filters.qualifikation]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

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
        setFilter(key, "");
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setFilters({ ...DEFAULT_FILTERS });
        setCurrentPage(1);
    };

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
            return;
        }

        setSortKey(key);
        setSortDirection("asc");
    };

    const getSortIndicator = (key: SortKey): string => {
        if (sortKey !== key) {
            return "";
        }
        return sortDirection === "asc" ? " ▲" : " ▼";
    };

    const handleMobileSortChange = (value: string) => {
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
        if (!isDeleting) {
            setEmployeeToDelete(null);
        }
    };

    const openDeleteModal = (id: string, vorname: string, nachname: string) => {
        setEmployeeToDelete({
            id,
            name: `${vorname} ${nachname}`,
        });
    };

    const handleDelete = async () => {
        if (!employeeToDelete) {
            return;
        }

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

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="employee-overview">
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
        <div className="employee-overview">
            <div className="employee-header">
                <h1>Mitarbeiterübersicht</h1>
                <button
                    className="btn-new-employee"
                    onClick={() => navigate("/employees/new")}
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

            <div className="table-container">
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
                                        <div className="qualifications">
                                            {employee.qualifikationen.length > 0 ? (
                                                employee.qualifikationen.map((qualification) => (
                                                    <span key={qualification} className="qualification-badge">
                                                        {qualification}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-muted">Keine Qualifikationen</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn"
                                                onClick={() => navigate(`/employees/${employee.id}`)}
                                                title="Mitarbeiter ansehen"
                                            >
                                                <AiOutlineEye />
                                            </button>
                                            <button
                                                className="action-btn"
                                                onClick={() => navigate(`/employees/${employee.id}/edit`)}
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
                                    </td>
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
                                {employee.qualifikationen.length > 0 ? (
                                    employee.qualifikationen.map((qualification) => (
                                        <span key={qualification} className="qualification-badge">
                                            {qualification}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-muted">Keine Qualifikationen</span>
                                )}
                            </div>
                            <div className="action-buttons action-buttons-mobile">
                                <button
                                    className="action-btn"
                                    onClick={() => navigate(`/employees/${employee.id}`)}
                                    title="Mitarbeiter ansehen"
                                >
                                    <AiOutlineEye />
                                </button>
                                <button
                                    className="action-btn"
                                    onClick={() => navigate(`/employees/${employee.id}/edit`)}
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
                        </article>
                    ))
                )}
            </div>

            <div className="pagination">
                <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                    disabled={currentPage <= 1}
                >
                    <FiChevronLeft /> Previous
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
                    Next <FiChevronRight />
                </button>
            </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button className="pagination-btn">
          <FiChevronLeft /> Zurück
        </button>
        <button className="pagination-number pagination-active">1</button>
        <button className="pagination-number">2</button>
        <button className="pagination-number">3</button>
        <button className="pagination-btn">
          Weiter <FiChevronRight />
        </button>
      </div>
    </div>
  );
}
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
