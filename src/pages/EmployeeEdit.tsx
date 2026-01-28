import { Layout } from "../components/Layout";
import { EmployeeForm } from "./EmployeeForm";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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

// Mock-Daten (gleiche wie in EmployeeDetails.tsx)
const mockEmployees = [
  {
    id: '1',
    vorname: 'Anna',
    nachname: 'Müller',
    email: 'anna.mueller@hitecgmbh.de',
    telefonnummer: '+49 176 12345671',
    abteilung: 'IT',
    position: 'Projektmanagerin',
    standort: 'Berlin',
    qualifikationen: ['Projektmanagement', 'Softwareentwicklung', 'Agile Methoden', 'Teamleitung']
  },
  {
    id: '2',
    vorname: 'Max',
    nachname: 'Schmidt',
    email: 'max.schmidt@hitecgmbh.de',
    telefonnummer: '+49 176 12345672',
    abteilung: 'Datenanalyse',
    position: 'Data Scientist',
    standort: 'München',
    qualifikationen: ['Datenanalyse', 'Cloud Computing', 'Python', 'Machine Learning']
  },
  {
    id: '3',
    vorname: 'Lena',
    nachname: 'Meier',
    email: 'lena.meier@hitecgmbh.de',
    telefonnummer: '+49 176 12345673',
    abteilung: 'Vertrieb',
    position: 'Vertriebsleiterin',
    standort: 'Hamburg',
    qualifikationen: ['Projektmanagement', 'Marketing', 'Vertrieb', 'Kundenkommunikation']
  },
  {
    id: '4',
    vorname: 'Paul',
    nachname: 'Wagner',
    email: 'paul.wagner@hitecgmbh.de',
    telefonnummer: '+49 176 12345674',
    abteilung: 'Entwicklung',
    position: 'Senior Developer',
    standort: 'Frankfurt',
    qualifikationen: ['Softwareentwicklung', 'Cloud Computing', 'DevOps', 'Microservices']
  },
  {
    id: '5',
    vorname: 'Sophie',
    nachname: 'Schneider',
    email: 'sophie.schneider@hitecgmbh.de',
    telefonnummer: '+49 176 12345675',
    abteilung: 'Business Intelligence',
    position: 'BI Analyst',
    standort: 'Köln',
    qualifikationen: ['Datenanalyse', 'Vertrieb', 'SQL', 'Tableau']
  }
];

export function EmployeeEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchEmployeeById, loading } = useEmployeeApi();
  const [employee, setEmployee] = useState<EmployeeFormData | null>(null);

  useEffect(() => {
    const loadEmployee = async () => {
      if (id) {
        const data = await fetchEmployeeById(id);

        if (!data) {
          const mockEmployee = mockEmployees.find(emp => emp.id === id);
          setEmployee(mockEmployee || null);
        } else {
          setEmployee(data);
        }
      }
    };
    loadEmployee();
  }, [id, fetchEmployeeById]);

  const handleSubmit = (data: EmployeeFormData) => {
    // Später: API-Call zum Backend
    console.log('Mitarbeiter aktualisiert:', { id, ...data });

    // Temporär: Erfolgsmeldung und zurück zur Detailansicht
    alert('Änderungen wurden erfolgreich gespeichert!');
    navigate(`/employees/${id}`);
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: '2rem' }}>Laden...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <EmployeeForm
        initialData={employee}
        onSubmit={handleSubmit}
        isEdit={true}
      />
    </Layout>
  );
}
