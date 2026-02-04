import { useParams } from "react-router-dom";
import { useEmployeeApi } from "../hooks/useEmployeeApi";
import { useEmployeeRecord } from "../hooks/useEmployeeRecord";
import { EmployeeDetailsView } from "./EmployeeDetailsView";

// Container-Seite fuer die Mitarbeiter-Detailansicht.
export function EmployeeDetails() {
    const { id } = useParams<{ id: string }>();
    // API-Zugriff + globaler Lade/Fehler-Status.
    const { fetchEmployeeById, loading, error } = useEmployeeApi();
    // Datensatz wird ueber einen kleinen Spezial-Hook geladen.
    const employee = useEmployeeRecord(id, fetchEmployeeById);

    return <EmployeeDetailsView employee={employee} loading={loading} error={error} />;
}
