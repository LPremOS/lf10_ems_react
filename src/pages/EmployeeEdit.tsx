import { EmployeeForm } from "./EmployeeForm";
import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useEmployeeApi } from "../hooks/useEmployeeApi";
import { useEmployeeRecord } from "../hooks/useEmployeeRecord";
import { useNotification } from "../components/common/NotificationProvider";
import { EMPLOYEE_ROUTES } from "../features/employees/routes";
import { toEmployeeFormData, type EmployeeFormData } from "../features/employees/formModel";

// Seite "Mitarbeiter bearbeiten". Laedt vorhandene Daten und uebergibt sie ans Formular.
export function EmployeeEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchEmployeeById, updateEmployee, loading, error } = useEmployeeApi();
  const employeeRecord = useEmployeeRecord(id, fetchEmployeeById);
  const employee = useMemo(
    () => (employeeRecord ? toEmployeeFormData(employeeRecord) : null),
    [employeeRecord],
  );
  const { notify } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (data: EmployeeFormData) => {
    // Ohne ID oder bei laufender Anfrage darf nicht gespeichert werden.
    if (!id || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setApiError(null);
    try {
      const result = await updateEmployee(id, data);
      if (result.success) {
        // Nach erfolgreichem Speichern zur Detailansicht springen.
        notify({
          tone: "success",
          title: "Änderungen gespeichert",
        });
        navigate(EMPLOYEE_ROUTES.details(id));
        return;
      }

      // Fehler im Formular anzeigen und als Notification ausgeben.
      setApiError(result.error);
      notify({
        tone: "error",
        title: "Änderungen konnten nicht gespeichert werden",
        message: result.error,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !employee) {
    // Initialer Ladezustand solange der Datensatz noch nicht da ist.
    return <div>Lädt Mitarbeiterdaten...</div>;
  }

  if (!loading && !employee) {
    // Nach abgeschlossenem Laden, aber ohne Datensatz -> Fehlermeldung.
    return <div className="text-danger">Fehler: {error ?? "Mitarbeiter nicht gefunden."}</div>;
  }

  return (
    <EmployeeForm
      initialData={employee}
      onSubmit={handleSubmit}
      isEdit
      isSubmitting={isSubmitting}
      apiError={apiError}
      submitLabel="Änderungen speichern"
    />
  );
}
