import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployeeManagement } from '../hooks/useEmployeeManagement';
import { useEmployeeApi } from '../hooks/useEmployeeApi';
import { Loader } from '../components/common/Loader';
import { CustomModal } from '../components/common/Modal';
import { useNotification } from '../components/common/NotificationProvider';
import './EmployeeOverview.css';

const ITEMS_PER_PAGE = 8;
const MAX_VISIBLE_PAGE_BUTTONS = 5;

type EmployeeFilters = {
  vorname: string;
  nachname: string;
  standort: string;
  qualifikation: string;
};

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
  const [employeeToDelete, setEmployeeToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDraft, setFilterDraft] = useState<EmployeeFilters>({
    vorname: '',
    nachname: '',
    standort: '',
    qualifikation: '',
  });
  const [activeFilters, setActiveFilters] = useState<EmployeeFilters>({
    vorname: '',
    nachname: '',
    standort: '',
    qualifikation: '',
  });

  const qualificationOptions = useMemo(() => {
    const allQualifications = employees.flatMap((employee) => employee.qualifikationen ?? []);
    const uniqueQualifications = Array.from(new Set(allQualifications.map((qualification) => qualification.trim()).filter(Boolean)));
    return uniqueQualifications.sort((a, b) => a.localeCompare(b, 'de'));
  }, [employees]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(activeFilters).some((value) => value.trim() !== '');
  }, [activeFilters]);
  const hasDraftFilters = useMemo(() => {
    return Object.values(filterDraft).some((value) => value.trim() !== '');
  }, [filterDraft]);

  const filteredEmployees = useMemo(() => {
    const normalizedVorname = activeFilters.vorname.trim().toLowerCase();
    const normalizedNachname = activeFilters.nachname.trim().toLowerCase();
    const normalizedStandort = activeFilters.standort.trim().toLowerCase();
    const normalizedQualifikation = activeFilters.qualifikation.trim().toLowerCase();

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
  }, [activeFilters, employees]);

  const totalEmployees = filteredEmployees.length;
  const totalPages = Math.max(1, Math.ceil(totalEmployees / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredEmployees.slice(start, end);
  }, [currentPage, filteredEmployees]);

  const visiblePageNumbers = useMemo(
    () => getVisiblePageNumbers(totalPages, currentPage),
    [currentPage, totalPages],
  );

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setEmployeeToDelete(null);
  };

  const applyFilters = () => {
    setActiveFilters(filterDraft);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    const clearedFilters: EmployeeFilters = {
      vorname: '',
      nachname: '',
      standort: '',
      qualifikation: '',
    };
    setFilterDraft(clearedFilters);
    setActiveFilters(clearedFilters);
    setCurrentPage(1);
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
              value={filterDraft.vorname}
              onChange={(event) => setFilterDraft((previous) => ({ ...previous, vorname: event.target.value }))}
            />
          </div>
          <div className="filter-group">
            <label>Nachname</label>
            <input
              type="text"
              placeholder="Nachname eingeben"
              value={filterDraft.nachname}
              onChange={(event) => setFilterDraft((previous) => ({ ...previous, nachname: event.target.value }))}
            />
          </div>
          <div className="filter-group">
            <label>Ort</label>
            <input
              type="text"
              placeholder="Ort eingeben"
              value={filterDraft.standort}
              onChange={(event) => setFilterDraft((previous) => ({ ...previous, standort: event.target.value }))}
            />
          </div>
          <div className="filter-group">
            <label>Qualifikation</label>
            <select
              value={filterDraft.qualifikation}
              onChange={(event) => setFilterDraft((previous) => ({ ...previous, qualifikation: event.target.value }))}
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
            disabled={!hasActiveFilters && !hasDraftFilters}
          >
            Filter zurücksetzen
          </button>
          <button className="btn-filter" onClick={applyFilters}>Filter anwenden</button>
        </div>
      </div>

      <div className="table-container">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Vorname</th>
              <th>Nachname</th>
              <th>Ort</th>
              <th>Qualifikationen</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {totalEmployees === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  {hasActiveFilters ? 'Keine Mitarbeiter mit den aktuellen Filtern gefunden.' : 'Keine Mitarbeiter gefunden.'}
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
