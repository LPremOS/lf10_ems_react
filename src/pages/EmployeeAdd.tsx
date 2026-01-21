import { Layout } from "../components/Layout";
import { EmployeeForm } from "./EmployeeForm";
import { useNavigate } from "react-router-dom";

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

  const handleSubmit = (data: EmployeeFormData) => {
    // Später: API-Call zum Backend
    console.log('Neuer Mitarbeiter:', data);

    // Temporär: Erfolgsmeldung und zurück zur Übersicht
    alert('Mitarbeiter wurde erfolgreich hinzugefügt!');
    navigate('/employees');
  };

  return (
    <Layout>
      <EmployeeForm onSubmit={handleSubmit} />
    </Layout>
  );
}
