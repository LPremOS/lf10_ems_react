import { EmployeeForm } from "./EmployeeForm";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useEmployeeApi } from '../hooks/useEmployeeApi';
import { useNotification } from "../components/common/NotificationProvider";
import type { Employee } from '../types/Employee';

export function EmployeeEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchEmployeeById, updateEmployee, loading, error } = useEmployeeApi();
  const { notify } = useNotification();
  const [employee, setEmployee] = useState<Omit<Employee, 'id'> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployee = async () => {
      if (id) {
        const data = await fetchEmployeeById(id);
        setEmployee(data);
      }
    };
    loadEmployee();
  }, [fetchEmployeeById, id]);

  const handleSubmit = async (data: Omit<Employee, 'id'>) => {
    if (!id || isSubmitting) return;

    setIsSubmitting(true);
    setApiError(null);

    const result = await updateEmployee(id, data);
    if (result.success) {
      notify({
        tone: "success",
        title: "Änderungen gespeichert",
      });
      setIsSubmitting(false);
      navigate(`/employees/${id}`);
      return;
    }

    setApiError(result.error);
    notify({
      tone: "error",
      title: "Änderungen konnten nicht gespeichert werden",
      message: result.error,
    });
    setIsSubmitting(false);
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
      isEdit={true}
      isSubmitting={isSubmitting}
      apiError={apiError}
      submitLabel="Änderungen speichern"
    />
  );
}
