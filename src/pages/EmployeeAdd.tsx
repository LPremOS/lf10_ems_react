import { EmployeeForm } from "./EmployeeForm";
import { useNavigate } from "react-router-dom";
import { useEmployeeApi } from "../hooks/useEmployeeApi";

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

export function EmployeeAdd() {
  const navigate = useNavigate();
  const { addEmployee, error } = useEmployeeApi();

  const handleSubmit = async (data: EmployeeFormData) => {
    const result = await addEmployee(data);
    if (result) {
      alert('Mitarbeiter wurde erfolgreich hinzugefügt!');
      navigate('/employees');
    } else if (error) {
      alert(`Fehler beim Hinzufügen: ${error}`);
    }
  };

  return <EmployeeForm onSubmit={handleSubmit} />;
}
