import { Layout } from "../components/Layout";
import { EmployeeDetailsView } from "./EmployeeDetailsView";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useEmployeeApi } from "../hooks/useEmployeeApi";

// Mock-Daten für die Detailansicht (bis Backend verbunden ist)
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

export function EmployeeDetails() {
    const { id } = useParams<{ id: string }>();
    const { fetchEmployeeById, loading } = useEmployeeApi();
    const [employee, setEmployee] = useState(null);

    useEffect(() => {
        const loadEmployee = async () => {
            if (id) {
                // Versuche zuerst das Backend
                const data = await fetchEmployeeById(id);

                // Fallback auf Mock-Daten, falls Backend nicht verfügbar
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

    return (
        <Layout>
            <EmployeeDetailsView employee={employee} loading={loading} />
        </Layout>
    );
}
