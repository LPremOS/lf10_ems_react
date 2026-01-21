import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import './EmployeeForm.css';

interface EmployeeFormData {
  vorname: string;
  nachname: string;
  email: string;
  telefonnummer: string;
  abteilung: string;
  position: string;
  standort: string; // im UI als "Ort"
  qualifikationen: string[];
}

interface EmployeeFormProps {
  initialData?: EmployeeFormData | null;
  onSubmit: (data: EmployeeFormData) => void;
  isEdit?: boolean;
}

// Verfügbare Qualifikationen
const availableQualifications = [
  'Projektmanagement',
  'Cloud-Architektur',
  'Datenbank-Administration',
  'Agile Methoden',
  'Cybersicherheit',
  'Teamleitung',
  'DevOps',
  'Qualitätssicherung',
  'Softwareentwicklung',
  'Datenanalyse',
  'Marketing',
  'Vertrieb',
  'Python',
  'Machine Learning',
  'Kundenkommunikation',
  'SQL',
  'Tableau',
  'Microservices'
];

export function EmployeeForm({ initialData, onSubmit, isEdit = false }: EmployeeFormProps) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<EmployeeFormData>({
    vorname: initialData?.vorname || '',
    nachname: initialData?.nachname || '',
    email: initialData?.email || '',
    telefonnummer: initialData?.telefonnummer || '',
    abteilung: initialData?.abteilung || '',
    position: initialData?.position || '',
    standort: initialData?.standort || '',
    qualifikationen: initialData?.qualifikationen || []
  });

  // Dropdown-Auswahl für "Qualifikation hinzufügen"
  const [selectedQualification, setSelectedQualification] = useState<string>('');

  const selectableQualifications = useMemo(() => {
    const selected = new Set(formData.qualifikationen);
    return availableQualifications.filter(q => !selected.has(q));
  }, [formData.qualifikationen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const removeQualification = (qualification: string) => {
    setFormData(prev => ({
      ...prev,
      qualifikationen: prev.qualifikationen.filter(q => q !== qualification)
    }));
  };

  const addQualification = () => {
    const q = selectedQualification.trim();
    if (!q) return;

    setFormData(prev => ({
      ...prev,
      qualifikationen: prev.qualifikationen.includes(q) ? prev.qualifikationen : [...prev.qualifikationen, q]
    }));

    setSelectedQualification('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
      <div className="employee-form-page">
        <div className="employee-form-container">
          <h1 className="page-title">{isEdit ? 'Mitarbeiter bearbeiten' : 'Mitarbeiter hinzufügen'}</h1>

          <form onSubmit={handleSubmit} className="employee-form">
            {/* Stammdaten */}
            <section className="card">
              <h2 className="card-title">Stammdaten</h2>

              <div className="grid-12">
                {/* Row 1: Vorname | Nachname | Ort */}
                <div className="field span-4">
                  <label htmlFor="vorname">Vorname</label>
                  <input
                      type="text"
                      id="vorname"
                      name="vorname"
                      value={formData.vorname}
                      onChange={handleInputChange}
                      required
                  />
                </div>

                <div className="field span-4">
                  <label htmlFor="nachname">Nachname</label>
                  <input
                      type="text"
                      id="nachname"
                      name="nachname"
                      value={formData.nachname}
                      onChange={handleInputChange}
                      required
                  />
                </div>

                <div className="field span-4">
                  <label htmlFor="standort">Ort</label>
                  <input
                      type="text"
                      id="standort"
                      name="standort"
                      value={formData.standort}
                      onChange={handleInputChange}
                      required
                  />
                </div>

                {/* Row 2: E-Mail (breit) | Telefonnummer | Abteilung | Position */}
                <div className="field span-5">
                  <label htmlFor="email">E-Mail:</label>
                  <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                  />
                </div>

                <div className="field span-3">
                  <label htmlFor="telefonnummer">Telefonnummer:</label>
                  <input
                      type="tel"
                      id="telefonnummer"
                      name="telefonnummer"
                      value={formData.telefonnummer}
                      onChange={handleInputChange}
                      required
                  />
                </div>

                <div className="field span-2">
                  <label htmlFor="abteilung">Abteilung</label>
                  <input
                      type="text"
                      id="abteilung"
                      name="abteilung"
                      value={formData.abteilung}
                      onChange={handleInputChange}
                      required
                  />
                </div>

                <div className="field span-2">
                  <label htmlFor="position">Position</label>
                  <input
                      type="text"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                  />
                </div>
              </div>
            </section>

            {/* Qualifikationen */}
            <section className="card">
              <h2 className="card-title">Qualifikationen</h2>

              <div className="subsection">
                <h3 className="subsection-title">Zugewiesene Qualifikationen</h3>

                {formData.qualifikationen.length === 0 ? (
                    <p className="hint">Noch keine Qualifikationen zugewiesen.</p>
                ) : (
                    <div className="chips">
                      {formData.qualifikationen.map(q => (
                          <div key={q} className="chip">
                            <span className="chip-text">{q}</span>
                            <button
                                type="button"
                                className="chip-remove"
                                onClick={() => removeQualification(q)}
                                aria-label={`Qualifikation entfernen: ${q}`}
                                title="Entfernen"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                      ))}
                    </div>
                )}
              </div>

              <div className="subsection">
                <h3 className="subsection-title">Qualifikation hinzufügen</h3>

                <div className="field">
                  <label htmlFor="qualificationSelect">Verfügbare Qualifikationen</label>

                  <div className="add-row">
                    <select
                        id="qualificationSelect"
                        className="select"
                        value={selectedQualification}
                        onChange={(e) => setSelectedQualification(e.target.value)}
                    >
                      <option value="">Wählen Sie eine Qualifikation aus</option>
                      {selectableQualifications.map(q => (
                          <option key={q} value={q}>{q}</option>
                      ))}
                    </select>

                    <button
                        type="button"
                        className="btn-add"
                        onClick={addQualification}
                        disabled={!selectedQualification}
                    >
                      <FiPlus /> Hinzufügen
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="actions">
              <button type="button" className="btn-secondary" onClick={() => navigate('/employees')}>
                Abbrechen
              </button>
              <button type="submit" className="btn-primary">
                Speichern
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}
