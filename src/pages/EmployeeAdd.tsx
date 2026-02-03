import { EmployeeForm } from "./EmployeeForm";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEmployeeApi } from "../hooks/useEmployeeApi";
import { useNotification } from "../components/common/NotificationProvider";
import type { Employee } from "../types/Employee";

export function EmployeeAdd() {
  const navigate = useNavigate();
  const { addEmployee } = useEmployeeApi();
  const { notify } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (data: Omit<Employee, 'id'>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setApiError(null);

    const result = await addEmployee(data);
    if (result.success) {
      notify({
        tone: "success",
        title: "Mitarbeiter erfolgreich angelegt",
      });
      setIsSubmitting(false);
      navigate('/employees');
      return;
    }

    setApiError(result.error);
    notify({
      tone: "error",
      title: "Mitarbeiter konnte nicht angelegt werden",
      message: result.error,
    });
    setIsSubmitting(false);
  };

  return (
    <EmployeeForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      apiError={apiError}
      submitLabel="Mitarbeiter anlegen"
    />
  );
}
