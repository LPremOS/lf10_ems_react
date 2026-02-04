import { AiOutlineEdit } from "react-icons/ai";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import type { Employee } from "../types/Employee";
import { EMPLOYEE_ROUTES } from "../features/employees/routes";
import "../styles/EmployeeDetailsView.css";

// Reine Presentational-Komponente fuer die Mitarbeiterdetails.
interface EmployeeDetailsViewProps {
    employee: Employee | null;
    loading?: boolean;
    error?: string | null;
}

type EmployeeDetailItem = {
    label: string;
    value: string;
};

// Zeigt Lade-/Fehler-/Leerdatenzustand und bei Erfolg alle Mitarbeiterdaten an.
export function EmployeeDetailsView({
    employee,
    loading = false,
    error = null,
}: EmployeeDetailsViewProps) {
    const navigate = useNavigate();

    // Ladezustand, solange noch kein Datensatz vorliegt.
    if (loading && !employee) {
        return (
            <div className="employee-details">
                <p>Laden...</p>
            </div>
        );
    }

    // Expliziter Fehlerzustand.
    if (error) {
        return (
            <div className="employee-details">
                <p className="text-danger">Fehler: {error}</p>
            </div>
        );
    }

    // Kein Fehler, aber auch kein Datensatz gefunden.
    if (!employee) {
        return (
            <div className="employee-details">
                <p>Mitarbeiter nicht gefunden</p>
            </div>
        );
    }

    // Struktur fuer wiederverwendbares Rendering der Stammdaten.
    const detailItems: EmployeeDetailItem[] = [
        { label: "Vorname", value: employee.vorname },
        { label: "Nachname", value: employee.nachname },
        { label: "Telefonnummer", value: employee.telefonnummer },
        { label: "Standort", value: employee.standort },
        { label: "Straße", value: employee.street },
        { label: "PLZ", value: employee.postcode },
    ];

    return (
        <div className="employee-details">
            <div className="details-header">
                <h1>Mitarbeiterdetails</h1>
                <div className="details-actions">
                    <button
                        className="btn-edit"
                        // Direkter Wechsel in die Bearbeitung.
                        onClick={() => navigate(EMPLOYEE_ROUTES.edit(employee.id))}
                    >
                        <AiOutlineEdit /> Bearbeiten
                    </button>
                    <button
                        className="btn-back"
                        // Zurueck in die Mitarbeiterliste.
                        onClick={() => navigate(EMPLOYEE_ROUTES.overview)}
                    >
                        <FiArrowLeft /> Zurück zur Übersicht
                    </button>
                </div>
            </div>

            <div className="details-content">
                <section className="details-section">
                    <h2>Stammdaten</h2>
                    <div className="details-grid">
                        {detailItems.map((item) => (
                            <div key={item.label} className="detail-item">
                                <label>{item.label}</label>
                                <p>{item.value || "-"}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="details-section">
                    <h2>Zugewiesene Qualifikationen</h2>
                    <div className="qualifications-list">
                        {employee.qualifikationen.length > 0 ? (
                            employee.qualifikationen.map((qualification) => (
                                <span key={qualification} className="qualification-badge">
                                    {qualification}
                                </span>
                            ))
                        ) : (
                            <p className="text-muted mb-0">Keine Qualifikationen zugewiesen.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
