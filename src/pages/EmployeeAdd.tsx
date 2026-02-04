import { EmployeeForm } from "./EmployeeForm";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEmployeeApi } from "../hooks/useEmployeeApi";
import { useNotification } from "../components/common/NotificationProvider";
import { EMPLOYEE_ROUTES } from "../features/employees/routes";
import type { EmployeeFormData } from "../features/employees/formModel";

// Seite "Mitarbeiter anlegen". Nutzt das gemeinsame EmployeeForm.
export function EmployeeAdd() {
  const navigate = useNavigate();
  const { addEmployee } = useEmployeeApi();
  const { notify } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (data: EmployeeFormData) => {
    // Doppelklick-Schutz waehrend laufender Anfrage.
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const result = await addEmployee(data);
      if (result.success) {
        // Bei Erfolg zur Uebersicht zurueck und Erfolgsmeldung anzeigen.
        notify({
          tone: "success",
          title: "Mitarbeiter erfolgreich angelegt",
        });
        navigate(EMPLOYEE_ROUTES.overview);
        return;
      }

      // API-Fehler werden lokal angezeigt und als Notification gespiegelt.
      setApiError(result.error);
      notify({
        tone: "error",
        title: "Mitarbeiter konnte nicht angelegt werden",
        message: result.error,
      });
    } finally {
      setIsSubmitting(false);
    }
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
