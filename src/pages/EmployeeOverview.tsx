import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useEmployeeManagement } from '../hooks/useEmployeeManagement';
import { useEmployeeApi } from '../hooks/useEmployeeApi';
import { Loader } from '../components/common/Loader';
import './EmployeeOverview.css';

export function EmployeeOverview() {
  const navigate = useNavigate();
  const { employees, loading, error, refreshEmployees } = useEmployeeManagement();
  const { deleteEmployee } = useEmployeeApi();

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Möchten Sie ${name} wirklich löschen?`)) {
      const success = await deleteEmployee(id);
      if (success) {
        alert('Mitarbeiter wurde erfolgreich gelöscht!');
        // Aktualisiere die Liste
        refreshEmployees();
      } else {
        alert('Fehler beim Löschen des Mitarbeiters!');
      }
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
            <input type="text" placeholder="Vorname eingeben" />
          </div>
          <div className="filter-group">
            <label>Nachname</label>
            <input type="text" placeholder="Nachname eingeben" />
          </div>
          <div className="filter-group">
            <label>Ort</label>
            <input type="text" placeholder="Ort eingeben" />
          </div>
          <div className="filter-group">
            <label>Qualifikation</label>
            <select>
              <option>Qualifikation auswählen</option>
            </select>
          </div>
        </div>
        <div className="filter-actions">
          <button className="btn-filter">Filter anwenden</button>
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
            {employees.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  Keine Mitarbeiter gefunden.
                </td>
              </tr>
            ) : (
              employees.map((employee, index) => (
                <tr key={index}>
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
                          onClick={() => handleDelete(employee.id, `${employee.vorname} ${employee.nachname}`)}
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
        <button className="pagination-btn">
          <FiChevronLeft /> Previous
        </button>
        <button className="pagination-number pagination-active">1</button>
        <button className="pagination-number">2</button>
        <button className="pagination-number">3</button>
        <button className="pagination-btn">
          Next <FiChevronRight />
        </button>
      </div>
    </div>
  );
}

