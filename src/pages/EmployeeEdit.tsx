import { EmployeeForm } from "./EmployeeForm";
import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useEmployeeApi } from "../hooks/useEmployeeApi";
import { useEmployeeRecord } from "../hooks/useEmployeeRecord";
import { useNotification } from "../components/common/NotificationProvider";
import { EMPLOYEE_ROUTES } from "../features/employees/routes";
import { toEmployeeFormData, type EmployeeFormData } from "../features/employees/formModel";

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
    if (!id || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setApiError(null);
    try {
      const result = await updateEmployee(id, data);
      if (result.success) {
        notify({
          tone: "success",
          title: "Änderungen gespeichert",
        });
        navigate(EMPLOYEE_ROUTES.details(id));
        return;
      }

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
    return <div>Lädt Mitarbeiterdaten...</div>;
  }

  if (!loading && !employee) {
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
