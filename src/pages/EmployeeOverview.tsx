import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './EmployeeOverview.css';

export function EmployeeOverview() {
  const navigate = useNavigate();

  // Mock Daten wie im Bild
  const employees = [
    {
      id: '1',
      vorname: 'Anna',
      nachname: 'Müller',
      ort: 'Berlin',
      qualifikationen: ['Projektmanagement', 'Softwareentwicklung']
    },
    {
      id: '2',
      vorname: 'Max',
      nachname: 'Schmidt',
      ort: 'München',
      qualifikationen: ['Datenanalyse', 'Cloud Computing']
    },
    {
      id: '3',
      vorname: 'Lena',
      nachname: 'Meier',
      ort: 'Hamburg',
      qualifikationen: ['Projektmanagement', 'Marketing', 'Vertrieb']
    },
    {
      id: '4',
      vorname: 'Paul',
      nachname: 'Wagner',
      ort: 'Frankfurt',
      qualifikationen: ['Softwareentwicklung', 'Cloud Computing']
    },
    {
      id: '5',
      vorname: 'Sophie',
      nachname: 'Schneider',
      ort: 'Köln',
      qualifikationen: ['Datenanalyse', 'Vertrieb']
    }
  ];

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
            {employees.map((employee, index) => (
              <tr key={index}>
                <td>{employee.vorname}</td>
                <td>{employee.nachname}</td>
                <td>{employee.ort}</td>
                <td>
                  <div className="qualifications">
                    {employee.qualifikationen.map((qual, idx) => (
                      <span key={idx} className="qualification-badge">
                        {qual}
                      </span>
                    ))}
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
                    <button className="action-btn action-btn-delete" title="Mitarbeiter löschen">
                      <AiOutlineDelete />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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

