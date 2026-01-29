import { useNavigate } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { FiArrowLeft } from 'react-icons/fi';
import type { Employee } from '../types/Employee';
import './EmployeeDetailsView.css';


interface EmployeeDetailsViewProps {
  employee: Employee | null;
  loading?: boolean;
}

export function EmployeeDetailsView({ employee, loading }: EmployeeDetailsViewProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="employee-details">
        <p>Laden...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="employee-details">
        <p>Mitarbeiter nicht gefunden</p>
      </div>
    );
  }

  return (
    <div className="employee-details">
      <div className="details-header">
        <h1>Mitarbeiterdetails</h1>
        <div className="details-actions">
          <button
            className="btn-edit"
            onClick={() => navigate(`/employees/${employee.id}/edit`)}
          >
            <AiOutlineEdit /> Bearbeiten
          </button>
          <button
            className="btn-back"
            onClick={() => navigate('/employees')}
          >
            <FiArrowLeft /> Zurück zur Übersicht
          </button>
        </div>
      </div>

      <div className="details-content">
        <section className="details-section">
          <h2>Stammdaten</h2>
          <div className="details-grid">
            <div className="detail-item">
              <label>Vorname</label>
              <p>{employee.vorname}</p>
            </div>
            <div className="detail-item">
              <label>Nachname</label>
              <p>{employee.nachname}</p>
            </div>
            <div className="detail-item">
              <label>E-Mail</label>
              <p>{employee.email}</p>
            </div>
            <div className="detail-item">
              <label>Telefonnummer</label>
              <p>{employee.telefonnummer}</p>
            </div>
            <div className="detail-item">
              <label>Abteilung</label>
              <p>{employee.abteilung}</p>
            </div>
            <div className="detail-item">
              <label>Position</label>
              <p>{employee.position}</p>
            </div>
            <div className="detail-item full-width">
              <label>Standort</label>
              <p>{employee.standort}</p>
            </div>
          </div>
        </section>

        <section className="details-section">
          <h2>Zugewiesene Qualifikationen</h2>
          <div className="qualifications-list">
            {employee.qualifikationen.map((qual, index) => (
              <span key={index} className="qualification-badge">
                {qual}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
