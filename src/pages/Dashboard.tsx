import { useEffect, useState } from "react";
import { useQualificationApi } from "../hooks/useQualificationApi";
import type { QualificationType } from "../types/QualificationType";
import { useEmployeeManagement } from "../hooks/useEmployeeManagement";
import "../styles/Dashboard.css";
import { DashboardCards } from "../components/Dashboard/DashboardCards";
import { DashboardQuicklinks } from "../components/Dashboard/DashboardQuicklinks";

// Startseite mit Kennzahlen und Navigation in die Verwaltungsbereiche.
const Dashboard = () => {
    // Mitarbeiterzahl kommt aus dem zentralen Mitarbeiter-Hook.
    const { employees, loading: loadingEmployees } = useEmployeeManagement();
    const { fetchQualifications, loading: loadingQualifications } = useQualificationApi();
    const [qualifications, setQualifications] = useState<QualificationType[]>([]);

    useEffect(() => {
        // Qualifikationen werden fuer die zweite Dashboard-Kennzahl geladen.
        const loadQualifications = async () => {
            const data = await fetchQualifications();
            if (Array.isArray(data)) {
                setQualifications(data);
            }
        };

        loadQualifications();
    }, [fetchQualifications]);

    return (
        <div>
            <div className="dashboard-content-wrapper">
                <h1 className="dashboard-title">Dashboard</h1>
                <DashboardCards 
                  // Anzahl direkt aus den geladenen Listen.
                  employeesCount={employees.length}
                  qualificationsCount={qualifications.length}
                  loadingEmployees={loadingEmployees}
                  loadingQualifications={loadingQualifications}
                />

                
                <h2 className="dashboard-subtitle">Schnellzugriff</h2>
                <DashboardQuicklinks />
            </div>
        </div>
    );
};

export default Dashboard;
