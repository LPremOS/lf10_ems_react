import { AiOutlineEdit } from "react-icons/ai";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import type { Employee } from "../types/Employee";
import "../styles/EmployeeDetailsView.css";

interface EmployeeDetailsViewProps {
    employee: Employee | null;
    loading?: boolean;
    error?: string | null;
}

type EmployeeDetailItem = {
    label: string;
    value: string;
};

export function EmployeeDetailsView({
    employee,
    loading = false,
    error = null,
}: EmployeeDetailsViewProps) {
    const navigate = useNavigate();

    if (loading && !employee) {
        return (
            <div className="employee-details">
                <p>Laden...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="employee-details">
                <p className="text-danger">Fehler: {error}</p>
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
                        onClick={() => navigate(`/employees/${employee.id}/edit`)}
                    >
                        <AiOutlineEdit /> Bearbeiten
                    </button>
                    <button
                        className="btn-back"
                        onClick={() => navigate("/employees")}
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
