import { EmployeeForm } from "./EmployeeForm";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useEmployeeApi } from '../hooks/useEmployeeApi';

interface EmployeeFormData {
  vorname: string;
  nachname: string;
  email: string;
  telefonnummer: string;
  abteilung: string;
  position: string;
  standort: string;
  qualifikationen: string[];
}

export function EmployeeEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchEmployeeById, updateEmployee, loading, error } = useEmployeeApi();
  const [employee, setEmployee] = useState<EmployeeFormData | null>(null);

  useEffect(() => {
    const loadEmployee = async () => {
      if (id) {
        const data = await fetchEmployeeById(id);
        setEmployee(data);
      }
    };
    loadEmployee();
  }, [fetchEmployeeById, id]);

  const handleSubmit = async (data: EmployeeFormData) => {
    if (id) {
      const result = await updateEmployee(id, data);
      if (result) {
        alert('Änderungen wurden erfolgreich gespeichert!');
        navigate(`/employees/${id}`);
      } else if (error) {
        alert(`Fehler beim Speichern: ${error}`);
      }
    }
  };

  if (loading && !employee) {
    return <div>Lädt Mitarbeiterdaten...</div>;
  }

  return (
    <EmployeeForm
      initialData={employee}
      onSubmit={handleSubmit}
      isEdit={true}
    />
  );
}
