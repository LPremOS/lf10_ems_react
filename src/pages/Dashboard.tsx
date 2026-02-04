import { useEffect, useState } from "react";
import { useQualificationApi } from "../hooks/useQualificationApi";
import type { QualificationType } from "../types/QualificationType";
import { useEmployeeManagement } from "../hooks/useEmployeeManagement";
import "./Dashboard.css";
import { DashboardCards } from "../components/Dashboard/DashboardCards";
import { DashboardQuicklinks } from "../components/Dashboard/DashboardQuicklinks";

const Dashboard = () => {
    const { employees, loading: loadingEmployees } = useEmployeeManagement();
    const { fetchQualifications, loading: loadingQualifications } = useQualificationApi();
    const [qualifications, setQualifications] = useState<QualificationType[]>([]);

    useEffect(() => {
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
