import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployeeManagement } from '../hooks/useEmployeeManagement';
import { useEmployeeApi } from '../hooks/useEmployeeApi';
import { useDebounce } from '../hooks/useDebounce';
import { Loader } from '../components/common/Loader';
import { CustomModal } from '../components/common/Modal';
import { useNotification } from '../components/common/NotificationProvider';
import './EmployeeOverview.css';

const ITEMS_PER_PAGE = 8;
const MAX_VISIBLE_PAGE_BUTTONS = 5;
const FILTER_DEBOUNCE_MS = 300;
const OVERVIEW_STATE_KEY = 'employeeOverview.uiState.v1';

type EmployeeFilters = {
  vorname: string;
  nachname: string;
  standort: string;
  qualifikation: string;
};
type FilterKey = keyof EmployeeFilters;

type SortKey = 'vorname' | 'nachname' | 'standort';
type SortDirection = 'asc' | 'desc';
type PersistedOverviewState = {
  filters: EmployeeFilters;
  sortKey: SortKey | null;
  sortDirection: SortDirection;
  currentPage: number;
};

function loadPersistedOverviewState(): PersistedOverviewState | null {
  if (typeof window === 'undefined') return null;

  try {
    const rawState = window.localStorage.getItem(OVERVIEW_STATE_KEY);
    if (!rawState) return null;
    const parsed = JSON.parse(rawState) as Partial<PersistedOverviewState>;

    const filters = parsed.filters;
    const hasValidFilters =
      typeof filters?.vorname === 'string' &&
      typeof filters?.nachname === 'string' &&
      typeof filters?.standort === 'string' &&
      typeof filters?.qualifikation === 'string';
    const hasValidSortKey =
      parsed.sortKey === null || parsed.sortKey === 'vorname' || parsed.sortKey === 'nachname' || parsed.sortKey === 'standort';
    const hasValidSortDirection = parsed.sortDirection === 'asc' || parsed.sortDirection === 'desc';
    const hasValidPage = Number.isInteger(parsed.currentPage) && (parsed.currentPage ?? 0) > 0;

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
      sortKey: (parsed.sortKey ?? null) as SortKey | null,
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
  const { employees, loading, error, refreshEmployees } = useEmployeeManagement();
  const { deleteEmployee } = useEmployeeApi();
  const { notify } = useNotification();
  const persistedState = useMemo(() => loadPersistedOverviewState(), []);
  const [employeeToDelete, setEmployeeToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(persistedState?.currentPage ?? 1);
  const [filters, setFilters] = useState<EmployeeFilters>({
    vorname: persistedState?.filters.vorname ?? '',
    nachname: persistedState?.filters.nachname ?? '',
    standort: persistedState?.filters.standort ?? '',
    qualifikation: persistedState?.filters.qualifikation ?? '',
  });
  const [sortKey, setSortKey] = useState<SortKey | null>(persistedState?.sortKey ?? null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(persistedState?.sortDirection ?? 'asc');
  const hasInitializedFilterEffects = useRef(false);

  const debouncedVorname = useDebounce(filters.vorname, FILTER_DEBOUNCE_MS);
  const debouncedNachname = useDebounce(filters.nachname, FILTER_DEBOUNCE_MS);
  const debouncedStandort = useDebounce(filters.standort, FILTER_DEBOUNCE_MS);

  const qualificationOptions = useMemo(() => {
    const allQualifications = employees.flatMap((employee) => employee.qualifikationen ?? []);
    const uniqueQualifications = Array.from(new Set(allQualifications.map((qualification) => qualification.trim()).filter(Boolean)));
    return uniqueQualifications.sort((a, b) => a.localeCompare(b, 'de'));
  }, [employees]);

  const hasFilters = useMemo(() => {
    return Object.values(filters).some((value) => value.trim() !== '');
  }, [filters]);

  const activeFilterChips = useMemo(() => {
    const filterLabels: Record<FilterKey, string> = {
      vorname: 'Vorname',
      nachname: 'Nachname',
      standort: 'Ort',
      qualifikation: 'Qualifikation',
    };

    return (Object.keys(filters) as FilterKey[])
      .filter((key) => filters[key].trim() !== '')
      .map((key) => ({
        key,
        label: filterLabels[key],
        value: filters[key].trim(),
      }));
  }, [filters]);

  const filteredEmployees = useMemo(() => {
    const normalizedVorname = debouncedVorname.trim().toLowerCase();
    const normalizedNachname = debouncedNachname.trim().toLowerCase();
    const normalizedStandort = debouncedStandort.trim().toLowerCase();
    const normalizedQualifikation = filters.qualifikation.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesVorname =
        normalizedVorname === '' || employee.vorname.toLowerCase().includes(normalizedVorname);
      const matchesNachname =
        normalizedNachname === '' || employee.nachname.toLowerCase().includes(normalizedNachname);
      const matchesStandort =
        normalizedStandort === '' || employee.standort.toLowerCase().includes(normalizedStandort);
      const matchesQualifikation =
        normalizedQualifikation === '' ||
        (employee.qualifikationen ?? []).some(
          (qualification) => qualification.toLowerCase() === normalizedQualifikation,
        );

      return matchesVorname && matchesNachname && matchesStandort && matchesQualifikation;
    });
  }, [debouncedNachname, debouncedStandort, debouncedVorname, employees, filters.qualifikation]);

  const sortedEmployees = useMemo(() => {
    if (!sortKey) {
      return filteredEmployees;
    }

    const multiplier = sortDirection === 'asc' ? 1 : -1;
    return [...filteredEmployees].sort((a, b) => {
      return a[sortKey].localeCompare(b[sortKey], 'de', { sensitivity: 'base' }) * multiplier;
    });
  }, [filteredEmployees, sortDirection, sortKey]);

  const totalEmployees = sortedEmployees.length;
  const totalPages = Math.max(1, Math.ceil(totalEmployees / ITEMS_PER_PAGE));

  useEffect(() => {
    if (!hasInitializedFilterEffects.current) {
      hasInitializedFilterEffects.current = true;
      return;
    }
    setCurrentPage(1);
  }, [debouncedVorname, debouncedNachname, debouncedStandort, filters.qualifikation]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const persistedValue: PersistedOverviewState = {
      filters,
      sortKey,
      sortDirection,
      currentPage,
    };
    window.localStorage.setItem(OVERVIEW_STATE_KEY, JSON.stringify(persistedValue));
  }, [filters, sortKey, sortDirection, currentPage]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sortedEmployees.slice(start, end);
  }, [currentPage, sortedEmployees]);

  const visiblePageNumbers = useMemo(
    () => getVisiblePageNumbers(totalPages, currentPage),
    [currentPage, totalPages],
  );

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setEmployeeToDelete(null);
  };

  const resetFilters = () => {
    setFilters({
      vorname: '',
      nachname: '',
      standort: '',
      qualifikation: '',
    });
    setCurrentPage(1);
  };

  const clearSingleFilter = (key: FilterKey) => {
    setFilters((previous) => ({
      ...previous,
      [key]: '',
    }));
    setCurrentPage(1);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  };

  const getSortIndicator = (key: SortKey) => {
    if (sortKey !== key) return '';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;

    setIsDeleting(true);
    const result = await deleteEmployee(employeeToDelete.id);
    if (result.success) {
      notify({
        tone: "success",
        title: "Mitarbeiter gelöscht",
      });
      setEmployeeToDelete(null);
      await refreshEmployees();
      setIsDeleting(false);
      return;
    }

    notify({
      tone: "error",
      title: "Löschen fehlgeschlagen",
      message: result.error,
    });
    setIsDeleting(false);
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
          <p className="mb-0">Bitte stellen Sie sicher, dass das Backend läuft und Sie angemeldet sind.</p>
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
          onClick={() => navigate('/employees/new')}
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
              onChange={(event) => setFilters((previous) => ({ ...previous, vorname: event.target.value }))}
            />
          </div>
          <div className="filter-group">
            <label>Nachname</label>
            <input
              type="text"
              placeholder="Nachname eingeben"
              value={filters.nachname}
              onChange={(event) => setFilters((previous) => ({ ...previous, nachname: event.target.value }))}
            />
          </div>
          <div className="filter-group">
            <label>Ort</label>
            <input
              type="text"
              placeholder="Ort eingeben"
              value={filters.standort}
              onChange={(event) => setFilters((previous) => ({ ...previous, standort: event.target.value }))}
            />
          </div>
          <div className="filter-group">
            <label>Qualifikation</label>
            <select
              value={filters.qualifikation}
              onChange={(event) => setFilters((previous) => ({ ...previous, qualifikation: event.target.value }))}
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
                <span>{chip.label}: {chip.value}</span>
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
                <button className="table-sort-button" onClick={() => handleSort('vorname')}>
                  Vorname{getSortIndicator('vorname')}
                </button>
              </th>
              <th>
                <button className="table-sort-button" onClick={() => handleSort('nachname')}>
                  Nachname{getSortIndicator('nachname')}
                </button>
              </th>
              <th>
                <button className="table-sort-button" onClick={() => handleSort('standort')}>
                  Ort{getSortIndicator('standort')}
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
                  {hasFilters ? 'Keine Mitarbeiter mit den aktuellen Filtern gefunden.' : 'Keine Mitarbeiter gefunden.'}
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
                      {employee.qualifikationen && Array.isArray(employee.qualifikationen) ? (
                        employee.qualifikationen.map((qual, idx) => (
                          <span key={idx} className="qualification-badge">
                            {qual}
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
                        <button className="action-btn action-btn-delete"
                          title="Mitarbeiter löschen"
                          onClick={() => setEmployeeToDelete({ id: employee.id, name: `${employee.vorname} ${employee.nachname}` })}
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

      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => {
            if (currentPage > 1) {
              setCurrentPage((previous) => Math.max(1, previous - 1));
            }
          }}
        >
          <FiChevronLeft /> Previous
        </button>

        {visiblePageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            className={`pagination-number ${pageNumber === currentPage ? 'pagination-active' : ''}`}
            onClick={() => setCurrentPage(pageNumber)}
            aria-current={pageNumber === currentPage ? 'page' : undefined}
          >
            {pageNumber}
          </button>
        ))}

        <button
          className="pagination-btn"
          onClick={() => {
            if (currentPage < totalPages) {
              setCurrentPage((previous) => Math.min(totalPages, previous + 1));
            }
          }}
        >
          Next <FiChevronRight />
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
